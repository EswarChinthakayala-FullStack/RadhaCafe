import { Link } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import { ScrollReveal } from '../../shared/ScrollReveal';
import { HugeiconsIcon } from '@hugeicons/react';
import { Coffee02Icon, ArrowUpRight01Icon } from '@hugeicons/core-free-icons';

export function WaterCafeLink() {
  return (
    <section className="py-16 sm:py-20 bg-[#140A06] text-cream border-b border-[#2C1810] relative overflow-hidden" aria-label="RadhaCafe Hospitality Link">
      <div className="container px-4 md:px-8 max-w-5xl mx-auto relative z-10">
        <ScrollReveal direction="scale">
          <div className="p-8 sm:p-10 rounded-2xl bg-gradient-to-r from-[#1C100B] via-[#24130B] to-[#1C100B] border border-[#3E2519]/70 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5 text-left">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#B85C1E] to-[#D97026] text-white flex items-center justify-center shadow-lg shrink-0">
                <HugeiconsIcon icon={Coffee02Icon} size={28} />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[#E5A88B] tracking-widest uppercase">
                  Sister Hospitality Brand
                </span>
                <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-cream">
                  Looking for RadhaCafe?
                </h3>
                <p className="text-xs sm:text-sm text-[#EAD5C3]/80 max-w-lg leading-relaxed">
                  Discover authentic South Indian filter coffee, artisanal beverages, fresh bakes, and cafe hospitality in Tallur.
                </p>
              </div>
            </div>

            <Link
              to={ROUTES.PUBLIC.HOME}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#B85C1E] to-[#D97026] hover:from-[#C86624] hover:to-[#E87E34] text-white font-bold text-xs sm:text-sm px-6 py-3 shadow-lg transition-all hover:scale-105 active:scale-95 shrink-0"
            >
              <span>Visit RadhaCafe</span>
              <HugeiconsIcon icon={ArrowUpRight01Icon} size={15} />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
