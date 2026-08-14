import { useState } from 'react';
import { GalleryManager } from '../../components/admin/gallery/GalleryManager';
import { useGalleryImages } from '../../hooks/useGallery';
import { Button } from '../../components/ui/button';
import { AdminGalleryUploadModal } from '../../components/admin/gallery/AdminGalleryUploadModal';
import { HugeiconsIcon } from '@hugeicons/react';
import { Image01Icon, Upload01Icon } from '@hugeicons/core-free-icons';

export function GalleryPage() {
  const { data: items } = useGalleryImages();
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const totalCount = items?.length || 0;
  const maxOrder = items?.reduce((max, item) => Math.max(max, item.display_order ?? 0), 0) || 0;

  return (
    <div className="space-y-5 pb-12">
      {/* Compact Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4 sm:pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-foreground flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cinnamon/10 text-cinnamon shrink-0 border border-cinnamon/20 shadow-2xs">
              <HugeiconsIcon icon={Image01Icon} size={20} />
            </div>
            <span>Cafe Photo Gallery</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {totalCount} {totalCount === 1 ? 'photo' : 'photos'} showcased on the RadhaCafe public website.
          </p>
        </div>

        <Button
          onClick={() => setIsUploadOpen(true)}
          className="bg-cinnamon hover:bg-cinnamon/90 text-white font-bold h-10 text-xs px-4 rounded-lg shadow-xs gap-2 shrink-0 self-start sm:self-auto"
        >
          <HugeiconsIcon icon={Upload01Icon} size={16} />
          <span>Upload Photos</span>
        </Button>
      </div>

      {/* Main Photo Management Experience */}
      <GalleryManager />

      {/* Primary Header Upload Modal */}
      <AdminGalleryUploadModal
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        currentMaxOrder={maxOrder}
      />
    </div>
  );
}
