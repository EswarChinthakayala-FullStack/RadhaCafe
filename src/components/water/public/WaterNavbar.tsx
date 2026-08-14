import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import { RadhaWaterLogo } from '../../brand/AppLogo';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../../ui/sheet';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Menu01Icon,
  ArrowRight01Icon,
  CallIcon,
  Coffee02Icon,
} from '@hugeicons/core-free-icons';

export function WaterNavbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('home');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);

      const sections = ['home', 'products', 'why-us', 'how-it-works', 'events', 'contact'];
      const scrollPos = window.scrollY + 120;

      for (const sec of sections) {
        const el = document.getElementById(sec);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(sec);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', sectionId: 'home' },
    { label: 'Water Products', sectionId: 'products' },
    { label: 'Why Us', sectionId: 'why-us' },
    { label: 'How It Works', sectionId: 'how-it-works' },
    { label: 'Event Supply', sectionId: 'events' },
    { label: 'Contact', sectionId: 'contact' },
  ];

  const handleScrollTo = (sectionId: string) => {
    setOpen(false);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[#140A06]/92 backdrop-blur-xl border-b border-[#3E2519]/70 shadow-[0_10px_30px_rgba(0,0,0,0.6)] py-2 sm:py-2.5'
          : 'bg-gradient-to-b from-[#0C0603]/80 via-[#0C0603]/30 to-transparent border-b-0 border-transparent shadow-none py-3 sm:py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between gap-2 sm:gap-4" aria-label="RadhaWater Navigation">
          {/* Brand Presentation with Official RadhaWater Emblem Logo */}
          <button
            type="button"
            onClick={() => handleScrollTo('home')}
            className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none shrink-0"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden transition-transform group-hover:scale-105 shrink-0 shadow-md">
              <RadhaWaterLogo className="w-full h-full" />
            </div>
            <div>
              <span className="font-heading font-extrabold text-base sm:text-lg tracking-tight text-white flex items-center gap-1">
                <span>Radha</span>
                <span className="text-[#E5A88B]">Water</span>
              </span>
              <p className="text-[10px] text-[#EAD5C3]/60 font-medium tracking-wide hidden sm:block">
                Drinking Water & Event Supply
              </p>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1 bg-[#1C100B]/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#3E2519]/60 shadow-inner shrink-0">
            {navLinks.map((link) => {
              const active = activeSection === link.sectionId;
              return (
                <button
                  key={link.label}
                  type="button"
                  onClick={() => handleScrollTo(link.sectionId)}
                  className={`relative px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 cursor-pointer ${
                    active
                      ? 'text-white bg-[#B85C1E]/25 border border-[#E5A88B]/40 shadow-sm'
                      : 'text-cream/80 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  {link.label}
                  {active && (
                    <span
                      className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#E5A88B]"
                      aria-hidden="true"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Actions & Cross-Brand Link */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => handleScrollTo('events')}
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#B85C1E] to-[#D97026] hover:from-[#C86624] hover:to-[#E87E34] px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs font-bold text-white transition-all shadow-md hover:shadow-[#B85C1E]/25 hover:scale-105 active:scale-95 cursor-pointer shrink-0"
            >
              <span>Plan Event Supply</span>
              <HugeiconsIcon icon={ArrowRight01Icon} size={13} className="hidden sm:inline" />
            </button>

            <Link
              to={ROUTES.PUBLIC.HOME}
              className="hidden xl:inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 px-3.5 py-2 text-[11px] font-semibold text-cream/90 transition-all hover:text-white shrink-0"
            >
              <HugeiconsIcon icon={Coffee02Icon} size={13} className="text-[#E5A88B]" />
              <span>RadhaCafe</span>
            </Link>

            {/* Mobile Navigation Drawer */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger
                className="lg:hidden p-2 rounded-lg text-cream hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-[#E5A88B] cursor-pointer"
                aria-label="Open RadhaWater menu"
              >
                <HugeiconsIcon icon={Menu01Icon} size={22} />
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-[#140A06] border-l border-[#3E2519] p-0 text-cream flex flex-col justify-between">
                <div>
                  <SheetHeader className="px-6 pt-6 pb-4 border-b border-[#3E2519]">
                    <SheetTitle className="text-left flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 shadow-md">
                        <RadhaWaterLogo className="w-full h-full" />
                      </div>
                      <div>
                        <span className="font-heading font-extrabold text-base text-white">
                          Radha<span className="text-[#E5A88B]">Water</span>
                        </span>
                        <p className="text-[10px] text-[#EAD5C3]/60 font-normal">
                          Drinking Water & Event Supply
                        </p>
                      </div>
                    </SheetTitle>
                  </SheetHeader>

                  <div className="flex flex-col px-4 py-6 space-y-1">
                    {navLinks.map((link) => {
                      const active = activeSection === link.sectionId;
                      return (
                        <button
                          key={link.label}
                          type="button"
                          onClick={() => handleScrollTo(link.sectionId)}
                          className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-semibold transition-all text-left cursor-pointer ${
                            active
                              ? 'bg-[#B85C1E]/20 text-[#E5A88B] border border-[#B85C1E]/40'
                              : 'text-cream/80 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <span>{link.label}</span>
                          {active && <span className="w-1.5 h-1.5 rounded-full bg-[#E5A88B]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Mobile Drawer Bottom Actions */}
                <div className="p-6 border-t border-[#3E2519] space-y-4 bg-[#0E0604]">
                  <div className="space-y-2 text-xs text-[#EAD5C3]/70">
                    <div className="flex items-center gap-2">
                      <HugeiconsIcon icon={CallIcon} size={14} className="text-[#E5A88B]" />
                      <a href="tel:09966630913" className="hover:text-white transition-colors">
                        09966630913
                      </a>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => handleScrollTo('events')}
                      className="flex items-center justify-center rounded-lg bg-[#B85C1E] hover:bg-[#D97026] py-2.5 text-xs font-bold text-white transition-all shadow-md cursor-pointer"
                    >
                      Book Event
                    </button>
                    <Link
                      to={ROUTES.PUBLIC.HOME}
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-center gap-1.5 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 py-2.5 text-xs font-semibold text-cream transition-all"
                    >
                      <HugeiconsIcon icon={Coffee02Icon} size={13} className="text-[#E5A88B]" />
                      <span>RadhaCafe</span>
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </div>
    </header>
  );
}
