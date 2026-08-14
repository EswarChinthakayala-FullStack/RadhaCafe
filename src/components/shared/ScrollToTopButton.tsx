import { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowUp01Icon } from '@hugeicons/core-free-icons';

export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setVisible(window.scrollY > 350);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className={`fixed bottom-6 right-6 z-40 p-3 rounded-full bg-[#1C100B]/90 backdrop-blur-md border border-[#E5A88B]/40 text-[#E5A88B] hover:bg-[#E5A88B] hover:text-[#140A06] shadow-[0_8px_25px_rgba(0,0,0,0.6)] hover:shadow-[0_12px_30px_rgba(229,168,139,0.3)] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#E5A88B] focus:ring-offset-2 focus:ring-offset-[#140A06] cursor-pointer ${
        visible
          ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 scale-75 translate-y-4 pointer-events-none'
      }`}
      aria-label="Scroll to top of page"
      title="Scroll to top"
    >
      <HugeiconsIcon icon={ArrowUp01Icon} size={20} />
    </button>
  );
}
