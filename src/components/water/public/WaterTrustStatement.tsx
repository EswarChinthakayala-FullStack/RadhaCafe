import { ScrollReveal } from '../../shared/ScrollReveal';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  SparklesIcon,
  CheckmarkCircle02Icon,
  DeliveryTruck01Icon,
} from '@hugeicons/core-free-icons';

export function WaterTrustStatement() {
  const pillars = [
    {
      icon: CheckmarkCircle02Icon,
      title: 'Purity Verified',
      desc: 'Rigorous multi-stage reverse osmosis and UV filtration ensures clean, safe, and mineral-balanced drinking water for your family.',
    },
    {
      icon: DeliveryTruck01Icon,
      title: 'Daily Doorstep Reliability',
      desc: 'Scheduled morning and evening supply of 20L cans to residential homes, retail stores, and commercial establishments across Tallur.',
    },
    {
      icon: SparklesIcon,
      title: 'Grand Event Logistics',
      desc: 'Bulk water supply for wedding halls, family functions, reception parties, and festive community gatherings.',
    },
  ];

  return (
    <section
      id="statement"
      className="py-16 sm:py-24 bg-[#140A06] text-cream border-b border-[#2C1810] relative overflow-hidden"
      aria-label="RadhaWater Philosophy"
    >
      <div className="container px-4 md:px-8 max-w-6xl mx-auto space-y-12 relative z-10">
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-[11px] font-bold text-[#E5A88B] tracking-[0.25em] uppercase">
              The RadhaWater Standard
            </span>
            <h2 className="font-heading text-2xl sm:text-4xl md:text-5xl font-extrabold text-cream leading-tight">
              &ldquo;Pure water for everyday rituals.{' '}
              <span className="font-serif italic font-normal text-[#E5A88B]">
                Reliable supply for life&rsquo;s biggest celebrations.&rdquo;
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-[#EAD5C3]/75 max-w-xl mx-auto leading-relaxed">
              We believe pure drinking water is fundamental to wellbeing and festive hospitality. Every can is sterilized, filled with precision, and delivered fresh.
            </p>
          </div>
        </ScrollReveal>

        {/* 3 Craft Pillars */}
        <div className="grid md:grid-cols-3 gap-6 pt-4 items-stretch">
          {pillars.map((pillar, idx) => (
            <ScrollReveal key={pillar.title} direction="up" delay={0.1 * idx} className="h-full">
              <div className="h-full w-full p-6 sm:p-7 rounded-2xl bg-[#1C100B]/85 border border-[#3E2519]/70 hover:border-[#E5A88B]/50 transition-all duration-300 shadow-md hover:shadow-xl group flex flex-col items-center text-center space-y-3.5">
                <div className="p-3.5 rounded-full bg-[#B85C1E]/15 text-[#E5A88B] border border-[#B85C1E]/25 group-hover:scale-110 transition-transform shrink-0">
                  <HugeiconsIcon icon={pillar.icon} size={22} />
                </div>
                <h3 className="font-heading font-bold text-base text-cream group-hover:text-[#E5A88B] transition-colors">
                  {pillar.title}
                </h3>
                <p className="text-xs text-[#EAD5C3]/70 leading-relaxed font-normal flex-1">
                  {pillar.desc}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
