import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { HugeiconsIcon } from '@hugeicons/react';
import { Camera01Icon, ArrowUpRight01Icon } from '@hugeicons/core-free-icons';

interface GalleryHeaderProps {
  showExploreLink?: boolean;
}

export function GalleryHeader({ showExploreLink = false }: GalleryHeaderProps) {
  return (
    <section className="bg-gradient-to-b from-[#1C100B] via-[#140A06] to-[#140A06] pt-24 pb-14 border-b border-[#2C1810] relative overflow-hidden text-center">
      {/* Warm Ambient Glow Spotlight */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[radial-gradient(circle,rgba(229,168,139,0.12)_0%,transparent_70%)] pointer-events-none"
        aria-hidden="true"
      />

      <div className="container px-4 md:px-8 max-w-3xl mx-auto space-y-4 relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E5A88B]/10 border border-[#E5A88B]/20 text-[#E5A88B] text-xs font-bold uppercase tracking-widest">
          <HugeiconsIcon icon={Camera01Icon} size={14} />
          <span>VISUAL SHOWCASE</span>
        </div>

        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-cream leading-[1.1] tracking-tight">
          RadhaCafe{' '}
          <span className="font-serif italic font-normal text-[#E5A88B]">
            Moments
          </span>
        </h1>

        <p className="text-xs sm:text-base text-cream/75 leading-relaxed max-w-xl mx-auto font-normal">
          Explore photos of our handcrafted beverages, freshly baked pastries, artisanal roasting, and warm cafe atmosphere in Tallur.
        </p>

        {showExploreLink && (
          <div className="pt-2">
            <Link
              to={ROUTES.PUBLIC.GALLERY}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#E5A88B] hover:bg-[#EEB89D] text-xs font-bold text-[#140A06] transition-all shadow-md hover:-translate-y-0.5"
            >
              <span>Explore Full Gallery</span>
              <HugeiconsIcon icon={ArrowUpRight01Icon} size={14} />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
