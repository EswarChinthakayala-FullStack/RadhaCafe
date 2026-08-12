import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchGalleryItems } from '../../lib/supabase/queries/gallery';
import { ScrollReveal } from '../shared/ScrollReveal';
import { GalleryHeader } from '../gallery/GalleryHeader';
import { GalleryGrid } from '../gallery/GalleryGrid';
import { GalleryLightbox } from '../gallery/GalleryLightbox';
import { GallerySkeleton } from '../gallery/GallerySkeleton';
import { GalleryErrorState } from '../gallery/GalleryErrorState';
import { GalleryEmptyState } from '../gallery/GalleryEmptyState';

export function GallerySection() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const { data: gallery, isLoading, isError, refetch } = useQuery({
    queryKey: ['gallery', 'public'],
    queryFn: fetchGalleryItems,
  });

  return (
    <section id="gallery" className="py-24 bg-[#140A06] text-cream border-b border-[#2C1810]">
      <div className="container px-4 md:px-8 mx-auto space-y-12">
        {/* Section Header */}
        <ScrollReveal>
          <GalleryHeader showExploreLink />
        </ScrollReveal>

        {/* Gallery Content */}
        {isLoading ? (
          <GallerySkeleton />
        ) : isError ? (
          <GalleryErrorState onRetry={() => refetch()} />
        ) : !gallery || gallery.length === 0 ? (
          <GalleryEmptyState />
        ) : (
          <ScrollReveal delay={0.1}>
            <GalleryGrid
              items={gallery}
              maxItems={8}
              onSelectImage={(index) => setSelectedIndex(index)}
            />
          </ScrollReveal>
        )}
      </div>

      {/* Lightbox Modal */}
      {gallery && (
        <GalleryLightbox
          items={gallery}
          selectedIndex={selectedIndex}
          onClose={() => setSelectedIndex(null)}
          onSelectIndex={(index) => setSelectedIndex(index)}
        />
      )}
    </section>
  );
}
