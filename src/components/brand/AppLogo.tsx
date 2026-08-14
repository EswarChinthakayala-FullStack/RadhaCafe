import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils/cn';

/**
 * Radha Coffee Cafe — Official Vintage Circular Seal Emblem
 */
export function RadhaCafeLogo({ className }: { className?: string }) {
  // Primary palette
  const dark = '#1F1009';
  const cream = '#F7EBDC';
  const midBrown = '#543118';
  const accent = '#D9825B';
  const ribbonFill = '#EDE0D0';
  const ribbonShade = '#C8B299';

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      className={cn('w-full h-full block', className)}
      aria-hidden="true"
    >
      <defs>
        {/* Top arc for RADHA */}
        <path id="rc-top-arc" d="M 95,256 A 161,161 0 0,1 417,256" fill="none" />
        {/* Bottom arc for ESTD 2026 */}
        <path id="rc-bot-arc" d="M 115,256 A 141,141 0 0,0 397,256" fill="none" />
        {/* Ribbon text arc */}
        <path id="rc-ribbon-arc" d="M 70,385 Q 256,435 442,385" fill="none" />
      </defs>

      {/* ═══════════ OUTER RING & SHIELD ═══════════ */}
      <circle cx="256" cy="256" r="250" fill={cream} />
      <circle cx="256" cy="256" r="242" fill={dark} />
      <circle cx="256" cy="256" r="230" fill="none" stroke={cream} strokeWidth="8" />
      <circle cx="256" cy="256" r="218" fill="none" stroke={accent} strokeWidth="3" />

      {/* ═══════════ ARCHED TEXT: RADHA ═══════════ */}
      <text
        fill={cream}
        fontSize="56"
        fontWeight="900"
        fontFamily="Georgia, 'Times New Roman', serif"
        letterSpacing="14"
      >
        <textPath href="#rc-top-arc" startOffset="50%" textAnchor="middle">
          RADHA
        </textPath>
      </text>

      {/* ═══════════ ARCHED TEXT: ESTD 2026 ═══════════ */}
      <text
        fill={accent}
        fontSize="22"
        fontWeight="800"
        fontFamily="'Trebuchet MS', Arial, sans-serif"
        letterSpacing="6"
      >
        <textPath href="#rc-bot-arc" startOffset="50%" textAnchor="middle">
          ESTD  2026
        </textPath>
      </text>

      {/* ═══════════ CENTER MEDALLION ═══════════ */}
      <circle cx="256" cy="236" r="142" fill={midBrown} />
      <circle cx="256" cy="236" r="136" fill="none" stroke={cream} strokeWidth="4" />
      <circle cx="256" cy="236" r="128" fill="none" stroke={accent} strokeWidth="2" opacity="0.8" />

      {/* Horizontal hatch lines inside medallion */}
      <clipPath id="rc-medal-clip">
        <circle cx="256" cy="236" r="126" />
      </clipPath>
      <g clipPath="url(#rc-medal-clip)" stroke={cream} strokeWidth="1.5" opacity="0.25">
        {[135, 150, 165, 180, 195, 210, 225, 240, 255, 270, 285, 300, 315].map((y) => (
          <line key={y} x1="110" y1={y} x2="402" y2={y} />
        ))}
      </g>

      {/* ═══════════ COFFEE CUP & STEAM ═══════════ */}
      {/* Steam lines */}
      <g fill={cream} opacity="0.95">
        <path d="M 234,180 C 220,150 260,130 276,105 C 282,96 284,85 277,75 C 272,92 244,110 234,130 C 223,150 230,165 234,180 Z" />
        <path d="M 264,178 C 250,152 284,134 300,112 C 306,104 310,95 304,85 C 299,99 272,118 264,134 C 253,152 261,165 264,178 Z" />
        <path d="M 216,190 C 206,168 234,154 245,135 C 250,127 252,120 247,112 C 243,123 226,137 219,149 C 210,165 215,180 216,190 Z" />
      </g>

      {/* Cup rim (ellipse) */}
      <ellipse cx="248" cy="192" rx="66" ry="14" fill={cream} stroke={dark} strokeWidth="2.5" />
      {/* Cup inner liquid */}
      <ellipse cx="248" cy="193" rx="58" ry="10" fill={dark} />
      <ellipse cx="248" cy="194" rx="52" ry="8" fill="#150904" />

      {/* Cup body */}
      <path d="M 182,192 L 192,278 C 195,292 214,304 248,304 C 282,304 301,292 304,278 L 314,192 Z" fill={cream} />
      {/* Cup body hatching */}
      <g stroke={dark} strokeWidth="1.5" opacity="0.3">
        <path d="M 186,206 Q 248,213 310,206" fill="none" />
        <path d="M 188,220 Q 248,227 308,220" fill="none" />
        <path d="M 190,234 Q 248,241 306,234" fill="none" />
        <path d="M 191,248 Q 248,255 305,248" fill="none" />
        <path d="M 193,262 Q 248,269 303,262" fill="none" />
        <path d="M 195,276 Q 248,283 301,276" fill="none" />
      </g>
      {/* Cup body outline */}
      <path d="M 182,192 L 192,278 C 195,292 214,304 248,304 C 282,304 301,292 304,192" fill="none" stroke={cream} strokeWidth="3.5" />

      {/* Cup handle */}
      <path
        d="M 312,208 C 350,212 358,258 306,278"
        fill="none"
        stroke={cream}
        strokeWidth="12"
        strokeLinecap="round"
      />
      <path
        d="M 312,208 C 350,212 358,258 306,278"
        fill="none"
        stroke={midBrown}
        strokeWidth="5"
        strokeLinecap="round"
      />

      {/* Saucer */}
      <ellipse cx="248" cy="302" rx="78" ry="16" fill={cream} stroke={dark} strokeWidth="2.5" />
      <ellipse cx="248" cy="312" rx="92" ry="18" fill={cream} stroke={dark} strokeWidth="2.5" />

      {/* Serving hand silhouette */}
      <path
        d="M 292,312 C 322,302 356,290 372,276 C 380,288 366,312 338,324 C 320,330 298,332 276,328 Z"
        fill={cream}
        opacity="0.9"
      />

      {/* ═══════════ COFFEE BEANS (LEFT & RIGHT) ═══════════ */}
      <g transform="translate(118, 240)">
        <ellipse cx="0" cy="0" rx="16" ry="25" fill={cream} stroke={dark} strokeWidth="1.5" />
        <path d="M -1,-20 C 7,-9 -7,9 1,20" fill="none" stroke={dark} strokeWidth="3" strokeLinecap="round" />
      </g>
      <g transform="translate(394, 240)">
        <ellipse cx="0" cy="0" rx="16" ry="25" fill={cream} stroke={dark} strokeWidth="1.5" />
        <path d="M -1,-20 C 7,-9 -7,9 1,20" fill="none" stroke={dark} strokeWidth="3" strokeLinecap="round" />
      </g>

      {/* ═══════════ RIBBON BANNER ═══════════ */}
      <path
        d="M 45,365 L 88,340 L 88,395 L 45,418 L 64,390 Z"
        fill={ribbonShade}
        stroke={dark}
        strokeWidth="3"
      />
      <path
        d="M 467,365 L 424,340 L 424,395 L 467,418 L 448,390 Z"
        fill={ribbonShade}
        stroke={dark}
        strokeWidth="3"
      />
      <path
        d="M 55,350 Q 256,392 457,350 L 475,398 Q 256,445 37,398 Z"
        fill={ribbonFill}
        stroke={dark}
        strokeWidth="3.5"
      />

      {/* ═══════════ RIBBON TEXT: COFFEE CAFE ═══════════ */}
      <text
        fill={dark}
        fontSize="42"
        fontWeight="900"
        fontFamily="'Trebuchet MS', 'Arial Black', sans-serif"
        letterSpacing="6"
      >
        <textPath href="#rc-ribbon-arc" startOffset="50%" textAnchor="middle">
          COFFEE CAFE
        </textPath>
      </text>
    </svg>
  );
}

/**
 * Radha Water — Official Vintage Circular Seal Emblem with Water Drop & Ripples
 */
export function RadhaWaterLogo({ className }: { className?: string }) {
  const dark = '#1F1009';
  const cream = '#F7EBDC';
  const midBrown = '#543118';
  const accent = '#D9825B';
  const ribbonFill = '#EDE0D0';
  const ribbonShade = '#C8B299';

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      className={cn('w-full h-full block', className)}
      aria-hidden="true"
    >
      <defs>
        {/* Top arc for RADHA */}
        <path id="rw-top-arc" d="M 95,256 A 161,161 0 0,1 417,256" fill="none" />
        {/* Bottom arc for ESTD 2026 */}
        <path id="rw-bot-arc" d="M 115,256 A 141,141 0 0,0 397,256" fill="none" />
        {/* Ribbon text arc */}
        <path id="rw-ribbon-arc" d="M 70,385 Q 256,435 442,385" fill="none" />
      </defs>

      {/* ═══════════ OUTER RING & SHIELD ═══════════ */}
      <circle cx="256" cy="256" r="250" fill={cream} />
      <circle cx="256" cy="256" r="242" fill={dark} />
      <circle cx="256" cy="256" r="230" fill="none" stroke={cream} strokeWidth="8" />
      <circle cx="256" cy="256" r="218" fill="none" stroke={accent} strokeWidth="3" />

      {/* ═══════════ ARCHED TEXT: RADHA ═══════════ */}
      <text
        fill={cream}
        fontSize="56"
        fontWeight="900"
        fontFamily="Georgia, 'Times New Roman', serif"
        letterSpacing="14"
      >
        <textPath href="#rw-top-arc" startOffset="50%" textAnchor="middle">
          RADHA
        </textPath>
      </text>

      {/* ═══════════ ARCHED TEXT: ESTD 2026 ═══════════ */}
      <text
        fill={accent}
        fontSize="22"
        fontWeight="800"
        fontFamily="'Trebuchet MS', Arial, sans-serif"
        letterSpacing="6"
      >
        <textPath href="#rw-bot-arc" startOffset="50%" textAnchor="middle">
          ESTD  2026
        </textPath>
      </text>

      {/* ═══════════ CENTER MEDALLION ═══════════ */}
      <circle cx="256" cy="236" r="142" fill={midBrown} />
      <circle cx="256" cy="236" r="136" fill="none" stroke={cream} strokeWidth="4" />
      <circle cx="256" cy="236" r="128" fill="none" stroke={accent} strokeWidth="2" opacity="0.8" />

      {/* Horizontal hatch lines inside medallion */}
      <clipPath id="rw-medal-clip">
        <circle cx="256" cy="236" r="126" />
      </clipPath>
      <g clipPath="url(#rw-medal-clip)" stroke={cream} strokeWidth="1.5" opacity="0.25">
        {[135, 150, 165, 180, 195, 210, 225, 240, 255, 270, 285, 300, 315].map((y) => (
          <line key={y} x1="110" y1={y} x2="402" y2={y} />
        ))}
      </g>

      {/* ═══════════ PURE WATER DROPLET & RIPPLES ═══════════ */}
      {/* Water Ripple Waves */}
      <g stroke={cream} strokeWidth="3" fill="none" opacity="0.9">
        <ellipse cx="256" cy="308" rx="84" ry="16" />
        <ellipse cx="256" cy="316" rx="54" ry="10" opacity="0.6" />
      </g>

      {/* Central Water Drop Body */}
      <path
        d="M 256,110 C 256,110 188,212 188,260 C 188,298 218,328 256,328 C 294,328 324,298 324,260 C 324,212 256,110 256,110 Z"
        fill={cream}
        stroke={dark}
        strokeWidth="3.5"
      />

      {/* Inner Droplet Contour & Highlight */}
      <path
        d="M 256,134 C 256,134 204,218 204,258 C 204,286 226,310 256,310 C 286,310 308,286 308,258 C 308,218 256,134 256,134 Z"
        fill={dark}
        opacity="0.12"
      />

      {/* Glossy Curved Light Reflection */}
      <path
        d="M 230,175 C 220,195 214,222 214,248 C 214,272 224,292 238,298 C 230,290 224,272 224,248 C 224,224 230,200 238,182 Z"
        fill={cream}
        opacity="0.95"
      />

      {/* Small Secondary Gleam Dot */}
      <circle cx="282" cy="272" r="7" fill={cream} opacity="0.9" />

      {/* ═══════════ WATER DROPLETS (LEFT & RIGHT) ═══════════ */}
      <g transform="translate(118, 240)">
        <path
          d="M 0,-18 C 0,-18 -12,2 -12,10 C -12,17 -6,22 0,22 C 6,22 12,17 12,10 C 12,2 0,-18 0,-18 Z"
          fill={cream}
          stroke={dark}
          strokeWidth="1.5"
        />
        <path d="M -4,2 C -6,6 -6,12 -3,16" fill="none" stroke={dark} strokeWidth="1.5" strokeLinecap="round" />
      </g>
      <g transform="translate(394, 240)">
        <path
          d="M 0,-18 C 0,-18 -12,2 -12,10 C -12,17 -6,22 0,22 C 6,22 12,17 12,10 C 12,2 0,-18 0,-18 Z"
          fill={cream}
          stroke={dark}
          strokeWidth="1.5"
        />
        <path d="M -4,2 C -6,6 -6,12 -3,16" fill="none" stroke={dark} strokeWidth="1.5" strokeLinecap="round" />
      </g>

      {/* ═══════════ RIBBON BANNER ═══════════ */}
      <path
        d="M 45,365 L 88,340 L 88,395 L 45,418 L 64,390 Z"
        fill={ribbonShade}
        stroke={dark}
        strokeWidth="3"
      />
      <path
        d="M 467,365 L 424,340 L 424,395 L 467,418 L 448,390 Z"
        fill={ribbonShade}
        stroke={dark}
        strokeWidth="3"
      />
      <path
        d="M 55,350 Q 256,392 457,350 L 475,398 Q 256,445 37,398 Z"
        fill={ribbonFill}
        stroke={dark}
        strokeWidth="3.5"
      />

      {/* ═══════════ RIBBON TEXT: DRINKING WATER ═══════════ */}
      <text
        fill={dark}
        fontSize="36"
        fontWeight="900"
        fontFamily="'Trebuchet MS', 'Arial Black', sans-serif"
        letterSpacing="5"
      >
        <textPath href="#rw-ribbon-arc" startOffset="50%" textAnchor="middle">
          DRINKING WATER
        </textPath>
      </text>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   AppLogo — Composable brand mark used across RadhaCafe and RadhaWater.
   Supports type ('cafe' | 'water'), variant, size, and href.
   ═══════════════════════════════════════════════════════════════════ */

export interface AppLogoProps {
  type?: 'cafe' | 'water';
  variant?: 'default' | 'compact' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  href?: string;
  lightText?: boolean;
  className?: string;
}

export function AppLogo({
  type = 'cafe',
  variant = 'default',
  size = 'md',
  href,
  lightText = false,
  className,
}: AppLogoProps) {
  const sizeStyles = {
    sm: { wrap: 'size-9', text: 'text-base' },
    md: { wrap: 'size-12', text: 'text-xl' },
    lg: { wrap: 'size-16', text: 'text-3xl' },
    xl: { wrap: 'size-24', text: 'text-4xl' },
  };

  const s = sizeStyles[size] ?? sizeStyles.md;
  const isWater = type === 'water';

  const logo: ReactNode = (
    <div className={cn('inline-flex items-center gap-2.5 select-none', className)}>
      <div className={cn('shrink-0 rounded-full overflow-hidden transition-transform hover:scale-105', s.wrap)}>
        {isWater ? <RadhaWaterLogo className="size-full" /> : <RadhaCafeLogo className="size-full" />}
      </div>

      {variant !== 'icon' && (
        <span
          className={cn(
            'font-heading font-bold leading-none',
            lightText ? 'text-cream' : 'text-foreground',
            s.text,
            variant === 'compact' && 'text-base sm:text-lg'
          )}
        >
          Radha<span className="text-cinnamon">{isWater ? 'Water' : 'Cafe'}</span>
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link
        to={href}
        className="inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
        aria-label={isWater ? 'RadhaWater' : 'RadhaCafe'}
      >
        {logo}
      </Link>
    );
  }

  return logo;
}
