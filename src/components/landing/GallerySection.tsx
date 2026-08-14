import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGalleryImages } from '../../hooks/useGallery';
import { ROUTES } from '../../constants/routes';
import { ScrollReveal } from '../shared/ScrollReveal';
import { JustifiedGallery } from '../gallery/JustifiedGallery';
import { GalleryViewer } from '../gallery/GalleryViewer';
import { GallerySkeleton } from '../gallery/GallerySkeleton';
import { GalleryErrorState } from '../gallery/GalleryErrorState';
import { GalleryEmptyState } from '../gallery/GalleryEmptyState';
import { HugeiconsIcon } from '@hugeicons/react';
import { Camera01Icon, ArrowUpRight01Icon } from '@hugeicons/core-free-icons';

export function GallerySection() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const { data: gallery, isLoading, isError, refetch } = useGalleryImages();

  return (
    <section
      id="gallery"
      className="py-20 sm:py-28 bg-[#140A06] text-cream border-b border-[#2C1810] relative overflow-hidden"
      aria-label="Cafe Gallery"
    >
      <div className="container px-4 md:px-8 max-w-7xl mx-auto space-y-12 relative z-10">
        {/* Editorial Section Header */}
        <ScrollReveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#2C1810]">
            <div className="space-y-2.5 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5A88B]/10 border border-[#E5A88B]/25 text-[#E5A88B] text-[11px] font-bold tracking-[0.2em] uppercase">
                <HugeiconsIcon icon={Camera01Icon} size={13} />
                <span>Atmosphere & Moments</span>
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-cream leading-tight">
                Moments from{' '}
                <span className="font-serif italic font-normal text-[#E5A88B]">RadhaCafe</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#EAD5C3]/75 leading-relaxed">
                Take a glimpse into our daily brews, cozy seating corners, and the smiling community of Tallur.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {gallery && gallery.length > 0 && (
                <span className="text-xs font-semibold text-[#EAD5C3]/60 px-3 py-1 rounded-full bg-white/5 border border-white/10 hidden sm:inline-block">
                  {gallery.length} moments
                </span>
              )}
              <Link
                to={ROUTES.PUBLIC.GALLERY}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#B85C1E] to-[#D97026] hover:from-[#C86624] hover:to-[#E87E34] text-xs font-bold text-white transition-all shadow-md hover:scale-105 active:scale-95 shrink-0"
              >
                <span>Explore Full Gallery</span>
                <HugeiconsIcon icon={ArrowUpRight01Icon} size={14} />
              </Link>
            </div>
          </div>
        </ScrollReveal>

        {/* Gallery Grid Content */}
        {isLoading ? (
          <GallerySkeleton />
        ) : isError ? (
          <GalleryErrorState onRetry={() => refetch()} />
        ) : !gallery || gallery.length === 0 ? (
          <GalleryEmptyState />
        ) : (
          <ScrollReveal delay={0.1}>
            <JustifiedGallery
              items={gallery}
              maxItems={10}
              onSelectImage={(index) => setSelectedIndex(index)}
            />
          </ScrollReveal>
        )}
      </div>

      {/* Google Photos Fullscreen Lightbox Viewer */}
      {gallery && gallery.length > 0 && (
        <GalleryViewer
          items={gallery}
          selectedIndex={selectedIndex}
          onClose={() => setSelectedIndex(null)}
          onSelectIndex={(index) => setSelectedIndex(index)}
        />
      )}
    </section>
  );
}
