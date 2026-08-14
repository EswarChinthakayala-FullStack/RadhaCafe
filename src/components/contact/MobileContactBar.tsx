import { useState, useEffect } from 'react';
import { useCafeSettings } from '../../hooks/useCafeSettings';
import { HugeiconsIcon } from '@hugeicons/react';
import { CallIcon, MapsIcon } from '@hugeicons/core-free-icons';

export function MobileContactBar() {
  const { data: settings } = useCafeSettings();
  const [isVisible, setIsVisible] = useState(false);

  const phone = settings?.phone || '09966630913';
  const mapsUrl = 'https://maps.app.goo.gl/u6JadwVD4jGvgLnE9';

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky bar after scrolling past the Hero (~320px)
      if (window.scrollY > 320) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Quick contact mobile bar"
      className="sm:hidden fixed bottom-4 left-4 right-4 z-40 animate-fade-in"
    >
      <div className="bg-[#140A06]/95 border border-[#3E2519] rounded-full p-1.5 shadow-2xl backdrop-blur-xl flex items-center gap-2">
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-full bg-gradient-to-r from-[#B85C1E] to-[#D97026] text-white text-xs font-bold shadow-md active:scale-95 transition-transform"
        >
          <HugeiconsIcon icon={MapsIcon} size={14} />
          <span>Directions</span>
        </a>

        {phone && (
          <a
            href={`tel:${phone.replace(/\s+/g, '')}`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-cream text-xs font-bold border border-white/15 active:scale-95 transition-transform"
          >
            <HugeiconsIcon icon={CallIcon} size={14} className="text-[#E5A88B]" />
            <span>Call Cafe</span>
          </a>
        )}
      </div>
    </aside>
  );
}
