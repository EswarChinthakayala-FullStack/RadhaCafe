import { ScrollReveal } from '../shared/ScrollReveal';
import { HugeiconsIcon } from '@hugeicons/react';
import { Coffee02Icon, SparklesIcon, HeartIcon } from '@hugeicons/core-free-icons';

export function IntroStatement() {
  const pillars = [
    {
      icon: Coffee02Icon,
      title: 'Heritage Filter Roast',
      desc: 'Crafted with premium chicory-blended Arabica & Robusta beans for the authentic South Indian aroma.',
    },
    {
      icon: SparklesIcon,
      title: 'Artisanal Freshness',
      desc: 'Every brew is freshly prepared with farm-fresh milk and precision temperature extraction.',
    },
    {
      icon: HeartIcon,
      title: 'Tallur Hospitality',
      desc: 'A warm, inviting neighborhood sanctuary where conversations flow as freely as the coffee.',
    },
  ];

  return (
    <section
      id="intro"
      className="py-16 sm:py-20 bg-[#120805] text-cream border-b border-[#2C1810] relative overflow-hidden"
      aria-label="Brand Philosophy"
    >
      <div className="container px-4 md:px-8 max-w-6xl mx-auto space-y-12 relative z-10">
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-[11px] font-bold text-[#E5A88B] tracking-[0.25em] uppercase">
              The RadhaCafe Philosophy
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold text-cream leading-tight">
              &ldquo;Crafted with intention. Brewed with care. Served with timeless warmth.&rdquo;
            </h2>
            <p className="text-xs sm:text-sm text-[#EAD5C3]/70 max-w-xl mx-auto leading-relaxed">
              We believe a cafe is more than just drinks — it is a daily ritual, a pause in your day, and a place where memories are shared over comforting flavors.
            </p>
          </div>
        </ScrollReveal>

        {/* 3 Brand Craft Pillars with Equal Height */}
        <div className="grid md:grid-cols-3 gap-6 pt-4 items-stretch">
          {pillars.map((pillar, idx) => (
            <ScrollReveal key={pillar.title} direction="up" delay={0.1 * idx} className="h-full">
              <div className="h-full w-full p-6 sm:p-7 rounded-2xl bg-[#1A0D08]/85 border border-[#3E2519]/70 hover:border-[#E5A88B]/40 transition-all duration-300 shadow-md hover:shadow-xl group flex flex-col items-center text-center space-y-3.5">
                <div className="p-3.5 rounded-full bg-[#E5A88B]/10 text-[#E5A88B] border border-[#E5A88B]/20 group-hover:scale-110 transition-transform shrink-0">
                  <HugeiconsIcon icon={pillar.icon} size={22} />
                </div>
                <h3 className="font-heading font-bold text-base text-cream group-hover:text-[#E5A88B] transition-colors">
                  {pillar.title}
                </h3>
                <p className="text-xs text-[#EAD5C3]/75 leading-relaxed font-normal flex-1">
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
