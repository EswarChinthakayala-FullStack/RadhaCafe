import { Link } from 'react-router-dom';
import { useCafeSettings } from '../../hooks/useCafeSettings';
import { ScrollReveal } from '../shared/ScrollReveal';
import { LiveCafeTime } from './LiveCafeTime';
import { ROUTES } from '../../constants/routes';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Coffee02Icon,
  Leaf01Icon,
  SparklesIcon,
  HeartIcon,
  Location01Icon,
  Clock01Icon,
  ArrowRight01Icon,
} from '@hugeicons/core-free-icons';

export function AboutSection() {
  const { data: settings } = useCafeSettings();

  const cafeName =
    settings?.cafe_name && settings.cafe_name.toLowerCase().startsWith('radhacaf')
      ? 'RadhaCafe'
      : settings?.cafe_name || 'RadhaCafe';

  const values = [
    {
      icon: Coffee02Icon,
      title: 'Ethically Sourced',
      desc: 'Freshly roasted Arabica & Robusta beans from sustainable plantations.',
    },
    {
      icon: SparklesIcon,
      title: 'Artisanal Brewing',
      desc: 'Mastered brewing ratios to extract peak aroma and rich crema in every cup.',
    },
    {
      icon: Leaf01Icon,
      title: 'Purity & Freshness',
      desc: 'Farm-fresh milk, organic ingredients, and daily baked companion snacks.',
    },
    {
      icon: HeartIcon,
      title: 'Warm Hospitality',
      desc: 'A soothing space for memorable conversations and quiet pauses.',
    },
  ];

  return (
    <section
      id="about"
      className="py-14 sm:py-20 lg:py-24 bg-[#140A06] text-[#EAD5C3] border-b border-[#2C1810] relative overflow-hidden"
      aria-label="About RadhaCafe"
    >
      {/* Subtle Background Glow */}
      <div
        className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-[radial-gradient(circle,rgba(184,92,30,0.06)_0%,transparent_70%)] pointer-events-none"
        aria-hidden="true"
      />

      <div className="container px-4 md:px-8 max-w-7xl mx-auto space-y-10 sm:space-y-14 relative z-10">
        {/* Responsive Grid: Stacks naturally on mobile/tablet (gap-8), 12-cols on desktop (gap-12) */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          {/* Left Column (7 cols): Story, Values, Heading */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            <ScrollReveal direction="up">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5A88B]/10 border border-[#E5A88B]/25 text-[#E5A88B] text-[11px] font-bold tracking-[0.2em] uppercase">
                  <span>Our Heritage & Craft</span>
                </div>

                <h2 className="font-heading text-2xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight">
                  Brewing Tradition.{' '}
                  <span className="font-serif italic font-normal text-[#E5A88B]">
                    Serving Delight.
                  </span>
                </h2>

                <p className="text-xs sm:text-sm text-[#EAD5C3]/80 leading-relaxed font-normal pt-1">
                  {settings?.about_text ||
                    `At ${cafeName}, every cup tells a story of passion and heritage. Rooted in the rich coffee tradition of Andhra Pradesh, we combine authentic South Indian filter techniques with contemporary barista craft to offer an unforgettable beverage experience.`}
                </p>
              </div>
            </ScrollReveal>

            {/* Core Values 2x2 Grid with Equal Height */}
            <ScrollReveal direction="up" delay={0.08}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 items-stretch">
                {values.map((v) => (
                  <div
                    key={v.title}
                    className="h-full w-full p-4 rounded-xl bg-[#1D100A]/85 border border-[#3E2519]/70 hover:border-[#E5A88B]/40 transition-all duration-300 shadow-sm hover:shadow-md group flex items-start gap-3.5 min-h-[90px] sm:min-h-[96px]"
                  >
                    <div className="p-2.5 rounded-lg bg-[#E5A88B]/10 text-[#E5A88B] shrink-0 group-hover:scale-110 transition-transform mt-0.5">
                      <HugeiconsIcon icon={v.icon} size={18} />
                    </div>
                    <div className="space-y-1 flex-1 flex flex-col justify-start">
                      <h4 className="font-heading font-bold text-sm text-white group-hover:text-[#E5A88B] transition-colors">
                        {v.title}
                      </h4>
                      <p className="text-xs text-[#EAD5C3]/70 leading-relaxed">
                        {v.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollReveal>

            {/* Direct CTA */}
            <ScrollReveal direction="up" delay={0.15}>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3.5 pt-1">
                <Link
                  to={ROUTES.PUBLIC.MENU}
                  className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#E5A88B] hover:bg-[#EEB89D] text-[#140A06] font-bold text-xs px-6 py-2.5 shadow-md transition-all hover:scale-105 shrink-0"
                >
                  <span>Explore Drink & Food Offerings</span>
                  <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
                </Link>

                <div className="flex items-center gap-2 text-xs text-cream/70">
                  <HugeiconsIcon icon={Location01Icon} size={14} className="text-[#E5A88B] shrink-0" />
                  <span className="line-clamp-1">{settings?.address || 'Tallur, Andhra Pradesh'}</span>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Right Column (5 cols): Floating Coffee Showcase & Info Cards */}
          <div className="lg:col-span-5 relative flex flex-col items-center justify-center pt-4 lg:pt-0">
            <ScrollReveal direction="scale" delay={0.1}>
              <div className="relative w-full max-w-sm sm:max-w-md mx-auto flex flex-col items-center">
                {/* Radial Glow */}
                <div
                  className="absolute w-64 sm:w-80 h-64 sm:h-80 rounded-full bg-[radial-gradient(circle,rgba(229,168,139,0.18)_0%,transparent_70%)] animate-glow-pulse pointer-events-none -top-2"
                  aria-hidden="true"
                />

                {/* Floating Coffee Image Showcase */}
                <div className="relative z-10 w-48 sm:w-64 aspect-square flex items-center justify-center animate-float-slow">
                  <img
                    src="/about.png"
                    alt="RadhaCafe Artisanal Traditional Brew"
                    className="w-full h-full object-contain filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.8)] transition-transform duration-500 hover:scale-105"
                    loading="lazy"
                  />
                </div>

                {/* Floating Glassmorphic Info Card */}
                <div className="relative z-10 -mt-3 w-full bg-[#1A0D08]/90 backdrop-blur-xl p-4 sm:p-5 rounded-2xl border border-[#E5A88B]/30 shadow-2xl space-y-3">
                  <div className="flex items-center justify-between border-b border-[#3E2519]/70 pb-2.5">
                    <div>
                      <h4 className="font-heading font-bold text-sm text-white">
                        {cafeName} Sanctuary
                      </h4>
                      <p className="text-[11px] text-cream/60">Tallur, Andhra Pradesh</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-[#E5A88B]/15 border border-[#E5A88B]/30 text-[10px] font-bold text-[#E5A88B] uppercase tracking-wider">
                      Estd. 2026
                    </span>
                  </div>

                  {/* Live Status & Opening Hours */}
                  <div className="space-y-2 text-xs text-cream/80">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 shrink-0">
                        <HugeiconsIcon icon={Clock01Icon} size={14} className="text-[#E5A88B]" />
                        <span>Hours:</span>
                      </div>
                      <span className="font-medium text-cream/90 text-right">
                        {settings?.opening_hours || 'Mon - Sun: 4:30 AM - 10:00 PM'}
                      </span>
                    </div>

                    <div className="pt-1">
                      <LiveCafeTime openingHours={settings?.opening_hours} variant="compact" />
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
