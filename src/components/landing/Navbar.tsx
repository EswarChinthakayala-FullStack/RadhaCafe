import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { AppLogo } from '../brand/AppLogo';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';
import { HugeiconsIcon } from '@hugeicons/react';
import { Menu01Icon } from '@hugeicons/core-free-icons';

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: 'Home', href: ROUTES.PUBLIC.HOME },
    { label: 'About', href: '/#about' },
    { label: 'Menu', href: ROUTES.PUBLIC.MENU },
    { label: 'RadhaWater', href: ROUTES.PUBLIC.WATER },
    { label: 'Gallery', href: ROUTES.PUBLIC.GALLERY },
    { label: 'Reviews', href: ROUTES.PUBLIC.DISCUSSIONS },
    { label: 'Contact', href: ROUTES.PUBLIC.CONTACT },
  ];

  const handleNavClick = (href: string) => {
    setOpen(false);
    // Handle hash-based smooth scroll for same-page anchors
    if (href.startsWith('/#') && location.pathname === '/') {
      const el = document.querySelector(href.replace('/', ''));
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[#140A06]/92 backdrop-blur-xl border-b border-[#3E2519]/50 shadow-lg'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex h-16 items-center justify-between" aria-label="Main navigation">
          {/* Logo */}
          <AppLogo href="/" variant="default" size="sm" lightText />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive =
                location.pathname === link.href ||
                (link.href !== '/' && location.pathname.startsWith(link.href));
              return (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${
                    isActive
                      ? 'bg-[#E5A88B]/15 text-[#E5A88B] border border-[#E5A88B]/30'
                      : 'text-cream/80 hover:text-cream hover:bg-white/5 border border-transparent'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center">
            <Link
              to={ROUTES.PUBLIC.LOGIN}
              className="inline-flex items-center justify-center rounded-lg bg-cinnamon hover:bg-cinnamon/90 px-5 py-2 text-xs font-bold text-white transition-all shadow-sm hover:shadow-md"
            >
              Admin POS
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              className="md:hidden p-2 rounded-lg text-cream/90 hover:text-cream hover:bg-white/5 transition-colors"
              aria-label="Open navigation menu"
            >
              <HugeiconsIcon icon={Menu01Icon} size={22} />
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-[#140A06] border-l border-[#2C1810] p-0">
              <SheetHeader className="px-6 pt-6 pb-4 border-b border-[#2C1810]">
                <SheetTitle>
                  <AppLogo variant="compact" size="sm" lightText />
                </SheetTitle>
              </SheetHeader>

              <div className="flex flex-col px-6 py-6 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.href}
                    onClick={() => handleNavClick(link.href)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-cream/85 hover:text-cream hover:bg-white/5 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}

                <div className="pt-4 mt-2 border-t border-[#2C1810]">
                  <Link
                    to={ROUTES.PUBLIC.LOGIN}
                    onClick={() => setOpen(false)}
                    className="flex w-full items-center justify-center rounded-lg bg-cinnamon hover:bg-cinnamon/90 px-4 py-2.5 text-xs font-bold text-white transition-all"
                  >
                    Admin POS Sign In
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </nav>
      </div>
    </header>
  );
}
