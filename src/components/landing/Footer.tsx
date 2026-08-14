import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { useCafeSettings } from '../../hooks/useCafeSettings';
import { AppLogo } from '../brand/AppLogo';
import { HugeiconsIcon } from '@hugeicons/react';
import { Location01Icon, Clock01Icon, CallIcon, Mail01Icon, ArrowUpRight01Icon } from '@hugeicons/core-free-icons';

export function Footer() {
  const { data: settings } = useCafeSettings();

  const phone = settings?.phone || '09966630913';
  const email = settings?.email || 'radhacafe.tallur@gmail.com';
  const openingHours = settings?.opening_hours || 'Mon - Sun: 4:30 AM - 10:00 PM';
  const address = settings?.address?.includes('Main Market')
    ? 'Tallur, Andhra Pradesh 523264'
    : settings?.address || 'Tallur, Andhra Pradesh 523264';

  const navLinks = [
    { label: 'Home', path: ROUTES.PUBLIC.HOME },
    { label: 'Our Story', path: '/#about' },
    { label: 'Menu & Offerings', path: ROUTES.PUBLIC.MENU },
    { label: 'RadhaWater Plants', path: ROUTES.PUBLIC.WATER },
    { label: 'Photo Gallery', path: ROUTES.PUBLIC.GALLERY },
    { label: 'Guest Reviews', path: ROUTES.PUBLIC.REVIEWS },
    { label: 'Visit & Contact', path: ROUTES.PUBLIC.CONTACT },
  ];

  return (
    <footer className="border-t border-[#2C1810] bg-[#0A0503] text-cream relative overflow-hidden">
      {/* Ambient background glow */}
      <div
        className="absolute bottom-0 right-0 w-96 h-96 bg-[radial-gradient(circle,rgba(229,168,139,0.04)_0%,transparent_70%)] pointer-events-none"
        aria-hidden="true"
      />

      <div className="container px-4 md:px-8 max-w-7xl mx-auto py-16 relative z-10">
        <div className="grid md:grid-cols-12 gap-10 lg:gap-16 pb-12 border-b border-[#2C1810]">
          {/* Brand Column (5 cols) */}
          <div className="md:col-span-5 space-y-5">
            <AppLogo href="/" variant="default" size="md" lightText />
            <p className="text-xs sm:text-sm text-[#EAD5C3]/70 leading-relaxed max-w-sm font-normal">
              {settings?.tagline ||
                'Artisanal coffee, traditional filter brews & warm hospitality in the heart of Tallur. Every cup crafted with intention and care.'}
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1C100B] border border-[#3E2519] text-[11px] font-bold text-[#E5A88B] tracking-wider uppercase">
                <span>Tallur Community Hearth</span>
                <span>&middot;</span>
                <span>Est. 2026</span>
              </span>
            </div>
          </div>

          {/* Navigation Column (3 cols) */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs font-bold tracking-[0.2em] uppercase text-[#E5A88B]">
              Quick Navigation
            </h4>
            <nav className="flex flex-col gap-2.5" aria-label="Footer navigation">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.path}
                  className="text-xs sm:text-sm text-cream/70 hover:text-[#E5A88B] transition-colors w-fit flex items-center gap-1 group"
                >
                  <span>{link.label}</span>
                  <HugeiconsIcon
                    icon={ArrowUpRight01Icon}
                    size={11}
                    className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#E5A88B]"
                  />
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact Column (4 cols) */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="text-xs font-bold tracking-[0.2em] uppercase text-[#E5A88B]">
              Get In Touch
            </h4>
            <div className="space-y-3.5 text-xs text-[#EAD5C3]/75">
              {address && (
                <div className="flex items-start gap-3">
                  <HugeiconsIcon icon={Location01Icon} size={16} className="text-[#E5A88B] shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{address}</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <HugeiconsIcon icon={Clock01Icon} size={16} className="text-[#E5A88B] shrink-0" />
                <span>{openingHours}</span>
              </div>
              {phone && (
                <a
                  href={`tel:${phone.replace(/\s+/g, '')}`}
                  className="flex items-center gap-3 hover:text-[#E5A88B] transition-colors font-medium"
                >
                  <HugeiconsIcon icon={CallIcon} size={16} className="text-[#E5A88B] shrink-0" />
                  <span>{phone}</span>
                </a>
              )}
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="flex items-center gap-3 hover:text-[#E5A88B] transition-colors font-medium break-all"
                >
                  <HugeiconsIcon icon={Mail01Icon} size={16} className="text-[#E5A88B] shrink-0" />
                  <span>{email}</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-cream/50">
          <p>
            &copy; {new Date().getFullYear()} RadhaCafe. All rights reserved &middot; Tallur, Andhra Pradesh.
          </p>
          <div className="flex items-center gap-4">
            <Link
              to={ROUTES.PUBLIC.LOGIN}
              className="hover:text-[#E5A88B] transition-colors font-medium flex items-center gap-1"
            >
              <span>Admin POS Portal</span>
              <HugeiconsIcon icon={ArrowUpRight01Icon} size={12} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
