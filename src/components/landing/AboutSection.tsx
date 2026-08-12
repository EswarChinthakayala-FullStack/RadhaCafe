import { useCafeSettings } from '../../hooks/useCafeSettings';
import { ScrollReveal } from '../shared/ScrollReveal';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Coffee02Icon,
  Leaf01Icon,
  SparklesIcon,
  Home01Icon,
  UserGroupIcon,
  FlashIcon,
  CheckmarkCircle02Icon,
  HeartIcon,
} from '@hugeicons/core-free-icons';

export function AboutSection() {
  const { data: settings } = useCafeSettings();

  const leftFeatures = [
    { icon: Coffee02Icon, title: 'Fresh Beans', desc: 'Always roasted & ground daily for peak aroma' },
    { icon: Leaf01Icon, title: 'Sustainable', desc: 'Ethically sourced from eco-conscious farms' },
    { icon: SparklesIcon, title: 'Unique Blends', desc: 'Crafted with passion by expert baristas' },
    { icon: Home01Icon, title: 'Cozy Space', desc: 'Warm lighting & soothing interior vibes' },
  ];

  const rightFeatures = [
    { icon: UserGroupIcon, title: 'Community', desc: 'A welcoming space for memorable conversations' },
    { icon: FlashIcon, title: 'Fast Service', desc: 'Quick takeaways & efficient table orders' },
    { icon: CheckmarkCircle02Icon, title: 'Perfect Match', desc: 'Artisanal snacks paired with your coffee' },
    { icon: HeartIcon, title: 'Cultural Touch', desc: 'Authentic Tallur heritage hospitality' },
  ];

  return (
    <section id="about" className="py-24 bg-[#140A06] text-[#EAD5C3] border-b border-[#2C1810] relative overflow-hidden">
      <div className="container px-4 md:px-8 mx-auto space-y-16 relative z-10">
        {/* Section Header */}
        <ScrollReveal>
          <div className="text-center max-w-xl mx-auto space-y-3">
            <span className="text-xs font-bold text-[#E5A88B] tracking-widest uppercase">
              Our Story & Values
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
              About{' '}
              <span className="font-serif italic font-normal text-[#E5A88B]">
                {settings?.cafe_name || 'RadhaCafe'}
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-[#EAD5C3]/80 leading-relaxed font-normal">
              {settings?.about_text ||
                'At RadhaCafe, every cup tells a story. From ethically sourced coffee beans to perfected brewing methods, we bring warmth and authentic cafe culture to your table.'}
            </p>
          </div>
        </ScrollReveal>

        {/* 3-Column Layout: Left Features | Center Transparent Floating Coffee Showcase | Right Features */}
        <div className="grid lg:grid-cols-3 gap-8 items-center">
          {/* Left Feature Column */}
          <div className="space-y-4">
            {leftFeatures.map((item, idx) => (
              <ScrollReveal key={idx} direction="left" delay={0.08 * idx}>
                <div className="flex items-start gap-4 p-4 rounded-md bg-[#1D100A]/90 border border-[#3E2519]/70 hover:border-[#E5A88B]/50 transition-all shadow-md group">
                  <div className="p-3 rounded-md bg-[#E5A88B]/15 text-[#E5A88B] shrink-0 group-hover:scale-110 transition-transform">
                    <HugeiconsIcon icon={item.icon} size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white group-hover:text-[#E5A88B] transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-xs text-[#EAD5C3]/75 mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* Center Showcase — Transparent Floating Coffee Cup Visual */}
          <ScrollReveal direction="scale" delay={0.15}>
            <div className="relative flex flex-col justify-center items-center py-6">
              {/* Warm Ambient Glow Behind Coffee Cup */}
              <div
                className="absolute w-72 h-72 rounded-full bg-[radial-gradient(circle,rgba(229,168,139,0.22)_0%,transparent_70%)] animate-glow-pulse pointer-events-none"
                aria-hidden="true"
              />

              {/* Floating Coffee Showcase Image */}
              <div className="relative z-10 w-64 sm:w-80 aspect-square flex items-center justify-center animate-float-slow">
                <img
                  src="/about.png"
                  alt="RadhaCafe Artisanal Coffee"
                  className="w-full h-full object-contain filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.7)] transition-transform duration-500 hover:scale-105"
                  loading="lazy"
                />
              </div>

              {/* Floating Badge Label underneath */}
              <div className="relative z-10 -mt-2 bg-[#1C100B]/90 backdrop-blur-md px-5 py-2.5 rounded-full border border-[#E5A88B]/40 shadow-xl text-center space-y-0.5">
                <p className="text-[11px] font-bold text-[#E5A88B] uppercase tracking-wider">
                  Traditional Filter Roast
                </p>
                <p className="text-[10px] text-[#EAD5C3]/70 font-medium">Est. 2026 &middot; Tallur, AP</p>
              </div>
            </div>
          </ScrollReveal>

          {/* Right Feature Column */}
          <div className="space-y-4">
            {rightFeatures.map((item, idx) => (
              <ScrollReveal key={idx} direction="right" delay={0.08 * idx}>
                <div className="flex items-start gap-4 p-4 rounded-md bg-[#1D100A]/90 border border-[#3E2519]/70 hover:border-[#E5A88B]/50 transition-all shadow-md group">
                  <div className="p-3 rounded-md bg-[#E5A88B]/15 text-[#E5A88B] shrink-0 group-hover:scale-110 transition-transform">
                    <HugeiconsIcon icon={item.icon} size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white group-hover:text-[#E5A88B] transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-xs text-[#EAD5C3]/75 mt-1 leading-relaxed">{item.desc}</p>
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
