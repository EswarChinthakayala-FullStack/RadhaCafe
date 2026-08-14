import { useEffect, useState } from 'react';
import { useCafeSettings } from '../../hooks/useCafeSettings';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Location01Icon,
  CallIcon,
  MapsIcon,
  Clock01Icon,
} from '@hugeicons/core-free-icons';

export function ContactHero() {
  const { data: settings } = useCafeSettings();
  const [scrollY, setScrollY] = useState(0);

  const phone = settings?.phone || '09966630913';
  const mapsUrl = 'https://maps.app.goo.gl/u6JadwVD4jGvgLnE9';

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

  const parallaxOffset = Math.min(scrollY * 0.18, 60);

  return (
    <section className="relative min-h-[62svh] sm:min-h-[68svh] flex items-center justify-center overflow-hidden bg-[#140A06] pt-20 pb-16">
      {/* ── Background Media & Parallax ── */}
      <div
        className="absolute inset-0 z-0 will-change-transform scale-105 pointer-events-none"
        style={{ transform: `translateY(${parallaxOffset}px)` }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=2400&q=90')`,
          }}
        />

        {/* Multi-Stop Cinematic Vignette & Warm Tint */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#140A06] via-[#140A06]/80 to-[#140A06]/65" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(20,10,6,0.9)_100%)]" />

        {/* Warm Golden Center Radial Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[800px] h-[450px] rounded-full bg-[radial-gradient(circle,rgba(229,168,139,0.14)_0%,transparent_70%)] pointer-events-none" />
      </div>

      {/* Decorative Bottom Blending Edge */}
      <div
        className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[#140A06] to-transparent z-[4]"
        aria-hidden="true"
      />

      {/* ── Foreground Content ── */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto flex flex-col items-center justify-center gap-5 sm:gap-6 pt-6 sm:pt-0">
        {/* Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E5A88B]/10 border border-[#E5A88B]/25 text-[#E5A88B] text-xs font-bold uppercase tracking-widest animate-fade-in">
          <HugeiconsIcon icon={Location01Icon} size={14} />
          <span>VISIT RADHACAFE</span>
        </div>

        {/* Editorial Headline */}
        <div className="space-y-2 sm:space-y-3">
          <h1 className="font-heading font-extrabold text-3xl sm:text-5xl md:text-6xl text-cream leading-[1.1] tracking-tight drop-shadow-2xl">
            Good coffee is even better when{' '}
            <span className="font-serif italic font-normal text-[#E5A88B] block sm:inline">
              you know where to find us.
            </span>
          </h1>
        </div>

        {/* Supporting Tagline from cafe_settings */}
        <p className="text-xs sm:text-base text-[#EAD5C3]/85 leading-relaxed max-w-xl mx-auto font-normal font-sans">
          {settings?.tagline ||
            'Artisanal coffee, traditional filter brews & warm hospitality in the heart of Tallur. Step in for a quiet cup or gather with friends.'}
        </p>

        {/* Primary Action Buttons */}
        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:justify-center sm:gap-4 pt-2 w-full max-w-md">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-full bg-gradient-to-r from-[#B85C1E] to-[#D97026] hover:from-[#C86624] hover:to-[#E87E34] text-white font-bold text-xs sm:text-sm px-4 sm:px-7 py-3 sm:py-3.5 shadow-xl shadow-[#B85C1E]/25 transition-all hover:scale-105 active:scale-95 border-0 whitespace-nowrap cursor-pointer"
          >
            <HugeiconsIcon icon={MapsIcon} size={15} />
            <span>Get Directions</span>
          </a>

          {phone && (
            <a
              href={`tel:${phone.replace(/\s+/g, '')}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/20 text-cream font-semibold text-xs sm:text-sm px-4 sm:px-7 py-3 sm:py-3.5 backdrop-blur-sm transition-all hover:border-[#E5A88B]/50 whitespace-nowrap cursor-pointer"
            >
              <HugeiconsIcon icon={CallIcon} size={15} className="text-[#E5A88B]" />
              <span className="sm:hidden">Call Cafe</span>
              <span className="hidden sm:inline">Call RadhaCafe</span>
            </a>
          )}
        </div>

        {/* Secondary Jump Link */}
        <a
          href="#visit-details"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E5A88B]/80 hover:text-[#E5A88B] transition-colors pt-2 cursor-pointer"
        >
          <HugeiconsIcon icon={Clock01Icon} size={13} />
          <span>View Opening Hours & Location Info</span>
        </a>
      </div>
    </section>
  );
}
