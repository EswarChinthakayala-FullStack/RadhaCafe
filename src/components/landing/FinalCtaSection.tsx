import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { ScrollReveal } from '../shared/ScrollReveal';
import { HugeiconsIcon } from '@hugeicons/react';
import { Coffee02Icon, ArrowUpRight01Icon, Location01Icon } from '@hugeicons/core-free-icons';

export function FinalCtaSection() {
  return (
    <section
      className="py-20 sm:py-28 bg-[#100704] text-cream border-b border-[#2C1810] relative overflow-hidden text-center"
      aria-label="Visit RadhaCafe"
    >
      {/* Background Radial Glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] sm:w-[700px] h-[350px] rounded-full bg-[radial-gradient(circle,rgba(229,168,139,0.1)_0%,transparent_70%)] pointer-events-none"
        aria-hidden="true"
      />

      <div className="container px-4 md:px-8 max-w-4xl mx-auto space-y-8 relative z-10">
        <ScrollReveal direction="scale">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E5A88B]/10 border border-[#E5A88B]/25 text-[#E5A88B] text-[11px] font-bold tracking-[0.25em] uppercase">
              <HugeiconsIcon icon={Coffee02Icon} size={14} />
              <span>Your Daily Sanctuary</span>
            </div>

            <h2 className="font-heading text-3xl sm:text-5xl md:text-6xl font-extrabold text-cream leading-tight">
              We&rsquo;ll have your{' '}
              <span className="font-serif italic font-normal text-[#E5A88B]">
                favourite ready.
              </span>
            </h2>

            <p className="text-xs sm:text-sm md:text-base text-[#EAD5C3]/80 leading-relaxed max-w-xl mx-auto font-normal">
              Whether it&rsquo;s your morning South Indian filter coffee ritual or an evening gathering over artisanal tea and hot snacks, RadhaCafe is here to serve you.
            </p>
          </div>
        </ScrollReveal>

        {/* Action CTAs */}
        <ScrollReveal direction="up" delay={0.15}>
          <div className="flex flex-wrap items-center justify-center gap-3.5 sm:gap-4 pt-2">
            <Link
              to={ROUTES.PUBLIC.MENU}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#B85C1E] to-[#D97026] hover:from-[#C86624] hover:to-[#E87E34] text-white font-bold text-xs sm:text-sm px-7 sm:px-9 py-3 sm:py-3.5 shadow-xl shadow-[#B85C1E]/25 transition-all hover:scale-105 active:scale-95"
            >
              <span>Explore Our Menu</span>
              <HugeiconsIcon icon={ArrowUpRight01Icon} size={15} />
            </Link>

            <Link
              to={ROUTES.PUBLIC.CONTACT}
              className="inline-flex items-center gap-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/20 text-cream font-semibold text-xs sm:text-sm px-6 sm:px-7 py-3 sm:py-3.5 backdrop-blur-sm transition-all hover:border-[#E5A88B]/50"
            >
              <HugeiconsIcon icon={Location01Icon} size={15} className="text-[#E5A88B]" />
              <span>Find Us in Tallur</span>
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
