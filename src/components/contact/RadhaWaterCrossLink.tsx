import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { Card, CardContent } from '../ui/card';
import { HugeiconsIcon } from '@hugeicons/react';
import { DropletIcon, ArrowRight01Icon, TruckIcon } from '@hugeicons/core-free-icons';

export function RadhaWaterCrossLink() {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6">
      <Card className="border border-[#3E2519]/80 bg-gradient-to-r from-[#1D100A] via-[#1A0E08] to-[#140A06] rounded-2xl shadow-xl overflow-hidden backdrop-blur-md">
        <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-14 h-14 rounded-2xl bg-[#E5A88B]/10 text-[#E5A88B] border border-[#E5A88B]/20 flex items-center justify-center shrink-0">
              <HugeiconsIcon icon={DropletIcon} size={28} />
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#E5A88B] uppercase tracking-widest">
                <HugeiconsIcon icon={TruckIcon} size={12} />
                <span>COMMERCIAL & EVENT SERVICES</span>
              </div>
              <h3 className="font-heading font-bold text-lg sm:text-xl text-cream">
                Looking for 20L Pure Water Cans or Bulk Event Supply?
              </h3>
              <p className="text-xs text-[#EAD5C3]/75 max-w-xl leading-relaxed">
                RadhaWater operates a dedicated RO purification plant serving commercial routes, weddings, functions, and household door deliveries across Tallur.
              </p>
            </div>
          </div>

          <div className="shrink-0 w-full sm:w-auto">
            <Link
              to={ROUTES.PUBLIC.WATER}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#B85C1E] to-[#D97026] hover:from-[#C86624] hover:to-[#E87E34] text-white font-bold text-xs shadow-lg shadow-[#B85C1E]/25 transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
            >
              <span>Visit RadhaWater Plants</span>
              <HugeiconsIcon icon={ArrowRight01Icon} size={15} />
            </Link>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
