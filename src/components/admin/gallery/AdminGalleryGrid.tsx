import { useState } from 'react';
import { Skeleton } from '../../ui/skeleton';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Image01Icon,
  EyeIcon,
  Edit02Icon,
  Delete02Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  CheckmarkCircle02Icon,
  ViewIcon,
} from '@hugeicons/core-free-icons';
import type { GalleryItem } from '../../../lib/supabase/queries/gallery';

interface AdminGalleryGridProps {
  items: GalleryItem[];
  isLoading: boolean;
  isSelectionMode: boolean;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  isReorderMode: boolean;
  onMoveEarlier?: (index: number) => void;
  onMoveLater?: (index: number) => void;
  onViewImage: (item: GalleryItem, index: number) => void;
  onEditCaption: (item: GalleryItem) => void;
  onDeleteImage: (item: GalleryItem) => void;
}

export function AdminGalleryGrid({
  items,
  isLoading,
  isSelectionMode,
  selectedIds,
  onToggleSelect,
  isReorderMode,
  onMoveEarlier,
  onMoveLater,
  onViewImage,
  onEditCaption,
  onDeleteImage,
}: AdminGalleryGridProps) {
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const handleImageError = (id: string) => {
    setFailedImages((prev) => new Set(prev).add(id));
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-2.5">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
          <Skeleton
            key={i}
            className={`w-full rounded-xl ${
              i % 3 === 0 ? 'aspect-4/3' : i % 2 === 0 ? 'aspect-square' : 'aspect-3/2'
            }`}
          />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-2.5">
      {items.map((item, index) => {
        const isSelected = selectedIds.has(item.id);
        const isFailed = failedImages.has(item.id);
        const viewsCount = item.views_count ?? (item as any).views ?? 0;

        return (
          <div
            key={item.id}
            onClick={() => {
              if (isSelectionMode) {
                onToggleSelect(item.id);
              } else {
                onViewImage(item, index);
              }
            }}
            className={`group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-200 aspect-4/3 bg-black/10 select-none ${
              isSelected
                ? 'ring-3 ring-cinnamon ring-offset-2 dark:ring-offset-background scale-[0.98]'
                : 'hover:shadow-md'
            }`}
          >
            {/* Image Photography */}
            {isFailed ? (
              <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-muted text-muted-foreground">
                <HugeiconsIcon icon={Image01Icon} size={24} className="mb-1 opacity-50" />
                <span className="text-[10px]">Image unavailable</span>
              </div>
            ) : (
              <img
                src={item.image_url}
                alt={item.caption || item.title || 'RadhaCafe photo'}
                loading="lazy"
                decoding="async"
                onError={() => handleImageError(item.id)}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            )}

            {/* Hover Gradient Overlay */}
            <div
              className={`absolute inset-0 transition-opacity duration-200 flex flex-col justify-between p-2 sm:p-2.5 ${
                isSelected
                  ? 'bg-cinnamon/20 opacity-100'
                  : 'bg-gradient-to-t from-black/80 via-black/20 to-black/40 opacity-0 group-hover:opacity-100 sm:group-focus-within:opacity-100'
              }`}
            >
              {/* Top Controls Row */}
              <div className="flex items-center justify-between gap-1">
                {/* Selection Check Circle */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSelect(item.id);
                  }}
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-cinnamon text-white shadow-xs'
                      : 'bg-black/40 hover:bg-black/60 text-white border border-white/60'
                  }`}
                  aria-label={isSelected ? 'Deselect photo' : 'Select photo'}
                >
                  {isSelected && <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} />}
                </button>

                {/* Quick Action Buttons (Hover) */}
                {!isSelectionMode && (
                  <div
                    className="flex items-center gap-1 bg-black/60 backdrop-blur-xs p-0.5 rounded-lg border border-white/20"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {isReorderMode && onMoveEarlier && onMoveLater ? (
                      <>
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => onMoveEarlier(index)}
                          className="w-6 h-6 rounded flex items-center justify-center text-white/80 hover:text-white disabled:opacity-30 transition-colors"
                          title="Move Earlier"
                        >
                          <HugeiconsIcon icon={ArrowLeft01Icon} size={13} />
                        </button>
                        <button
                          type="button"
                          disabled={index === items.length - 1}
                          onClick={() => onMoveLater(index)}
                          className="w-6 h-6 rounded flex items-center justify-center text-white/80 hover:text-white disabled:opacity-30 transition-colors"
                          title="Move Later"
                        >
                          <HugeiconsIcon icon={ArrowRight01Icon} size={13} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => onViewImage(item, index)}
                          className="w-6 h-6 rounded flex items-center justify-center text-white/80 hover:text-white transition-colors"
                          title="Inspect Photo"
                        >
                          <HugeiconsIcon icon={EyeIcon} size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEditCaption(item)}
                          className="w-6 h-6 rounded flex items-center justify-center text-white/80 hover:text-white transition-colors"
                          title="Edit Caption"
                        >
                          <HugeiconsIcon icon={Edit02Icon} size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteImage(item)}
                          className="w-6 h-6 rounded flex items-center justify-center text-red-300 hover:text-red-100 transition-colors"
                          title="Delete Photo"
                        >
                          <HugeiconsIcon icon={Delete02Icon} size={13} />
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Metadata Snippet */}
              <div className="space-y-0.5 pointer-events-none">
                {item.caption && (
                  <p className="text-white text-xs font-medium truncate drop-shadow-md">
                    {item.caption}
                  </p>
                )}
                <div className="flex items-center gap-1.5 text-[10px] text-white/80 font-mono">
                  <span>#{index + 1}</span>
                  {viewsCount > 0 && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-0.5">
                        <HugeiconsIcon icon={ViewIcon} size={11} />
                        <span>{viewsCount}</span>
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Selection Checkmark Badge Always Visible if Selected */}
            {isSelectionMode && isSelected && (
              <div className="absolute top-2 left-2 pointer-events-none w-6 h-6 rounded-full bg-cinnamon text-white flex items-center justify-center shadow-xs">
                <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
