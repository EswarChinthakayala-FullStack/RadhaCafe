import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { AppLogo } from '../brand/AppLogo';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';
import { HugeiconsIcon } from '@hugeicons/react';
import { Menu01Icon, ArrowRight01Icon, Location01Icon, CallIcon } from '@hugeicons/core-free-icons';

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('home');
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);

      // Section scrollspy when on homepage
      if (location.pathname === '/') {
        const sections = ['home', 'about', 'menu', 'gallery', 'reviews', 'water', 'contact'];
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
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  const navLinks = [
    { label: 'Home', href: '/', sectionId: 'home' },
    { label: 'About', href: '/#about', sectionId: 'about' },
    { label: 'Menu', href: ROUTES.PUBLIC.MENU, sectionId: 'menu' },
    { label: 'RadhaWater', href: ROUTES.PUBLIC.WATER, sectionId: 'water' },
    { label: 'Gallery', href: ROUTES.PUBLIC.GALLERY, sectionId: 'gallery' },
    { label: 'Reviews', href: ROUTES.PUBLIC.DISCUSSIONS, sectionId: 'reviews' },
    { label: 'Contact', href: ROUTES.PUBLIC.CONTACT, sectionId: 'contact' },
  ];

  const handleNavClick = (href: string, sectionId?: string) => {
    setOpen(false);
    if (href.startsWith('/#') && location.pathname === '/') {
      const id = sectionId || href.replace('/#', '');
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        setActiveSection(id);
      }
    } else if (href === '/' && location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setActiveSection(sectionId || 'home');
    }
  };

  const isLinkActive = (link: typeof navLinks[0]) => {
    if (location.pathname === '/') {
      return activeSection === link.sectionId;
    }
    return location.pathname === link.href || (link.href !== '/' && location.pathname.startsWith(link.href));
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
        <nav className="flex items-center justify-between gap-2 sm:gap-4" aria-label="Main navigation">
          {/* Brand Logo */}
          <div className="shrink-0">
            <AppLogo href="/" variant="default" size="sm" lightText />
          </div>

          {/* Desktop Navigation Links (Visible on lg/1024px+ screens with responsive compact padding) */}
          <div className="hidden lg:flex items-center gap-0.5 xl:gap-1 bg-[#1C100B]/60 backdrop-blur-md px-2.5 xl:px-3 py-1.5 rounded-full border border-white/10 shadow-inner shrink-0">
            {navLinks.map((link) => {
              const active = isLinkActive(link);
              return (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={() => handleNavClick(link.href, link.sectionId)}
                  className={`relative px-2.5 xl:px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 whitespace-nowrap ${
                    active
                      ? 'text-white bg-[#E5A88B]/20 border border-[#E5A88B]/40 shadow-sm'
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
                </Link>
              );
            })}
          </div>

          {/* Action CTAs and Mobile Trigger */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Order Now CTA (visible on all screens with responsive padding) */}
            <Link
              to={ROUTES.PUBLIC.MENU}
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#B85C1E] to-[#D97026] hover:from-[#C86624] hover:to-[#E87E34] px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs font-bold text-white transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95 shrink-0"
            >
              <span>Order Now</span>
              <HugeiconsIcon icon={ArrowRight01Icon} size={13} className="hidden sm:inline" />
            </Link>

            {/* POS Login (Desktop only xl+) */}
            <Link
              to={ROUTES.PUBLIC.LOGIN}
              className="hidden xl:inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 hover:bg-white/10 px-3.5 py-2 text-[11px] font-semibold text-cream/90 transition-all hover:text-white shrink-0"
            >
              POS Login
            </Link>

            {/* Mobile & Tablet Drawer Trigger (visible on screens below lg/1024px) */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger
                className="lg:hidden p-2 rounded-lg text-cream/90 hover:text-cream hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-[#E5A88B]"
                aria-label="Open navigation menu"
              >
                <HugeiconsIcon icon={Menu01Icon} size={22} />
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-[#140A06] border-l border-[#2C1810] p-0 text-cream flex flex-col justify-between">
                <div>
                  <SheetHeader className="px-6 pt-6 pb-4 border-b border-[#2C1810]">
                    <SheetTitle className="text-left">
                      <AppLogo variant="compact" size="sm" lightText />
                    </SheetTitle>
                  </SheetHeader>

                  <div className="flex flex-col px-4 py-6 space-y-1">
                    {navLinks.map((link) => {
                      const active = isLinkActive(link);
                      return (
                        <Link
                          key={link.label}
                          to={link.href}
                          onClick={() => handleNavClick(link.href, link.sectionId)}
                          className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                            active
                              ? 'bg-[#E5A88B]/15 text-[#E5A88B] border border-[#E5A88B]/30'
                              : 'text-cream/80 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <span>{link.label}</span>
                          {active && <span className="w-1.5 h-1.5 rounded-full bg-[#E5A88B]" />}
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Mobile Drawer Bottom Info */}
                <div className="p-6 border-t border-[#2C1810] space-y-4 bg-[#100704]">
                  <div className="space-y-2 text-xs text-cream/60">
                    <div className="flex items-center gap-2">
                      <HugeiconsIcon icon={Location01Icon} size={14} className="text-[#E5A88B]" />
                      <span>Tallur, Andhra Pradesh</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <HugeiconsIcon icon={CallIcon} size={14} className="text-[#E5A88B]" />
                      <span>09966630913</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <Link
                      to={ROUTES.PUBLIC.MENU}
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-center rounded-lg bg-cinnamon hover:bg-cinnamon/90 py-2.5 text-xs font-bold text-white transition-all shadow-md"
                    >
                      View Menu
                    </Link>
                    <Link
                      to={ROUTES.PUBLIC.LOGIN}
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-center rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 py-2.5 text-xs font-semibold text-cream transition-all"
                    >
                      Admin POS
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
