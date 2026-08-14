import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { useCafeSettings } from '../../hooks/useCafeSettings';
import type { HeroSlideMedia } from '../../types/media.types';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowDown01Icon, ArrowUpRight01Icon, Location01Icon, Coffee02Icon } from '@hugeicons/core-free-icons';

const HERO_SLIDES: HeroSlideMedia[] = [
  {
    id: 'hero-1',
    src: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=2400&q=90',
    alt: 'Freshly roasted dark South Indian coffee beans under warm dramatic backlight',
    titleMain: 'Where Every Cup',
    titleAccent: 'Feels Like Home.',
    subtitle: 'Artisanal coffee, traditional filter brews & warm hospitality in the heart of Tallur.',
    desktopPosition: 'bg-center',
    mobilePosition: 'bg-[center_top]',
  },
  {
    id: 'hero-2',
    src: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=2400&q=90',
    alt: 'Warm ambient RadhaCafe interior with barista preparing handcrafted coffee',
    titleMain: 'Rooted in Tradition,',
    titleAccent: 'Brewed for Today.',
    subtitle: 'Authentic South Indian chicory roast crafted with modern barista precision.',
    desktopPosition: 'bg-[center_35%]',
    mobilePosition: 'bg-center',
  },
  {
    id: 'hero-3',
    src: 'https://images.unsplash.com/photo-1509785307050-d4066910ec1e?auto=format&fit=crop&w=2400&q=90',
    alt: 'Steaming ceramic mug of artisanal filter coffee beside rich whole beans',
    titleMain: 'Moments of Calm,',
    titleAccent: 'Flavors That Stay.',
    subtitle: 'Your favorite neighborhood sanctuary for quiet pauses and heartfelt conversations.',
    desktopPosition: 'bg-center',
    mobilePosition: 'bg-center',
  },
  {
    id: 'hero-4',
    src: 'https://images.unsplash.com/photo-1521302080334-4bebac2763a6?auto=format&fit=crop&w=2400&q=90',
    alt: 'Precision barista pour of fresh brewed coffee into glass mug',
    titleMain: 'Crafted with Passion,',
    titleAccent: 'Poured with Care.',
    subtitle: 'Farm-fresh milk, single-origin blends, and timeless artisanal dedication.',
    desktopPosition: 'bg-[center_40%]',
    mobilePosition: 'bg-center',
  },
  {
    id: 'hero-5',
    src: 'https://images.unsplash.com/photo-1497515114629-f71d768fd07c?q=80&w=2084&auto=format&fit=crop',
    alt: 'Artisanal latte art cup served with warmth in cafe setting',
    titleMain: 'A Warm Welcome In',
    titleAccent: 'Every Single Sip.',
    subtitle: 'Freshly brewed beverages and gourmet accompaniments made daily in Tallur.',
    desktopPosition: 'bg-center',
    mobilePosition: 'bg-center',
  },
  {
  id: 'hero-6',
  src: 'https://images.unsplash.com/photo-1747994569247-f0fdd6fb4b5f?auto=format&fit=crop&w=2400&q=90',
  alt: 'Warm sunlit cafe interior with intimate seating and an inviting hospitality atmosphere',
  titleMain: 'A Space Made for',
  titleAccent: 'Slow, Beautiful Moments.',
  subtitle:
    'Settle in, take your time, and enjoy a warm cafe experience made for everyday conversations.',
  desktopPosition: 'bg-[center_55%]',
  mobilePosition: 'bg-[center_45%]',
},

{
  id: 'hero-7',
  src: 'https://images.unsplash.com/photo-1567309966795-5ad24aa39971?auto=format&fit=crop&w=2400&q=90',
  alt: 'Barista carefully pouring milk into coffee to create detailed latte art',
  titleMain: 'Made by Hand,',
  titleAccent: 'Finished with Heart.',
  subtitle:
    'From the first pour to the final detail, every cup is prepared with patience, craft, and care.',
  desktopPosition: 'bg-[center_48%]',
  mobilePosition: 'bg-[center_42%]',
},

{
  id: 'hero-8',
  src: 'https://images.unsplash.com/photo-1769138886284-34d3d68f4ba5?auto=format&fit=crop&w=2400&q=90',
  alt: 'Fresh latte served beside a golden croissant in a calm cafe setting',
  titleMain: 'Good Mornings',
  titleAccent: 'Begin Around the Table.',
  subtitle:
    'Freshly prepared drinks, comforting bites, and an easy atmosphere for starting the day right.',
  desktopPosition: 'bg-[center_52%]',
  mobilePosition: 'bg-[center_50%]',
},

{
  id: 'hero-9',
  src: 'https://images.unsplash.com/photo-1495774856032-8b90bbb32b32?auto=format&fit=crop&w=2400&q=90',
  alt: 'Freshly prepared latte art held carefully in both hands as it is served to a guest',
  titleMain: 'More Than a Drink,',
  titleAccent: 'A Moment Shared.',
  subtitle:
    'Thoughtfully prepared and warmly served — because the best cafe moments are meant to be shared.',
  desktopPosition: 'bg-[center_45%]',
  mobilePosition: 'bg-[center_42%]',
},

{
  id: 'hero-10',
  src: 'https://images.unsplash.com/photo-1531752074002-abf991376d04?auto=format&fit=crop&w=2400&q=90',
  alt: 'Selection of handcrafted coffees arranged on a stylish cafe table in warm natural light',
  titleMain: 'Stay a Little Longer,',
  titleAccent: 'There Is Always Another Cup.',
  subtitle:
    'From quick coffee breaks to unhurried conversations, RadhaCafe is a place to pause and enjoy.',
  desktopPosition: 'bg-[center_52%]',
  mobilePosition: 'bg-[center_48%]',
},
];

export function HeroSection() {
  const { data: settings } = useCafeSettings();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Check reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Preload hero background images progressively
  useEffect(() => {
    // Load first high-priority image immediately
    const firstImg = new Image();
    firstImg.src = HERO_SLIDES[0].src;

    // Preload remaining images asynchronously after initial render
    const timeout = setTimeout(() => {
      HERO_SLIDES.slice(1).forEach((slide) => {
        const img = new Image();
        img.src = slide.src;
      });
    }, 1200);

    return () => clearTimeout(timeout);
  }, []);

  // Auto-advance hero slides with Page Visibility check & smooth crossfade
  useEffect(() => {
    if (reducedMotion || HERO_SLIDES.length <= 1) return;

    let interval: ReturnType<typeof setInterval> | null = null;

    const startInterval = () => {
      if (!interval) {
        interval = setInterval(() => {
          if (!document.hidden) {
            setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
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

  // Passive scroll listener for subtle parallax and indicator fadeout
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

  // Compute bounded parallax offset (0 to 60px max)
  const parallaxOffset = useMemo(() => {
    if (reducedMotion) return 0;
    return Math.min(scrollY * 0.15, 60);
  }, [scrollY, reducedMotion]);

  const scrollIndicatorOpacity = useMemo(() => {
    return Math.max(0, 1 - scrollY / 220);
  }, [scrollY]);

  const handleScrollToNext = () => {
    const nextSection = document.getElementById('intro') || document.getElementById('about');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const activeSlideData = HERO_SLIDES[currentSlide];

  return (
    <section
      id="home"
      className="relative min-h-[100svh] flex items-center justify-center overflow-hidden bg-[#140A06] text-cream"
      aria-label="Welcome to RadhaCafe"
    >
      {/* ── Background Layer with Crossfade, Ken Burns & Subtle Parallax ── */}
      <div
        className="absolute inset-0 w-full h-[115%] -top-[7.5%] pointer-events-none will-change-transform"
        style={{
          transform: `translate3d(0, ${parallaxOffset}px, 0)`,
        }}
        aria-hidden="true"
      >
        {HERO_SLIDES.map((slide, idx) => {
          const isActive = idx === currentSlide;
          const posClass = `${slide.mobilePosition || 'bg-center'} sm:${slide.desktopPosition || 'bg-center'}`;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 bg-cover ${posClass} transition-all duration-1200 ease-in-out ${
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

        {/* Multi-Stop Cinematic Vignette & Atmospheric Tint */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#140A06] via-[#140A06]/75 to-[#140A06]/55" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(20,10,6,0.85)_100%)]" />

        {/* Warm Golden Center Radial Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[800px] h-[450px] rounded-full bg-[radial-gradient(circle,rgba(229,168,139,0.12)_0%,transparent_70%)] pointer-events-none" />
      </div>

      {/* Decorative Gradient Edge Seamless Blending to Next Section */}
      <div
        className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-[#140A06] to-transparent z-[4]"
        aria-hidden="true"
      />

      {/* ── Foreground Editorial Content ── */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto flex flex-col items-center justify-center gap-5 sm:gap-7 pt-12 sm:pt-0">
        {/* Editorial Headline changing per background slide */}
        <div key={`title-${currentSlide}`} className="animate-fade-in space-y-2 sm:space-y-3">
          <h1 className="flex flex-col items-center gap-2 text-center tracking-tight leading-[1.08] max-w-full">
            <span className="font-heading font-extrabold text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-cream drop-shadow-2xl transition-all duration-700">
              {activeSlideData.titleMain}
            </span>
            <span className="font-serif italic font-normal text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-[#E5A88B] drop-shadow-xl transition-all duration-700">
              {activeSlideData.titleAccent}
            </span>
          </h1>
        </div>

        {/* Decorative Divider */}
        <div className="flex items-center gap-3" aria-hidden="true">
          <span className="h-px w-8 sm:w-16 bg-gradient-to-r from-transparent to-[#E5A88B]/50" />
          <HugeiconsIcon icon={Coffee02Icon} size={14} className="text-[#E5A88B]" />
          <span className="h-px w-8 sm:w-16 bg-gradient-to-l from-transparent to-[#E5A88B]/50" />
        </div>

        {/* Supporting Copy changing per background slide */}
        <p
          key={`sub-${currentSlide}`}
          className="animate-fade-in text-xs sm:text-sm md:text-base text-[#EAD5C3]/85 leading-relaxed max-w-lg mx-auto font-normal min-h-[36px] sm:min-h-[40px] flex items-center justify-center"
        >
          {activeSlideData.subtitle ||
            settings?.tagline ||
            'Artisanal coffee, traditional filter brews & warm hospitality in the heart of Tallur.'}
        </p>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-1">
          <Link
            to={ROUTES.PUBLIC.MENU}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#B85C1E] to-[#D97026] hover:from-[#C86624] hover:to-[#E87E34] text-white font-bold text-xs sm:text-sm px-6 sm:px-8 py-3 sm:py-3.5 shadow-xl shadow-[#B85C1E]/25 transition-all hover:scale-105 active:scale-95 border-0"
          >
            <span>Explore Our Menu</span>
            <HugeiconsIcon icon={ArrowUpRight01Icon} size={15} />
          </Link>

          <Link
            to={ROUTES.PUBLIC.CONTACT}
            className="inline-flex items-center gap-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/20 text-cream font-semibold text-xs sm:text-sm px-6 sm:px-7 py-3 sm:py-3.5 backdrop-blur-sm transition-all hover:border-[#E5A88B]/50"
          >
            <HugeiconsIcon icon={Location01Icon} size={15} className="text-[#E5A88B]" />
            <span>Visit Us in Tallur</span>
          </Link>
        </div>
      </div>

      {/* ── Subtle Bouncing Scroll Indicator ── */}
      <button
        type="button"
        onClick={handleScrollToNext}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-cream/70 hover:text-[#E5A88B] transition-all cursor-pointer group focus:outline-none"
        style={{
          opacity: scrollIndicatorOpacity,
          pointerEvents: scrollIndicatorOpacity < 0.1 ? 'none' : 'auto',
        }}
        aria-label="Scroll down to explore story"
      >
        <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-cream/60 group-hover:text-[#E5A88B] transition-colors">
          Scroll to explore
        </span>
        <div className="w-8 h-8 rounded-full border border-white/20 group-hover:border-[#E5A88B]/50 flex items-center justify-center bg-[#140A06]/40 backdrop-blur-sm group-hover:bg-[#140A06]/80 transition-colors animate-bounce">
          <HugeiconsIcon icon={ArrowDown01Icon} size={16} className="text-[#E5A88B]" />
        </div>
      </button>
    </section>
  );
}
