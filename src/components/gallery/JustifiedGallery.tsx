import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import type { GalleryItem } from '../../lib/supabase/queries/gallery';
import { calculateJustifiedLayout } from '../../lib/gallery/justifiedLayout';
import { HugeiconsIcon } from '@hugeicons/react';
import { Image01Icon, ViewIcon } from '@hugeicons/core-free-icons';

interface JustifiedGalleryProps {
  items: GalleryItem[];
  onSelectImage: (index: number) => void;
  maxItems?: number;
  gap?: number;
}

export function JustifiedGallery({
  items,
  onSelectImage,
  maxItems,
  gap = 6,
}: JustifiedGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [aspectOverrides, setAspectOverrides] = useState<Record<string, number>>({});
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const displayItems = useMemo(() => {
    return maxItems ? items.slice(0, maxItems) : items;
  }, [items, maxItems]);

  // Measure container width with ResizeObserver
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let rafId: number | null = null;

    const observer = new ResizeObserver((entries) => {
      if (!entries[0]) return;
      const width = entries[0].contentRect.width;
      if (width > 0) {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          setContainerWidth(Math.floor(width));
        });
      }
    });

    observer.observe(el);
    setContainerWidth(Math.floor(el.getBoundingClientRect().width));

    return () => {
      observer.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  // Record natural aspect ratio for images missing database dimensions
  const handleImageLoad = useCallback((id: string, e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.naturalWidth && img.naturalHeight && img.naturalHeight > 0) {
      const ar = img.naturalWidth / img.naturalHeight;
      setAspectOverrides((prev) => {
        if (Math.abs((prev[id] || 0) - ar) < 0.05) return prev;
        return { ...prev, [id]: ar };
      });
    }
  }, []);

  const handleImageError = useCallback((id: string) => {
    setFailedImages((prev) => ({ ...prev, [id]: true }));
  }, []);

  // Determine target row height dynamically by container width
  const targetRowHeight = useMemo(() => {
    if (containerWidth >= 1200) return 270;
    if (containerWidth >= 880) return 230;
    if (containerWidth >= 640) return 190;
    return 145; // Mobile compact row height
  }, [containerWidth]);

  // Compute justified rows
  const rows = useMemo(() => {
    if (containerWidth <= 0 || displayItems.length === 0) return [];
    return calculateJustifiedLayout(displayItems, {
      containerWidth,
      targetRowHeight,
      gap,
      aspectRatioOverrides: aspectOverrides,
      maxRowHeightScale: containerWidth < 640 ? 1.5 : 1.35,
    });
  }, [displayItems, containerWidth, targetRowHeight, gap, aspectOverrides]);

  return (
    <div
      ref={containerRef}
      className="w-full select-none"
      style={{ minHeight: displayItems.length > 0 ? 300 : 'auto' }}
    >
      {rows.length > 0 ? (
        <div className="flex flex-col" style={{ gap: `${gap}px` }}>
          {rows.map((row, rowIdx) => (
            <div
              key={`row-${rowIdx}`}
              className="flex items-center w-full"
              style={{ gap: `${gap}px`, height: `${row.height}px` }}
            >
              {row.items.map((layoutItem) => {
                const item = layoutItem.item;
                const isFailed = failedImages[item.id];
                const displayName = item.title || item.caption || `Photo ${layoutItem.originalIndex + 1}`;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectImage(layoutItem.originalIndex)}
                    style={{
                      width: `${layoutItem.width}px`,
                      height: `${layoutItem.height}px`,
                    }}
                    className="group relative overflow-hidden rounded-lg bg-[#180D08] border border-[#2C1810]/80 shadow-md hover:shadow-xl hover:border-[#E5A88B]/50 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E5A88B] cursor-pointer shrink-0"
                    aria-label={`View photo: ${displayName}`}
                  >
                    {isFailed ? (
                      <div className="w-full h-full flex flex-col items-center justify-center p-3 bg-[#1C100B] text-cream/40 space-y-1.5">
                        <HugeiconsIcon icon={Image01Icon} size={24} />
                        <span className="text-[10px] font-medium text-cream/50">Photo Unavailable</span>
                      </div>
                    ) : (
                      <img
                        src={item.image_url}
                        alt={item.alt_text || item.caption || item.title || 'RadhaCafe Gallery photo'}
                        loading={layoutItem.originalIndex < 6 ? 'eager' : 'lazy'}
                        decoding="async"
                        onLoad={(e) => handleImageLoad(item.id, e)}
                        onError={() => handleImageError(item.id)}
                        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.025]"
                      />
                    )}

                    {/* Subtle Hover Reveal with Caption / Title */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0503]/90 via-[#0A0503]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 sm:p-4 text-left pointer-events-none">
                      <div className="flex items-end justify-between gap-2">
                        <div className="space-y-0.5 min-w-0">
                          {item.title && (
                            <h4 className="text-xs font-bold text-white truncate drop-shadow-md">
                              {item.title}
                            </h4>
                          )}
                          {item.caption && (
                            <p className="text-[11px] text-[#EAD5C3]/90 line-clamp-1 leading-snug">
                              {item.caption}
                            </p>
                          )}
                          {!item.title && !item.caption && (
                            <span className="text-[11px] font-medium text-[#E5A88B]">
                              View Photo
                            </span>
                          )}
                        </div>

                        <div className="p-1.5 rounded-full bg-[#E5A88B] text-[#140A06] shrink-0 shadow-md transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                          <HugeiconsIcon icon={ViewIcon} size={13} />
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {displayItems.map((item) => (
            <div
              key={item.id}
              className="aspect-[4/3] rounded-lg bg-[#1C100B] animate-pulse"
            />
          ))}
        </div>
      )}
    </div>
  );
}
