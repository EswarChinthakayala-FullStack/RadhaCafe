import { useState } from 'react';
import { useGalleryImages } from '../../hooks/useGallery';
import { Navbar } from '../../components/landing/Navbar';
import { Footer } from '../../components/landing/Footer';
import { GalleryHeader } from '../../components/gallery/GalleryHeader';
import { JustifiedGallery } from '../../components/gallery/JustifiedGallery';
import { GalleryViewer } from '../../components/gallery/GalleryViewer';
import { GallerySkeleton } from '../../components/gallery/GallerySkeleton';
import { GalleryErrorState } from '../../components/gallery/GalleryErrorState';
import { GalleryEmptyState } from '../../components/gallery/GalleryEmptyState';

export function PublicGalleryPage() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const { data: gallery, isLoading, isError, refetch } = useGalleryImages();

  return (
    <div className="min-h-screen bg-[#140A06] text-cream flex flex-col selection:bg-cinnamon selection:text-white">
      <Navbar />

      {/* Page Hero Header */}
      <GalleryHeader />

      {/* Main Gallery Grid */}
      <main className="flex-1 py-14 bg-[#140A06]">
        <div className="container px-4 md:px-8 max-w-7xl mx-auto space-y-8">
          {isLoading ? (
            <GallerySkeleton />
          ) : isError ? (
            <GalleryErrorState onRetry={() => refetch()} />
          ) : !gallery || gallery.length === 0 ? (
            <GalleryEmptyState />
          ) : (
            <JustifiedGallery
              items={gallery}
              onSelectImage={(index) => setSelectedIndex(index)}
            />
          )}
        </div>
      </main>

      {/* Google Photos Fullscreen Lightbox Viewer */}
      {gallery && gallery.length > 0 && (
        <GalleryViewer
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
