import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function generateImages() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // SVG Emblem string
  const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style="width:100%; height:100%;">
      <defs>
        <path id="rc-top-arc" d="M 95,256 A 161,161 0 0,1 417,256" fill="none" />
        <path id="rc-bot-arc" d="M 115,256 A 141,141 0 0,0 397,256" fill="none" />
        <path id="rc-ribbon-arc" d="M 70,385 Q 256,435 442,385" fill="none" />
      </defs>
      <circle cx="256" cy="256" r="250" fill="#F7EBDC" />
      <circle cx="256" cy="256" r="242" fill="#1F1009" />
      <circle cx="256" cy="256" r="230" fill="none" stroke="#F7EBDC" stroke-width="8" />
      <circle cx="256" cy="256" r="218" fill="none" stroke="#D9825B" stroke-width="3" />
      <text fill="#F7EBDC" font-size="56" font-weight="900" font-family="Georgia, serif" letter-spacing="14">
        <textPath href="#rc-top-arc" start-offset="50%" text-anchor="middle">RADHA</textPath>
      </text>
      <text fill="#D9825B" font-size="22" font-weight="800" font-family="sans-serif" letter-spacing="6">
        <textPath href="#rc-bot-arc" start-offset="50%" text-anchor="middle">ESTD  2026</textPath>
      </text>
      <circle cx="256" cy="236" r="142" fill="#543118" />
      <circle cx="256" cy="236" r="136" fill="none" stroke="#F7EBDC" stroke-width="4" />
      <circle cx="256" cy="236" r="128" fill="none" stroke="#D9825B" stroke-width="2" opacity="0.8" />
      <clipPath id="rc-medal-clip"><circle cx="256" cy="236" r="126" /></clipPath>
      <g clip-path="url(#rc-medal-clip)" stroke="#F7EBDC" stroke-width="1.5" opacity="0.25">
        <line x1="110" y1="150" x2="402" y2="150" />
        <line x1="110" y1="180" x2="402" y2="180" />
        <line x1="110" y1="210" x2="402" y2="210" />
        <line x1="110" y1="240" x2="402" y2="240" />
        <line x1="110" y1="270" x2="402" y2="270" />
        <line x1="110" y1="300" x2="402" y2="300" />
      </g>
      <g fill="#F7EBDC" opacity="0.95">
        <path d="M 234,180 C 220,150 260,130 276,105 C 282,96 284,85 277,75 C 272,92 244,110 234,130 C 223,150 230,165 234,180 Z" />
        <path d="M 264,178 C 250,152 284,134 300,112 C 306,104 310,95 304,85 C 299,99 272,118 264,134 C 253,152 261,165 264,178 Z" />
        <path d="M 216,190 C 206,168 234,154 245,135 C 250,127 252,120 247,112 C 243,123 226,137 219,149 C 210,165 215,180 216,190 Z" />
      </g>
      <ellipse cx="248" cy="192" rx="66" ry="14" fill="#F7EBDC" stroke="#1F1009" stroke-width="2.5" />
      <ellipse cx="248" cy="193" rx="58" ry="10" fill="#1F1009" />
      <path d="M 182,192 L 192,278 C 195,292 214,304 248,304 C 282,304 301,292 304,278 L 314,192 Z" fill="#F7EBDC" />
      <path d="M 182,192 L 192,278 C 195,292 214,304 248,304 C 282,304 301,292 304,192" fill="none" stroke="#F7EBDC" stroke-width="3.5" />
      <path d="M 312,208 C 350,212 358,258 306,278" fill="none" stroke="#F7EBDC" stroke-width="12" stroke-linecap="round" />
      <path d="M 312,208 C 350,212 358,258 306,278" fill="none" stroke="#543118" stroke-width="5" stroke-linecap="round" />
      <ellipse cx="248" cy="302" rx="78" ry="16" fill="#F7EBDC" stroke="#1F1009" stroke-width="2.5" />
      <ellipse cx="248" cy="312" rx="92" ry="18" fill="#F7EBDC" stroke="#1F1009" stroke-width="2.5" />
      <path d="M 292,312 C 322,302 356,290 372,276 C 380,288 366,312 338,324 C 320,330 298,332 276,328 Z" fill="#F7EBDC" opacity="0.9" />
      <g transform="translate(118, 240)">
        <ellipse cx="0" cy="0" rx="16" ry="25" fill="#F7EBDC" stroke="#1F1009" stroke-width="1.5" />
        <path d="M -1,-20 C 7,-9 -7,9 1,20" fill="none" stroke="#1F1009" stroke-width="3" stroke-linecap="round" />
      </g>
      <g transform="translate(394, 240)">
        <ellipse cx="0" cy="0" rx="16" ry="25" fill="#F7EBDC" stroke="#1F1009" stroke-width="1.5" />
        <path d="M -1,-20 C 7,-9 -7,9 1,20" fill="none" stroke="#1F1009" stroke-width="3" stroke-linecap="round" />
      </g>
      <path d="M 45,365 L 88,340 L 88,395 L 45,418 L 64,390 Z" fill="#C8B299" stroke="#1F1009" stroke-width="3" />
      <path d="M 467,365 L 424,340 L 424,395 L 467,418 L 448,390 Z" fill="#C8B299" stroke="#1F1009" stroke-width="3" />
      <path d="M 55,350 Q 256,392 457,350 L 475,398 Q 256,445 37,398 Z" fill="#EDE0D0" stroke="#1F1009" stroke-width="3.5" />
      <text fill="#1F1009" font-size="42" font-weight="900" font-family="sans-serif" letter-spacing="6">
        <textPath href="#rc-ribbon-arc" start-offset="50%" text-anchor="middle">COFFEE CAFE</textPath>
      </text>
    </svg>
  `;

  // 1. Generate 1200x630 Open Graph Banner
  await page.setViewportSize({ width: 1200, height: 630 });
  const ogHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          width: 1200px;
          height: 630px;
          background: radial-gradient(circle at 60% 40%, #3E2318 0%, #170B06 70%, #0D0503 100%);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 60px 80px;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          color: #F7EBDC;
          overflow: hidden;
          position: relative;
        }
        body::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 20% 80%, rgba(217, 130, 91, 0.15), transparent 40%),
                      radial-gradient(circle at 80% 20%, rgba(247, 235, 220, 0.1), transparent 50%);
          pointer-events: none;
        }
        .content {
          max-width: 620px;
          z-index: 2;
        }
        .badge {
          display: inline-block;
          padding: 8px 18px;
          background: rgba(217, 130, 91, 0.18);
          border: 1px solid rgba(217, 130, 91, 0.4);
          border-radius: 999px;
          color: #D9825B;
          font-size: 16px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 24px;
        }
        h1 {
          font-size: 64px;
          font-weight: 900;
          line-height: 1.1;
          color: #F7EBDC;
          margin-bottom: 16px;
          letter-spacing: -1px;
        }
        h1 span {
          color: #D9825B;
        }
        p {
          font-size: 24px;
          color: rgba(247, 235, 220, 0.85);
          line-height: 1.4;
          margin-bottom: 32px;
          font-weight: 400;
        }
        .features {
          display: flex;
          gap: 16px;
        }
        .feature-pill {
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.07);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 10px;
          font-size: 15px;
          font-weight: 600;
          color: #F7EBDC;
        }
        .logo-wrap {
          width: 380px;
          height: 380px;
          filter: drop-shadow(0 25px 35px rgba(0,0,0,0.6));
          z-index: 2;
        }
      </style>
    </head>
    <body>
      <div class="content">
        <div class="badge">☕ Artisanal Cafe & POS</div>
        <h1>Radha<span>Cafe</span></h1>
        <p>A modern cafe management, digital billing, real-time analytics & thermal printing system.</p>
        <div class="features">
          <div class="feature-pill">⚡ Digital Billing</div>
          <div class="feature-pill">📊 Live Analytics</div>
          <div class="feature-pill">🖨️ Thermal Printing</div>
        </div>
      </div>
      <div class="logo-wrap">
        ${svgContent}
      </div>
    </body>
    </html>
  `;

  await page.setContent(ogHtml);
  await page.screenshot({ path: path.join(process.cwd(), 'public', 'og-image.png'), type: 'png' });
  console.log('Created public/og-image.png (1200x630)');

  // 2. Generate 512x512 Square Logo PNG
  await page.setViewportSize({ width: 512, height: 512 });
  const logoHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          width: 512px;
          height: 512px;
          background: #170B06;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }
        .logo { width: 464px; height: 464px; }
      </style>
    </head>
    <body>
      <div class="logo">${svgContent}</div>
    </body>
    </html>
  `;

  await page.setContent(logoHtml);
  await page.screenshot({ path: path.join(process.cwd(), 'public', 'logo.png'), type: 'png' });
  await page.screenshot({ path: path.join(process.cwd(), 'public', 'apple-touch-icon.png'), type: 'png' });
  await page.screenshot({ path: path.join(process.cwd(), 'public', 'favicon.png'), type: 'png' });
  console.log('Created public/logo.png, public/apple-touch-icon.png, public/favicon.png (512x512)');

  await browser.close();
}

generateImages().catch(console.error);
