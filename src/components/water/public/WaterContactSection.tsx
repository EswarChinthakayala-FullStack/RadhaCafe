import { ScrollReveal } from '../../shared/ScrollReveal';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  CallIcon,
  Location01Icon,
  Clock01Icon,
  ArrowUpRight01Icon,
} from '@hugeicons/core-free-icons';

export function WaterContactSection() {
  const contactCards = [
    {
      icon: CallIcon,
      title: 'Direct Phone & Order Line',
      primaryText: '09966630913',
      secondaryText: 'Available 6:00 AM – 9:30 PM daily',
      href: 'tel:09966630913',
      actionLabel: 'Call Now',
    },
    {
      icon: Location01Icon,
      title: 'Service Hub Location',
      primaryText: 'Tallur, Andhra Pradesh',
      secondaryText: 'Doorstep deliveries across all Tallur sectors',
      href: 'https://maps.google.com/?q=Tallur,Andhra+Pradesh',
      actionLabel: 'View on Maps',
    },
    {
      icon: Clock01Icon,
      title: 'Daily Supply Hours',
      primaryText: 'Morning & Evening Routes',
      secondaryText: 'Special event drops coordinated anytime',
      href: '#event-form',
      actionLabel: 'Book Slot',
    },
  ];

  return (
    <section
      id="contact"
      className="py-20 sm:py-28 bg-[#140A06] text-cream border-b border-[#2C1810] relative overflow-hidden"
      aria-label="Contact RadhaWater and Service Details"
    >
      <div className="container px-4 md:px-8 max-w-7xl mx-auto space-y-16 relative z-10">
        <ScrollReveal>
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-[11px] font-bold text-[#E5A88B] tracking-[0.25em] uppercase">
              Local Hospitality & Service
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-cream leading-tight">
              Get in Touch with{' '}
              <span className="font-serif italic font-normal text-[#E5A88B]">
                RadhaWater.
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-[#EAD5C3]/75 leading-relaxed">
              Have questions about daily routes or bulk supply pricing? We are only a quick call or message away.
            </p>
          </div>
        </ScrollReveal>

        {/* Contact Cards */}
        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {contactCards.map((card, idx) => (
            <ScrollReveal key={card.title} direction="up" delay={0.08 * idx} className="h-full">
              <div className="h-full w-full p-6 sm:p-7 rounded-2xl bg-[#1C100B]/85 border border-[#3E2519]/70 hover:border-[#E5A88B]/50 transition-all duration-300 shadow-xl flex flex-col justify-between space-y-5 group">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-[#B85C1E]/15 text-[#E5A88B] flex items-center justify-center border border-[#B85C1E]/25 group-hover:scale-110 transition-transform">
                    <HugeiconsIcon icon={card.icon} size={22} />
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="font-heading font-bold text-base text-cream group-hover:text-[#E5A88B] transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-sm font-semibold text-[#E5A88B] font-mono">
                      {card.primaryText}
                    </p>
                    <p className="text-xs text-[#EAD5C3]/70 leading-relaxed font-normal">
                      {card.secondaryText}
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <a
                    href={card.href}
                    target={card.href.startsWith('http') ? '_blank' : undefined}
                    rel={card.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E5A88B] hover:text-white transition-colors"
                  >
                    <span>{card.actionLabel}</span>
                    <HugeiconsIcon icon={ArrowUpRight01Icon} size={14} />
                  </a>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
