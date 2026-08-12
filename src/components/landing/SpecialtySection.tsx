import { ScrollReveal } from '../shared/ScrollReveal';
import { HugeiconsIcon } from '@hugeicons/react';
import { Coffee02Icon } from '@hugeicons/core-free-icons';

export function SpecialtySection() {
  const specialties = [
    {
      title: 'Signature Brews',
      desc: 'Traditional filter coffee & handcrafted espresso shots.',
      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=500&q=80',
    },
    {
      title: 'Origin Beans',
      desc: 'Single-origin, ethically farmed organic Arabica beans.',
      image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=500&q=80',
    },
    {
      title: 'Latte Art Magic',
      desc: 'Beautifully poured micro-foam lattes & silky cappuccinos.',
      image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=500&q=80',
    },
    {
      title: 'Seasonal Specials',
      desc: 'Exclusive seasonal drinks & daily oven-baked pastries.',
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=500&q=80',
    },
  ];

  return (
    <section className="py-20 bg-[#160B07] text-cream border-b border-[#2C1810]">
      <div className="container px-4 md:px-8 mx-auto space-y-12">
        <ScrollReveal>
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold text-cinnamon tracking-widest uppercase">
              What We Do Best
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-cream flex items-center justify-center gap-3">
              Our{' '}
              <span className="font-serif italic font-normal text-cinnamon">Specialty</span>
              <HugeiconsIcon icon={Coffee02Icon} size={28} className="text-cinnamon" />
            </h2>
            <p className="text-xs sm:text-sm text-cream/70">
              Crafted for pure flavor & comfort in every single cup.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {specialties.map((item, idx) => (
            <ScrollReveal key={idx} direction="scale" delay={0.1 * idx}>
              <div className="p-6 rounded-md bg-[#1D100A] border border-[#2C1810] hover:border-cinnamon/40 transition-all duration-500 text-center space-y-4 shadow-lg group">
                {/* Circular Image Frame */}
                <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-cinnamon/30 shadow-lg group-hover:scale-105 transition-transform duration-500 bg-[#140A06]">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                  />
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-bold text-base text-cream font-heading group-hover:text-cinnamon transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-cream/60 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
