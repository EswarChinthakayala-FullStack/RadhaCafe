import { useEffect, useState, useMemo } from 'react';
import waterHero1 from '../../../assets/water/hero/hero1.png';
import waterHero2 from '../../../assets/water/hero/hero2.png';
import waterHero3 from '../../../assets/water/hero/hero3.png';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowDown01Icon,
  ArrowUpRight01Icon,
  DropletIcon,
  TruckIcon,
} from '@hugeicons/core-free-icons';

const WATER_HERO_SLIDES = [
  {
    id: 'slide-1',
    src: waterHero1,
    alt: 'RadhaWater official drinking water service and delivery presentation',
    titleMain: 'Pure Water For Everyday Life,',
    titleAccent: 'Reliable Supply For Every Celebration.',
    subtitle: 'Hygienically filtered 20L drinking water cans delivered fresh for daily homes, shops, weddings, and grand gatherings in Tallur.',
  },
  {
    id: 'slide-2',
    src: waterHero2,
    alt: 'RadhaWater chilled cooling water and bulk event supply arrangement',
    titleMain: 'Normal & Chilled Cooling Water,',
    titleAccent: 'Delivered On Schedule.',
    subtitle: 'From single 20L can doorstep drops at ₹5 to instant cooling cans at ₹30, we cater to all drinking water needs.',
  },
  {
    id: 'slide-3',
    src: waterHero3,
    alt: 'RadhaWater wedding and large event bulk drinking water supply in Tallur',
    titleMain: 'Weddings, Functions & Events,',
    titleAccent: 'Handled with Perfection.',
    subtitle: 'Multi-hundred can bulk supply with on-time venue drop-offs and seamless event coordination across Tallur.',
  },
];

export function WaterHero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Preload water hero visuals
  useEffect(() => {
    const firstImg = new Image();
    firstImg.src = WATER_HERO_SLIDES[0].src;

    const timeout = setTimeout(() => {
      WATER_HERO_SLIDES.slice(1).forEach((slide) => {
        const img = new Image();
        img.src = slide.src;
      });
    }, 1200);

    return () => clearTimeout(timeout);
  }, []);

  // Auto-advance slides with visibility check
  useEffect(() => {
    if (reducedMotion || WATER_HERO_SLIDES.length <= 1) return;

    let interval: ReturnType<typeof setInterval> | null = null;

    const startInterval = () => {
      if (!interval) {
        interval = setInterval(() => {
          if (!document.hidden) {
            setCurrentSlide((prev) => (prev + 1) % WATER_HERO_SLIDES.length);
          }
        }, 6500);
      }
    };

    const stopInterval = () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopInterval();
      } else {
        startInterval();
      }
    };

    startInterval();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stopInterval();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [reducedMotion]);

  // Passive scroll listener
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const parallaxOffset = useMemo(() => {
    if (reducedMotion) return 0;
    return Math.min(scrollY * 0.15, 60);
  }, [scrollY, reducedMotion]);

  const scrollIndicatorOpacity = useMemo(() => {
    return Math.max(0, 1 - scrollY / 220);
  }, [scrollY]);

  const handleScrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const activeSlide = WATER_HERO_SLIDES[currentSlide];

  return (
    <section
      id="home"
      className="relative min-h-[100svh] flex items-center justify-center overflow-hidden bg-[#140A06] text-cream"
      aria-label="Welcome to RadhaWater"
    >
      {/* ── Background Layer with Crossfade, Ken Burns & Subtle Parallax ── */}
      <div
        className="absolute inset-0 w-full h-[115%] -top-[7.5%] pointer-events-none will-change-transform"
        style={{
          transform: `translate3d(0, ${parallaxOffset}px, 0)`,
        }}
        aria-hidden="true"
      >
        {WATER_HERO_SLIDES.map((slide, idx) => {
          const isActive = idx === currentSlide;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 bg-cover bg-center transition-all duration-1200 ease-in-out ${
                isActive
                  ? 'opacity-100 scale-105 filter contrast-105'
                  : 'opacity-0 scale-100 filter contrast-100'
              }`}
              style={{
                backgroundImage: `url("${slide.src}")`,
              }}
              role="img"
              aria-label={slide.alt}
            />
          );
        })}

        {/* Multi-Stop Cinematic Vignette Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#140A06] via-[#140A06]/80 to-[#140A06]/60" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(20,10,6,0.88)_100%)]" />

        {/* Warm Golden Center Radial Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[850px] h-[450px] rounded-full bg-[radial-gradient(circle,rgba(229,168,139,0.12)_0%,transparent_70%)] pointer-events-none" />
      </div>

      {/* Decorative Bottom Blending */}
      <div
        className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-[#140A06] to-transparent z-[4]"
        aria-hidden="true"
      />

      {/* ── Foreground Content ── */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto flex flex-col items-center justify-center gap-6 sm:gap-8 pt-12 sm:pt-0">
        {/* Editorial Headline */}
        <div key={`title-${currentSlide}`} className="animate-fade-in space-y-2 sm:space-y-3">
          <h1 className="flex flex-col items-center gap-2 text-center tracking-tight leading-[1.08] max-w-full">
            <span className="font-heading font-extrabold text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-white drop-shadow-2xl transition-all duration-700">
              {activeSlide.titleMain}
            </span>
            <span className="font-serif italic font-normal text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-[#E5A88B] drop-shadow-xl transition-all duration-700">
              {activeSlide.titleAccent}
            </span>
          </h1>
        </div>

        {/* Decorative Divider */}
        <div className="flex items-center gap-3" aria-hidden="true">
          <span className="h-px w-8 sm:w-16 bg-gradient-to-r from-transparent to-[#E5A88B]/50" />
          <HugeiconsIcon icon={DropletIcon} size={14} className="text-[#E5A88B]" />
          <span className="h-px w-8 sm:w-16 bg-gradient-to-l from-transparent to-[#E5A88B]/50" />
        </div>

        {/* Supporting Copy */}
        <p
          key={`sub-${currentSlide}`}
          className="animate-fade-in text-xs sm:text-sm md:text-base text-[#EAD5C3]/80 leading-relaxed max-w-xl mx-auto font-normal min-h-[36px] sm:min-h-[40px] flex items-center justify-center"
        >
          {activeSlide.subtitle}
        </p>

        {/* Action CTAs */}
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-center gap-3 sm:gap-4 pt-2 w-full max-w-md">
          <button
            type="button"
            onClick={() => handleScrollTo('events')}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#B85C1E] to-[#D97026] hover:from-[#C86624] hover:to-[#E87E34] text-white font-bold text-xs sm:text-sm px-6 sm:px-8 py-3.5 sm:py-4 shadow-xl shadow-[#B85C1E]/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span>Plan Event Supply</span>
            <HugeiconsIcon icon={ArrowUpRight01Icon} size={15} />
          </button>

          <button
            type="button"
            onClick={() => handleScrollTo('products')}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/20 text-cream font-semibold text-xs sm:text-sm px-6 sm:px-8 py-3.5 sm:py-4 backdrop-blur-sm transition-all hover:border-[#E5A88B]/50 cursor-pointer"
          >
            <HugeiconsIcon icon={TruckIcon} size={15} className="text-[#E5A88B]" />
            <span>Water Products</span>
          </button>
        </div>
      </div>

      {/* ── Subtle Bouncing Scroll Indicator ── */}
      <button
        type="button"
        onClick={() => handleScrollTo('statement')}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-cream/70 hover:text-[#E5A88B] transition-all cursor-pointer group focus:outline-none"
        style={{
          opacity: scrollIndicatorOpacity,
          pointerEvents: scrollIndicatorOpacity < 0.1 ? 'none' : 'auto',
        }}
        aria-label="Scroll to discover RadhaWater"
      >
        <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-cream/60 group-hover:text-[#E5A88B] transition-colors">
          Scroll to discover
        </span>
        <div className="w-8 h-8 rounded-full border border-white/20 group-hover:border-[#E5A88B]/50 flex items-center justify-center bg-[#140A06]/60 backdrop-blur-sm transition-colors animate-bounce">
          <HugeiconsIcon icon={ArrowDown01Icon} size={16} className="text-[#E5A88B]" />
        </div>
      </button>
    </section>
  );
}
