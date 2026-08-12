import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { useCafeSettings } from '../../hooks/useCafeSettings';
import { useParallax } from '../../hooks/useScrollAnimations';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowDown01Icon, ArrowUpRight01Icon } from '@hugeicons/core-free-icons';

const HERO_IMAGES = [
  // — Coffee —
  "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=2400&q=90", // coffee beans, dark backlit
  "https://images.unsplash.com/photo-1509785307050-d4066910ec1e?auto=format&fit=crop&w=2400&q=90", // beans beside mug, moody
  "https://images.unsplash.com/photo-1521302080334-4bebac2763a6?auto=format&fit=crop&w=2400&q=90", // pour into glass mug, dark
"https://images.unsplash.com/photo-1610632380989-680fe40816c6?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=2400&q=90",
  "https://images.unsplash.com/photo-1497515114629-f71d768fd07c?q=80&w=2084&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1542372147193-a7aca54189cd?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1550807014-1236e91b92d4?q=80&w=1960&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=2400&q=90",

  // — Tea —
  "https://images.unsplash.com/photo-1558160074-4d7d8bdf4256?auto=format&fit=crop&w=2400&q=90", // glass cup near ceramic teapot, dark
  "https://images.unsplash.com/photo-1617191880520-c6a69e04fa75?auto=format&fit=crop&w=2400&q=90", // amber tea on dark wood table
  "https://images.unsplash.com/photo-1641997827576-84d0a7e386bc?auto=format&fit=crop&w=2400&q=90", // pouring tea into glass pot, moody
  "https://images.unsplash.com/photo-1627828094454-accc9a7c20e9?auto=format&fit=crop&w=2400&q=90", // dark tea pitcher, black liquid

  // — Noodles —
  "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&w=2400&q=90", // noodles on black plate
  "https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=2400&q=90", // noodles, black ceramic bowl
  "https://images.unsplash.com/photo-1623341214825-9f4f963727da?auto=format&fit=crop&w=2400&q=90", // ramen bowl, chopsticks, dark izakaya lighting
  "https://images.unsplash.com/photo-1614563637806-1d0e645e0940?auto=format&fit=crop&w=2400&q=90", // egg & veg noodles, black ceramic bowl
];
export function HeroSection() {
  const { data: settings } = useCafeSettings();
  const { ref: parallaxRef, y } = useParallax(0.12);
  const [currentImage, setCurrentImage] = useState(0);
  const [scrollOpacity, setScrollOpacity] = useState(0);

  // Preload all hero background images on mount
  useEffect(() => {
    HERO_IMAGES.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Auto-advance hero images with crossfade
  useEffect(() => {
    if (HERO_IMAGES.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  // Fade out scroll indicator as user scrolls
  useEffect(() => {
    const onScroll = () => {
      const pct = Math.min(window.scrollY / 300, 1);
      setScrollOpacity(pct);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const cafeName =
    settings?.cafe_name && settings.cafe_name.toLowerCase().startsWith('radhacaf')
      ? 'RadhaCafe'
      : settings?.cafe_name || 'RadhaCafe';

  return (
    <section
      ref={parallaxRef}
      id="home"
      className="relative min-h-svh flex items-center justify-center overflow-hidden"
      aria-label="Hero"
    >
      {/* ── Background Images with Crossfade ── */}
      {HERO_IMAGES.map((src, i) => (
        <div
          key={src}
          className="absolute inset-0 transition-opacity duration-1000 ease-in-out pointer-events-none"
          style={{
            opacity: i === currentImage ? 1 : 0,
            transform: `translateY(${y * 0.5}px) scale(1.05)`,
            zIndex: i === currentImage ? 1 : 0,
          }}
          aria-hidden="true"
        >
          <img
            src={src}
            alt=""
            className="w-full h-full object-cover"
            loading="eager"
            decoding="async"
          />
        </div>
      ))}

      {/* ── Layered Overlays ── */}
      <div className="absolute inset-0 bg-[#0C0603]/60" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#140A06]/50 via-[#0C0603]/30 to-[#140A06]/95" aria-hidden="true" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(12,6,3,0.7)_100%)]" aria-hidden="true" />
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#140A06] to-transparent" aria-hidden="true" />

      {/* ── Foreground Content ── */}
      <div className="relative z-10 text-center px-5 sm:px-8 max-w-4xl mx-auto flex flex-col items-center justify-center gap-6 sm:gap-8">
        {/* Eyebrow badge */}
        <div className="animate-hero-enter flex items-center gap-3">
          <span className="h-px w-8 sm:w-12 bg-[#E5A88B]/60" />
          <span className="text-[11px] sm:text-xs font-bold tracking-[0.25em] uppercase text-[#E5A88B]">
            {cafeName}
          </span>
          <span className="h-px w-8 sm:w-12 bg-[#E5A88B]/60" />
        </div>

        {/* Main Heading — Slanted Cream Banner Text Blocks */}
        <h1 className="animate-hero-enter-delayed flex flex-col items-center gap-3 sm:gap-4 text-center tracking-tight leading-tight max-w-full my-2">
          <span className="bg-[#F5E6D3] text-[#2C1810] font-heading font-bold px-4 py-1.5 sm:px-6 sm:py-2.5 text-3xl sm:text-5xl md:text-6xl lg:text-7xl shadow-xl transform -rotate-1.5 sm:-rotate-2 transition-transform hover:rotate-0">
            Where Every Cup
          </span>
          <span className="bg-[#F5E6D3] text-[#2C1810] font-serif italic font-normal px-4 py-1.5 sm:px-6 sm:py-2.5 text-3xl sm:text-5xl md:text-6xl lg:text-7xl shadow-xl transform rotate-1.5 sm:rotate-2 transition-transform hover:rotate-0">
            Feels Like Home
          </span>
        </h1>

        {/* Decorative divider */}
        <div className="animate-hero-enter-delayed-2 flex items-center gap-3" aria-hidden="true">
          <span className="h-px w-10 bg-[#E5A88B]/40" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#E5A88B]" />
          <span className="h-px w-10 bg-[#E5A88B]/40" />
        </div>

        {/* Supporting Copy */}
        <p className="animate-hero-enter-delayed-2 text-sm sm:text-base text-white/80 leading-relaxed max-w-md mx-auto font-normal">
          {settings?.tagline ||
            'Artisanal coffee & warm hospitality in the heart of Tallur.'}
        </p>

        {/* CTA Buttons — Compact Side-by-Side */}
        <div className="animate-hero-enter-delayed-3 flex flex-row items-center justify-center gap-3 sm:gap-4 pt-2">
          <Link
            to={ROUTES.PUBLIC.MENU}
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#E5A88B] hover:bg-[#EEB89D] px-5 sm:px-7 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-[#140A06] whitespace-nowrap shadow-lg shadow-[#E5A88B]/20 transition-all hover:scale-105 active:scale-95"
          >
            <span>Explore Menu</span>
            <HugeiconsIcon icon={ArrowUpRight01Icon} size={14} />
          </Link>
          <Link
            to={ROUTES.PUBLIC.CONTACT}
            className="inline-flex items-center justify-center gap-1.5 rounded-full border border-white/25 bg-white/5 hover:bg-white/10 backdrop-blur-sm px-5 sm:px-7 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white whitespace-nowrap shadow-lg transition-all hover:scale-105 active:scale-95"
          >
            <span>Visit Us</span>
          </Link>
        </div>
      </div>

      {/* ── Scroll Indicator ── */}
      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 transition-opacity duration-300 pointer-events-none"
        style={{ opacity: Math.max(0, 1 - scrollOpacity * 2.5) }}
        aria-hidden="true"
      >
        <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-white/50">
          Scroll to explore
        </span>
        <HugeiconsIcon
          icon={ArrowDown01Icon}
          size={18}
          className="text-white/60 animate-scroll-bounce"
        />
      </div>
    </section>
  );
}
