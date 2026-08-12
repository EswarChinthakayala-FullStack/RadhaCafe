import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchGalleryItems } from '../../lib/supabase/queries/gallery';
import { Navbar } from '../../components/landing/Navbar';
import { Footer } from '../../components/landing/Footer';
import { GalleryHeader } from '../../components/gallery/GalleryHeader';
import { GalleryGrid } from '../../components/gallery/GalleryGrid';
import { GalleryLightbox } from '../../components/gallery/GalleryLightbox';
import { GallerySkeleton } from '../../components/gallery/GallerySkeleton';
import { GalleryErrorState } from '../../components/gallery/GalleryErrorState';
import { GalleryEmptyState } from '../../components/gallery/GalleryEmptyState';

export function PublicGalleryPage() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const { data: gallery, isLoading, isError, refetch } = useQuery({
    queryKey: ['gallery', 'public'],
    queryFn: fetchGalleryItems,
  });

  return (
    <div className="min-h-screen bg-[#140A06] text-cream flex flex-col selection:bg-cinnamon selection:text-white">
      <Navbar />

      {/* Page Hero Header */}
      <GalleryHeader />

      {/* Main Gallery Grid */}
      <main className="flex-1 py-14 bg-[#140A06]">
        <div className="container px-4 md:px-8 max-w-6xl mx-auto space-y-8">
          {isLoading ? (
            <GallerySkeleton />
          ) : isError ? (
            <GalleryErrorState onRetry={() => refetch()} />
          ) : !gallery || gallery.length === 0 ? (
            <GalleryEmptyState />
          ) : (
            <GalleryGrid
              items={gallery}
              onSelectImage={(index) => setSelectedIndex(index)}
            />
          )}
        </div>
      </main>

      {/* Lightbox Modal Preview */}
      {gallery && (
        <GalleryLightbox
          items={gallery}
          selectedIndex={selectedIndex}
          onClose={() => setSelectedIndex(null)}
          onSelectIndex={(index) => setSelectedIndex(index)}
        />
      )}

      <Footer />
    </div>
  );
}
