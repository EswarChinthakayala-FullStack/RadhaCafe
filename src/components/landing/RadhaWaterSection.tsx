import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { ScrollReveal } from '../shared/ScrollReveal';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  DropletIcon,
  SparklesIcon,
  CheckmarkCircle02Icon,
  DeliveryTruck01Icon,
  ArrowRight01Icon,
} from '@hugeicons/core-free-icons';

export function RadhaWaterSection() {
  const features = [
    {
      icon: CheckmarkCircle02Icon,
      title: 'Multi-Stage RO + UV Filtration',
      desc: 'Tested and certified for pristine mineral balance, zero contaminants, and crystal-clear freshness.',
    },
    {
      icon: DeliveryTruck01Icon,
      title: 'Doorstep & Event Supply',
      desc: 'Reliable bulk supply for households, corporate offices, celebrations, and wedding catering in Tallur.',
    },
    {
      icon: SparklesIcon,
      title: '20L Cans & Packaged Bottles',
      desc: 'Sterilized, high-grade food-safe containers delivered on schedule with quick digital booking.',
    },
  ];

  return (
    <section
      id="water"
      className="py-20 sm:py-28 bg-[#140A06] text-cream border-b border-[#2C1810] relative overflow-hidden"
      aria-label="RadhaWater Services"
    >
      {/* Warm Golden Radial Glows */}
      <div
        className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-[radial-gradient(circle,rgba(229,168,139,0.06)_0%,transparent_70%)] pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 right-1/4 w-96 h-96 bg-[radial-gradient(circle,rgba(184,92,30,0.05)_0%,transparent_70%)] pointer-events-none"
        aria-hidden="true"
      />

      <div className="container px-4 md:px-8 max-w-7xl mx-auto space-y-14 relative z-10">
        {/* Section Header */}
        <ScrollReveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#2C1810]">
            <div className="space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B85C1E]/15 border border-[#B85C1E]/30 text-[#E5A88B] text-[11px] font-bold tracking-[0.2em] uppercase">
                <HugeiconsIcon icon={DropletIcon} size={13} />
                <span>Also From Radha Enterprise</span>
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-cream leading-tight">
                RadhaWater.{' '}
                <span className="font-serif italic font-normal text-[#E5A88B]">
                  Pure Hydration.
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-[#EAD5C3]/75 leading-relaxed">
                Beyond handcrafted beverages, Radha Enterprise delivers premium-purified drinking water packaged with the highest standards of hygiene and care.
              </p>
            </div>

            <Link
              to={ROUTES.PUBLIC.WATER}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#B85C1E] to-[#D97026] hover:from-[#C86624] hover:to-[#E87E34] text-xs sm:text-sm font-bold text-white transition-all shadow-lg hover:shadow-[#B85C1E]/20 hover:scale-105 active:scale-95 shrink-0"
            >
              <span>Explore RadhaWater</span>
              <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
            </Link>
          </div>
        </ScrollReveal>

        {/* 3 Pillars Grid */}
        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {features.map((feat, idx) => (
            <ScrollReveal key={feat.title} direction="up" delay={0.08 * idx} className="h-full">
              <div className="h-full w-full p-6 sm:p-7 rounded-2xl bg-[#1C100B]/85 border border-[#3E2519]/70 hover:border-[#E5A88B]/50 transition-all duration-300 shadow-md hover:shadow-xl group flex flex-col items-center text-center space-y-3.5">
                <div className="p-3.5 rounded-full bg-[#B85C1E]/15 text-[#E5A88B] border border-[#B85C1E]/25 group-hover:scale-110 transition-transform shrink-0">
                  <HugeiconsIcon icon={feat.icon} size={22} />
                </div>
                <h3 className="font-heading font-bold text-base text-cream group-hover:text-[#E5A88B] transition-colors">
                  {feat.title}
                </h3>
                <p className="text-xs text-[#EAD5C3]/75 leading-relaxed font-normal flex-1">
                  {feat.desc}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
