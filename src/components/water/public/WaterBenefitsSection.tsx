import { ScrollReveal } from '../../shared/ScrollReveal';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  DropletIcon,
  SparklesIcon,
  DeliveryTruck01Icon,
  CheckmarkCircle02Icon,
} from '@hugeicons/core-free-icons';

export function WaterBenefitsSection() {
  const benefits = [
    {
      icon: DropletIcon,
      title: 'Affordable Everyday Supply',
      desc: 'At just ₹5 per standard 20L can, RadhaWater makes premium-filtered, safe drinking water accessible for every home, school, and local business.',
    },
    {
      icon: SparklesIcon,
      title: 'Instant Chilled Cooling Water',
      desc: 'Beat the heat with ready-to-serve chilled cooling water cans at ₹30, perfect for corporate meetings, summer functions, and celebrations.',
    },
    {
      icon: DeliveryTruck01Icon,
      title: 'Reliable Doorstep Delivery',
      desc: 'Morning and evening delivery routes covering neighborhoods across Tallur with courteous, on-schedule handling.',
    },
    {
      icon: CheckmarkCircle02Icon,
      title: 'Advanced RO + UV Purification',
      desc: 'Multi-barrier filtration eliminates impurities, bacteria, and excessive hardness while retaining essential mineral taste.',
    },
  ];

  return (
    <section
      id="why-us"
      className="py-20 sm:py-28 bg-[#140A06] text-cream border-b border-[#2C1810] relative overflow-hidden"
      aria-label="Why RadhaWater"
    >
      {/* Background Radial Glow */}
      <div
        className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-[radial-gradient(circle,rgba(229,168,139,0.06)_0%,transparent_70%)] pointer-events-none"
        aria-hidden="true"
      />

      <div className="container px-4 md:px-8 max-w-7xl mx-auto space-y-16 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column (5 cols): Story & Heading */}
          <div className="lg:col-span-5 space-y-6">
            <ScrollReveal direction="left">
              <div className="space-y-3.5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B85C1E]/15 border border-[#B85C1E]/30 text-[#E5A88B] text-[11px] font-bold tracking-[0.2em] uppercase">
                  <span>Our Service Promise</span>
                </div>

                <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-cream leading-tight">
                  Water You Can{' '}
                  <span className="font-serif italic font-normal text-[#E5A88B]">
                    Trust Blindly.
                  </span>
                </h2>

                <p className="text-xs sm:text-sm text-[#EAD5C3]/75 leading-relaxed font-normal pt-1">
                  We started RadhaWater with a singular mission: to provide the families, institutions, and celebratory gatherings of Tallur with pure, reliable drinking water at transparent local pricing.
                </p>
              </div>
            </ScrollReveal>
          </div>

          {/* Right Column (7 cols): 4 Benefit Rows with Equal Height */}
          <div className="lg:col-span-7 grid sm:grid-cols-2 gap-4 items-stretch">
            {benefits.map((b, idx) => (
              <ScrollReveal key={b.title} direction="up" delay={0.08 * idx} className="h-full">
                <div className="h-full w-full p-5 rounded-2xl bg-[#1C100B]/85 border border-[#3E2519]/70 hover:border-[#E5A88B]/50 transition-all duration-300 shadow-md group flex items-start gap-4 min-h-[110px]">
                  <div className="p-3 rounded-xl bg-[#B85C1E]/15 text-[#E5A88B] shrink-0 group-hover:scale-110 transition-transform mt-0.5 border border-[#B85C1E]/25">
                    <HugeiconsIcon icon={b.icon} size={20} />
                  </div>
                  <div className="space-y-1.5 flex-1 flex flex-col justify-start">
                    <h3 className="font-heading font-bold text-base text-cream group-hover:text-[#E5A88B] transition-colors">
                      {b.title}
                    </h3>
                    <p className="text-xs text-[#EAD5C3]/70 leading-relaxed font-normal">
                      {b.desc}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
