const CACHE_NAME = 'radhacafe-shell-v1';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/favicon.png',
  '/logo.png',
];

// Install: Pre-cache core application shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(PRECACHE_ASSETS).catch((err) => {
          console.warn('[SW] Pre-cache warning:', err);
        });
      })
      .then(() => self.skipWaiting())
  );
});

// Activate: Clean up stale caches and claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
            return null;
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch Interceptor
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Ignore non-GET requests, WebSockets, chrome extensions, and Vite HMR
  if (
    request.method !== 'GET' ||
    url.protocol === 'ws:' ||
    url.protocol === 'wss:' ||
    url.protocol.startsWith('chrome-extension') ||
    url.pathname.includes('/@vite/') ||
    url.pathname.includes('/@fs/') ||
    url.pathname.includes('/@id/')
  ) {
    return;
  }

  // 1. Supabase API calls -> Pass through directly to network
  if (url.hostname.includes('supabase.co')) {
    return;
  }

  // 2. Navigation requests (SPA pages e.g. /admin/orders/new) -> Network-First with cached index.html fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', responseClone));
          }
          return response;
        })
        .catch(async () => {
          const cachedShell = (await caches.match('/index.html')) || (await caches.match('/'));
          if (cachedShell) return cachedShell;
          return new Response(
            '<!DOCTYPE html><html><body><h1>RadhaCafe POS</h1><p>Application is loading offline...</p></body></html>',
            { headers: { 'Content-Type': 'text/html' } }
          );
        })
    );
    return;
  }

  // 3. Static Assets (JS, CSS, Fonts, Images) -> Cache-First with network fallback
  if (
    url.pathname.startsWith('/assets/') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js')
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Return cache and update in background
          fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
              }
            })
            .catch(() => {});
          return cachedResponse;
        }

        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // 4. Default strategy
  event.respondWith(
    fetch(request).catch(async () => {
      const match = await caches.match(request);
      if (match) return match;
      throw new Error(`[SW] Network failed and not in cache: ${request.url}`);
    })
  );
});
