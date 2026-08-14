import { ScrollReveal } from '../shared/ScrollReveal';
import { PremiumImage } from '../shared/PremiumImage';
import { HugeiconsIcon } from '@hugeicons/react';
import { Coffee02Icon, SparklesIcon } from '@hugeicons/core-free-icons';

export function SpecialtySection() {
  const specialties = [
    {
      title: 'Signature Brews',
      desc: 'Traditional South Indian filter coffee & handcrafted espresso creations.',
      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
      alt: 'Artisanal South Indian traditional filter coffee with velvety froth',
    },
    {
      title: 'Ethical Origin Beans',
      desc: 'Single-origin, ethically farmed Arabica & Robusta roasted for rich crema.',
      image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=600&q=80',
      alt: 'Bag of premium single origin coffee beans from sustainable estates',
    },
    {
      title: 'Velvety Microfoam',
      desc: 'Silk-textured flat whites, lattes, and cappuccinos poured with precision.',
      image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=600&q=80',
      alt: 'Delicate barista latte art tulip pattern on freshly steamed microfoam',
    },
    {
      title: 'Fresh Bakes & Snacks',
      desc: 'Freshly prepared savoury bites and confectionery paired perfectly with your brew.',
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=600&q=80',
      alt: 'Gourmet warm baked cafe snack accompaniment served fresh',
    },
  ];

  return (
    <section className="py-20 sm:py-24 bg-[#140A06] text-cream border-b border-[#2C1810] relative overflow-hidden" aria-label="Our Specialties">
      <div className="container px-4 md:px-8 max-w-7xl mx-auto space-y-12 relative z-10">
        <ScrollReveal>
          <div className="text-center max-w-xl mx-auto space-y-2.5">
            <span className="text-[11px] font-bold text-[#E5A88B] tracking-[0.25em] uppercase">
              Our Artisanal Standards
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-cream flex items-center justify-center gap-3">
              <span>What We Do</span>
              <span className="font-serif italic font-normal text-[#E5A88B]">Best</span>
              <HugeiconsIcon icon={Coffee02Icon} size={26} className="text-[#E5A88B]" />
            </h2>
            <p className="text-xs sm:text-sm text-[#EAD5C3]/75 leading-relaxed">
              Every detail matters — from roast temperature and grind fineness to the warmth of our welcome.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {specialties.map((item, idx) => (
            <ScrollReveal key={item.title} direction="scale" delay={0.08 * idx} className="h-full">
              <div className="h-full w-full p-6 rounded-2xl bg-[#1C100B]/85 border border-[#3E2519]/70 hover:border-[#E5A88B]/50 transition-colors duration-300 text-center space-y-4 shadow-lg hover:shadow-2xl group flex flex-col justify-between">
                {/* Circular Image Frame with gold accent border */}
                <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-[#E5A88B]/40 shadow-xl group-hover:scale-105 transition-transform duration-500 bg-[#140A06] p-0.5">
                  <PremiumImage
                    src={item.image}
                    alt={item.alt}
                    aspectRatio="1/1"
                    fit="cover"
                    className="w-full h-full rounded-full"
                    containerClassName="w-full h-full rounded-full bg-transparent"
                  />
                </div>

                <div className="space-y-2">
                  <h3 className="font-heading font-bold text-base text-cream group-hover:text-[#E5A88B] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#EAD5C3]/70 leading-relaxed font-normal">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-2 flex justify-center">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#E5A88B]/70 uppercase tracking-wider group-hover:text-[#E5A88B] transition-colors">
                    <HugeiconsIcon icon={SparklesIcon} size={11} />
                    <span>Radha Quality</span>
                  </span>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
