import { GalleryManager } from '../../components/admin/gallery/GalleryManager';
import { HugeiconsIcon } from '@hugeicons/react';
import { Image01Icon } from '@hugeicons/core-free-icons';

export function GalleryPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4 sm:pb-5">
        <div>
          <h2 className="text-2xl font-bold font-heading text-foreground flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cinnamon/10 text-cinnamon shrink-0 border border-cinnamon/20 shadow-2xs">
              <HugeiconsIcon icon={Image01Icon} size={22} />
            </div>
            <span>Gallery Management</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Upload, organize, caption, and reorder photos displayed on the RadhaCafe public website.
          </p>
        </div>
      </div>

      <GalleryManager />
    </div>
  );
}
