import { Link } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import { RadhaWaterLogo } from '../../brand/AppLogo';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  CallIcon,
  Location01Icon,
  Coffee02Icon,
  ShieldUserIcon,
} from '@hugeicons/core-free-icons';

export function WaterFooter() {
  const currentYear = new Date().getFullYear();

  const handleScrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-[#0A0503] text-cream/70 border-t border-[#2C1810] relative overflow-hidden" aria-label="RadhaWater Footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 sm:gap-10">
          {/* Brand Column */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 shadow-md">
                <RadhaWaterLogo className="w-full h-full" />
              </div>
              <div>
                <span className="font-heading font-extrabold text-xl text-white">
                  Radha<span className="text-[#E5A88B]">Water</span>
                </span>
                <p className="text-[10px] text-[#EAD5C3]/60 font-medium">
                  Drinking Water & Event Supply
                </p>
              </div>
            </div>

            <p className="text-xs text-[#EAD5C3]/70 max-w-sm leading-relaxed">
              Hygienically purified 20 Litre drinking water cans and high-capacity event supply catering to homes, shops, and celebrations across Tallur, Andhra Pradesh.
            </p>

            <div className="flex flex-col gap-1.5 text-xs text-[#EAD5C3]/80 pt-1">
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={CallIcon} size={14} className="text-[#E5A88B] shrink-0" />
                <a href="tel:09966630913" className="hover:text-white transition-colors">
                  09966630913
                </a>
              </div>
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={Location01Icon} size={14} className="text-[#E5A88B] shrink-0" />
                <span>Tallur, Andhra Pradesh</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-heading">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => handleScrollTo('home')}
                  className="hover:text-[#E5A88B] transition-colors cursor-pointer"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleScrollTo('products')}
                  className="hover:text-[#E5A88B] transition-colors cursor-pointer"
                >
                  Water Products & Pricing
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleScrollTo('why-us')}
                  className="hover:text-[#E5A88B] transition-colors cursor-pointer"
                >
                  Why RadhaWater
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleScrollTo('how-it-works')}
                  className="hover:text-[#E5A88B] transition-colors cursor-pointer"
                >
                  How Ordering Works
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleScrollTo('events')}
                  className="hover:text-[#E5A88B] transition-colors cursor-pointer"
                >
                  Wedding & Event Supply
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleScrollTo('contact')}
                  className="hover:text-[#E5A88B] transition-colors cursor-pointer"
                >
                  Contact & Delivery Hours
                </button>
              </li>
            </ul>
          </div>

          {/* Brand Links & Administration */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-heading">
              Ecosystem & Portal
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  to={ROUTES.PUBLIC.HOME}
                  className="inline-flex items-center gap-1.5 hover:text-white transition-colors text-[#EAD5C3]/80"
                >
                  <HugeiconsIcon icon={Coffee02Icon} size={13} className="text-[#E5A88B]" />
                  <span>RadhaCafe Main Site</span>
                </Link>
              </li>
              <li>
                <Link
                  to={ROUTES.PUBLIC.MENU}
                  className="hover:text-[#E5A88B] transition-colors"
                >
                  RadhaCafe Menu
                </Link>
              </li>
              <li>
                <Link
                  to={ROUTES.PUBLIC.LOGIN}
                  className="inline-flex items-center gap-1.5 text-[#E5A88B]/80 hover:text-[#E5A88B] transition-colors pt-2"
                >
                  <HugeiconsIcon icon={ShieldUserIcon} size={13} />
                  <span>Admin Management</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#2C1810] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-cream/50">
          <p>&copy; {currentYear} RadhaWater. All rights reserved. Tallur, Andhra Pradesh.</p>
          <p className="flex items-center gap-1">
            <span>Delivering pure hydration daily across Tallur.</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
