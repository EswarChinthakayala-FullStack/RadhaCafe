export const ROUTES = {
  PUBLIC: {
    HOME: '/',
    LOGIN: '/login',
    GALLERY: '/gallery',
    DISCUSSIONS: '/discussions',
    MENU: '/menu',
    CONTACT: '/contact',
  },
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    ORDERS: '/admin/orders',
    NEW_ORDER: '/admin/orders/new',
    MENU: '/admin/menu',
    ANALYTICS: '/admin/analytics',
    GALLERY: '/admin/gallery',
    DISCUSSIONS: '/admin/discussions',
    PRINTER: '/admin/printer',
    SETTINGS: '/admin/settings',
  },
} as const;
