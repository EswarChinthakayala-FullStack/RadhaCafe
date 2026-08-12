import { useState } from 'react';
import type { GalleryItem } from '../../lib/supabase/queries/gallery';
import { HugeiconsIcon } from '@hugeicons/react';
import { Image01Icon, ViewIcon } from '@hugeicons/core-free-icons';

interface GalleryGridProps {
  items: GalleryItem[];
  onSelectImage: (index: number) => void;
  maxItems?: number;
}

export function GalleryGrid({ items, onSelectImage, maxItems }: GalleryGridProps) {
  const [failedImageIds, setFailedImageIds] = useState<Record<string, boolean>>({});

  const displayItems = maxItems ? items.slice(0, maxItems) : items;
  const count = displayItems.length;

  const handleImageError = (id: string) => {
    setFailedImageIds((prev) => ({ ...prev, [id]: true }));
  };

  // Adaptive composition layout class selection based on image count
  if (count === 1) {
    return (
      <div className="max-w-2xl mx-auto">
        {renderImageCard(displayItems[0], 0, 'aspect-[16/9]')}
      </div>
    );
  }

  if (count === 2) {
    return (
      <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {displayItems.map((item, idx) => (
          <div key={item.id}>{renderImageCard(item, idx, 'aspect-[4/3]')}</div>
        ))}
      </div>
    );
  }

  if (count === 3) {
    return (
      <div className="grid sm:grid-cols-3 gap-6">
        <div className="sm:col-span-2">
          {renderImageCard(displayItems[0], 0, 'aspect-[16/9] sm:aspect-[4/3]')}
        </div>
        <div className="space-y-6">
          {renderImageCard(displayItems[1], 1, 'aspect-[4/3]')}
          {renderImageCard(displayItems[2], 2, 'aspect-[4/3]')}
        </div>
      </div>
    );
  }

  // 4+ Items: Editorial Masonry Composition
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
      {displayItems.map((item, idx) => {
        // Vary aspect ratios for editorial feel
        const isFeatured = idx % 5 === 0;
        const isWide = idx % 7 === 3;
        const aspectClass = isWide
          ? 'col-span-2 aspect-[16/9]'
          : isFeatured
            ? 'aspect-[4/5]'
            : 'aspect-square';

        return <div key={item.id} className={isWide ? 'col-span-2' : ''}>{renderImageCard(item, idx, aspectClass)}</div>;
      })}
    </div>
  );

  function renderImageCard(item: GalleryItem, index: number, aspectClass: string) {
    const isFailed = failedImageIds[item.id];

    return (
      <button
        onClick={() => onSelectImage(index)}
        className={`group relative w-full overflow-hidden rounded-md bg-[#1D100A] border border-[#2C1810] shadow-lg hover:shadow-2xl hover:border-[#E5A88B]/50 transition-all duration-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E5A88B] ${aspectClass}`}
        aria-label={item.caption || `View gallery image ${index + 1}`}
      >
        {isFailed ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-[#1C100B] text-cream/40 space-y-2">
            <HugeiconsIcon icon={Image01Icon} size={28} />
            <span className="text-[11px] font-medium text-cream/50">Photo Unavailable</span>
          </div>
        ) : (
          <img
            src={item.image_url}
            alt={item.caption || `RadhaCafe Photo ${index + 1}`}
            onError={() => handleImageError(item.id)}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            loading={index < 4 ? 'eager' : 'lazy'}
            decoding="async"
          />
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#140A06]/90 via-[#140A06]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 text-left">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-cream line-clamp-2">
              {item.caption || 'View Image'}
            </span>
            <div className="p-2 rounded-full bg-[#E5A88B] text-[#140A06] shrink-0 shadow-md transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
              <HugeiconsIcon icon={ViewIcon} size={14} />
            </div>
          </div>
        </div>
      </button>
    );
  }
}
