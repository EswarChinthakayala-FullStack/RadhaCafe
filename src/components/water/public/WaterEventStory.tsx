import { ScrollReveal } from '../../shared/ScrollReveal';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  SparklesIcon,
  Building01Icon,
  UserGroupIcon,
  CheckmarkCircle02Icon,
  ArrowDown01Icon,
} from '@hugeicons/core-free-icons';

export function WaterEventStory() {
  const eventTypes = [
    {
      title: 'Grand Weddings & Receptions',
      scale: '100 – 500+ Cans',
      desc: 'Seamless high-capacity bulk delivery with scheduled drops at kalyana mandapams and wedding venues across Tallur.',
      icon: SparklesIcon,
    },
    {
      title: 'Family Functions & Birthdays',
      scale: '20 – 60 Cans',
      desc: 'Hassle-free drinking water arrangements with fresh cooling cans to keep your family and guests comfortable.',
      icon: UserGroupIcon,
    },
    {
      title: 'Corporate & Bank Meetings',
      scale: '10 – 30 Cans',
      desc: 'Professional water supply for conferences, workshops, and business offices with clean food-grade dispensers.',
      icon: Building01Icon,
    },
    {
      title: 'Festivals & Community Events',
      scale: 'Custom Bulk Volume',
      desc: 'Reliable water volume logistics for temple festivals, community feasts, and public gatherings with dedicated delivery timing.',
      icon: CheckmarkCircle02Icon,
    },
  ];

  const handleScrollToForm = () => {
    const el = document.getElementById('event-form');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="events"
      className="py-20 sm:py-28 bg-[#140A06] text-cream border-b border-[#2C1810] relative overflow-hidden"
      aria-label="Wedding and Event Water Supply"
    >
      {/* Soft Ambient Light */}
      <div
        className="absolute top-1/3 right-0 w-96 h-96 bg-[radial-gradient(circle,rgba(229,168,139,0.08)_0%,transparent_70%)] pointer-events-none"
        aria-hidden="true"
      />

      <div className="container px-4 md:px-8 max-w-7xl mx-auto space-y-16 relative z-10">
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B85C1E]/15 border border-[#B85C1E]/30 text-[#E5A88B] text-[11px] font-bold tracking-[0.2em] uppercase">
              <HugeiconsIcon icon={SparklesIcon} size={13} />
              <span>Bulk & Catering Logistics</span>
            </div>

            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-cream leading-tight">
              Water Supply for Weddings,{' '}
              <span className="font-serif italic font-normal text-[#E5A88B]">
                Functions & Gatherings.
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-[#EAD5C3]/75 leading-relaxed max-w-xl mx-auto">
              Planning an auspicious celebration? Ensure your guests are served pristine, chilled drinking water without logistics stress.
            </p>
          </div>
        </ScrollReveal>

        {/* Event Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {eventTypes.map((event, idx) => (
            <ScrollReveal key={event.title} direction="up" delay={0.08 * idx} className="h-full">
              <div className="h-full w-full p-6 sm:p-7 rounded-2xl bg-[#1C100B]/85 border border-[#3E2519]/70 hover:border-[#E5A88B]/50 transition-all duration-300 shadow-xl flex flex-col justify-between space-y-4 group">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-[#B85C1E]/15 text-[#E5A88B] flex items-center justify-center border border-[#B85C1E]/25 group-hover:scale-110 transition-transform">
                    <HugeiconsIcon icon={event.icon} size={22} />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">
                      {event.scale}
                    </span>
                    <h3 className="font-heading font-bold text-base text-cream group-hover:text-[#E5A88B] transition-colors">
                      {event.title}
                    </h3>
                  </div>

                  <p className="text-xs text-[#EAD5C3]/70 leading-relaxed font-normal">
                    {event.desc}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Call to Action for Booking */}
        <ScrollReveal delay={0.2}>
          <div className="text-center pt-4">
            <button
              type="button"
              onClick={handleScrollToForm}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#B85C1E] to-[#D97026] hover:from-[#C86624] hover:to-[#E87E34] text-xs sm:text-sm font-bold text-white transition-all shadow-xl shadow-[#B85C1E]/20 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>Fill Event Requirement Form Below</span>
              <HugeiconsIcon icon={ArrowDown01Icon} size={15} />
            </button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
