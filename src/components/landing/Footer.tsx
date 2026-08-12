import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { useCafeSettings } from '../../hooks/useCafeSettings';
import { AppLogo } from '../brand/AppLogo';
import { HugeiconsIcon } from '@hugeicons/react';
import { Location01Icon, Clock01Icon, CallIcon, Mail01Icon } from '@hugeicons/core-free-icons';

export function Footer() {
  const { data: settings } = useCafeSettings();

  const phone = settings?.phone || '09966630913';
  const email = settings?.email || 'radhacafe.tallur@gmail.com';
  const openingHours = settings?.opening_hours || 'Mon - Sun: 4:30 AM - 10:00 PM';
  const address = settings?.address?.includes('Main Market')
    ? 'Tallur, Andhra Pradesh'
    : settings?.address || 'Tallur, Andhra Pradesh';

  const navLinks = [
    { label: 'Home', path: ROUTES.PUBLIC.HOME },
    { label: 'Menu', path: ROUTES.PUBLIC.MENU },
    { label: 'Gallery', path: ROUTES.PUBLIC.GALLERY },
    { label: 'Reviews', path: ROUTES.PUBLIC.DISCUSSIONS },
    { label: 'Contact', path: ROUTES.PUBLIC.CONTACT },
  ];

  return (
    <footer className="border-t border-[#2C1810] bg-[#0F0704] text-cream">
      <div className="container px-4 md:px-8 max-w-7xl mx-auto py-14">
        <div className="grid md:grid-cols-3 gap-10 lg:gap-16">
          {/* Brand Column */}
          <div className="space-y-4">
            <AppLogo href="/" variant="default" size="sm" lightText />
            <p className="text-xs text-cream/60 leading-relaxed max-w-xs">
              {settings?.tagline || 'Artisanal coffee & warm hospitality in the heart of Tallur. Every cup crafted with care.'}
            </p>
          </div>

          {/* Navigation Column */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold tracking-widest uppercase text-cream/40">
              Quick Links
            </h4>
            <nav className="flex flex-col gap-2" aria-label="Footer navigation">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.path}
                  className="text-sm text-cream/75 hover:text-cinnamon transition-colors w-fit"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact Column */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold tracking-widest uppercase text-cream/40">
              Get In Touch
            </h4>
            <div className="space-y-3 text-xs text-cream/70">
              {address && (
                <div className="flex items-start gap-2.5">
                  <HugeiconsIcon icon={Location01Icon} size={14} className="text-cinnamon shrink-0 mt-0.5" />
                  <span>{address}</span>
                </div>
              )}
              <div className="flex items-center gap-2.5">
                <HugeiconsIcon icon={Clock01Icon} size={14} className="text-cinnamon shrink-0" />
                <span>{openingHours}</span>
              </div>
              {phone && (
                <a href={`tel:${phone.replace(/\s+/g, '')}`} className="flex items-center gap-2.5 hover:text-cinnamon transition-colors">
                  <HugeiconsIcon icon={CallIcon} size={14} className="text-cinnamon shrink-0" />
                  <span>{phone}</span>
                </a>
              )}
              {email && (
                <a href={`mailto:${email}`} className="flex items-center gap-2.5 hover:text-cinnamon transition-colors">
                  <HugeiconsIcon icon={Mail01Icon} size={14} className="text-cinnamon shrink-0" />
                  <span>{email}</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-[#2C1810] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-cream/40">
            &copy; {new Date().getFullYear()} RadhaCafe. All rights reserved.
          </p>
          <Link
            to={ROUTES.PUBLIC.LOGIN}
            className="text-[11px] text-cream/40 hover:text-cinnamon transition-colors"
          >
            Admin POS
          </Link>
        </div>
      </div>
    </footer>
  );
}
