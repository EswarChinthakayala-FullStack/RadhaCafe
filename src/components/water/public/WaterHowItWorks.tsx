import { ScrollReveal } from '../../shared/ScrollReveal';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  DropletIcon,
  DeliveryTruck01Icon,
  CallIcon,
  CheckmarkCircle02Icon,
} from '@hugeicons/core-free-icons';

export function WaterHowItWorks() {
  const steps = [
    {
      number: '01',
      icon: DropletIcon,
      title: 'Choose Water Type',
      desc: 'Select standard 20L normal water cans (₹5) or instant chilled cooling water cans (₹30) according to your needs.',
    },
    {
      number: '02',
      icon: DeliveryTruck01Icon,
      title: 'Tell Us Quantity & Date',
      desc: 'Let us know how many cans you require — from a single daily home drop to a 100+ can wedding arrangement.',
    },
    {
      number: '03',
      icon: CallIcon,
      title: 'Submit Form or Call',
      desc: 'Fill out our quick event inquiry form with your venue address, or dial 09966630913 for immediate phone booking.',
    },
    {
      number: '04',
      icon: CheckmarkCircle02Icon,
      title: 'Punctual Doorstep Delivery',
      desc: 'Our delivery team arrives with freshly sealed, sanitized cans right at your doorstep or function venue.',
    },
  ];

  return (
    <section
      id="how-it-works"
      className="py-20 sm:py-28 bg-[#140A06] text-cream border-b border-[#2C1810] relative overflow-hidden"
      aria-label="How RadhaWater Ordering Works"
    >
      <div className="container px-4 md:px-8 max-w-7xl mx-auto space-y-16 relative z-10">
        <ScrollReveal>
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-[11px] font-bold text-[#E5A88B] tracking-[0.25em] uppercase">
              Simple & Transparent
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-cream leading-tight">
              How Ordering{' '}
              <span className="font-serif italic font-normal text-[#E5A88B]">
                Works.
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-[#EAD5C3]/75 leading-relaxed">
              No complicated apps or sign-ups required. Getting clean water delivered is as effortless as 4 simple steps.
            </p>
          </div>
        </ScrollReveal>

        {/* 4 Steps Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {steps.map((step, idx) => (
            <ScrollReveal key={step.number} direction="up" delay={0.08 * idx} className="h-full">
              <div className="h-full w-full p-6 sm:p-7 rounded-2xl bg-[#1C100B]/85 border border-[#3E2519]/70 hover:border-[#E5A88B]/50 transition-all duration-300 shadow-lg group flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-[#B85C1E]/15 text-[#E5A88B] flex items-center justify-center border border-[#B85C1E]/25 group-hover:scale-110 transition-transform">
                    <HugeiconsIcon icon={step.icon} size={22} />
                  </div>
                  <span className="font-heading font-extrabold text-2xl text-[#E5A88B]/30 group-hover:text-[#E5A88B]/60 transition-colors">
                    {step.number}
                  </span>
                </div>

                <div className="space-y-2 flex-1 flex flex-col justify-start">
                  <h3 className="font-heading font-bold text-base text-cream group-hover:text-[#E5A88B] transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-xs text-[#EAD5C3]/70 leading-relaxed font-normal">
                    {step.desc}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
