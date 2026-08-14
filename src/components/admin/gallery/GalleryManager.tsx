import { useState, useMemo } from 'react';
import {
  useGalleryImages,
  useDeleteGalleryItem,
  useReorderGalleryItems,
} from '../../../hooks/useGallery';
import { AdminGalleryGrid } from './AdminGalleryGrid';
import { AdminGalleryToolbar, type GallerySortOption } from './AdminGalleryToolbar';
import { AdminGalleryUploadModal } from './AdminGalleryUploadModal';
import { AdminGalleryViewer } from './AdminGalleryViewer';
import { AdminGalleryEditCaptionModal } from './AdminGalleryEditCaptionModal';
import { GalleryImageEditor } from './editor/GalleryImageEditor';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../ui/alert-dialog';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Image01Icon,
  Upload01Icon,
  RefreshIcon,
  AlertCircleIcon,
} from '@hugeicons/core-free-icons';
import { toast } from '../../ui/toast';
import type { GalleryItem } from '../../../lib/supabase/queries/gallery';

export function GalleryManager() {
  const { data: rawItems, isLoading, isError, error, refetch } = useGalleryImages();
  const deleteMutation = useDeleteGalleryItem();
  const reorderMutation = useReorderGalleryItems();

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<GallerySortOption>('display_order');

  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [editingPhotoItem, setEditingPhotoItem] = useState<GalleryItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<GalleryItem | null>(null);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

  const items = rawItems || [];

  // Filter and sort items for display
  const displayedItems = useMemo(() => {
    let result = [...items];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (i) =>
          (i.caption && i.caption.toLowerCase().includes(q)) ||
          (i.title && i.title.toLowerCase().includes(q))
      );
    }

    // Sort order
    result.sort((a, b) => {
      switch (sortBy) {
        case 'views':
          const viewsA = a.views_count ?? (a as any).views ?? 0;
          const viewsB = b.views_count ?? (b as any).views ?? 0;
          return viewsB - viewsA;
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'caption_asc':
          return (a.caption || a.title || '').localeCompare(b.caption || b.title || '');
        case 'display_order':
        default:
          return (a.display_order ?? 0) - (b.display_order ?? 0);
      }
    });

    return result;
  }, [items, searchQuery, sortBy]);

  const maxOrder = useMemo(() => {
    return items.reduce((max, item) => Math.max(max, item.display_order ?? 0), 0);
  }, [items]);

  // Selection handlers
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelectedIds(new Set(displayedItems.map((i) => i.id)));
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  // Single deletion confirmation
  const handleConfirmSingleDelete = async () => {
    if (!deletingItem) return;

    try {
      await deleteMutation.mutateAsync({
        id: deletingItem.id,
        imageUrl: deletingItem.image_url,
      });

      toast.add({
        title: 'Photo Deleted',
        description: 'Image removed from gallery and storage.',
        type: 'success',
      });

      if (viewerIndex !== null) {
        setViewerIndex(null);
      }
    } catch (err: any) {
      toast.add({
        title: 'Delete Failed',
        description: err.message || 'Unable to delete image.',
        type: 'error',
      });
    } finally {
      setDeletingItem(null);
    }
  };

  // Bulk deletion
  const handleConfirmBulkDelete = async () => {
    if (selectedIds.size === 0) return;

    const idsToDelete = Array.from(selectedIds);
    let successCount = 0;

    for (const id of idsToDelete) {
      const target = items.find((i) => i.id === id);
      try {
        await deleteMutation.mutateAsync({
          id,
          imageUrl: target?.image_url,
        });
        successCount++;
      } catch {
        // Individual failure logged
      }
    }

    toast.add({
      title: 'Bulk Deletion Completed',
      description: `Successfully deleted ${successCount} photo(s).`,
      type: 'success',
    });

    setSelectedIds(new Set());
    setIsBulkDeleteOpen(false);
    setIsSelectionMode(false);
  };

  // Reorder items
  const handleMoveEarlier = async (index: number) => {
    if (index <= 0) return;
    const newItems = [...displayedItems];
    const temp = newItems[index];
    newItems[index] = newItems[index - 1];
    newItems[index - 1] = temp;

    const reorderedPayload = newItems.map((item, idx) => ({
      id: item.id,
      display_order: idx + 1,
    }));

    try {
      await reorderMutation.mutateAsync(reorderedPayload);
    } catch (err: any) {
      toast.add({
        title: 'Reorder Failed',
        description: err.message || 'Unable to save new order.',
        type: 'error',
      });
    }
  };

  const handleMoveLater = async (index: number) => {
    if (index >= displayedItems.length - 1) return;
    const newItems = [...displayedItems];
    const temp = newItems[index];
    newItems[index] = newItems[index + 1];
    newItems[index + 1] = temp;

    const reorderedPayload = newItems.map((item, idx) => ({
      id: item.id,
      display_order: idx + 1,
    }));

    try {
      await reorderMutation.mutateAsync(reorderedPayload);
    } catch (err: any) {
      toast.add({
        title: 'Reorder Failed',
        description: err.message || 'Unable to save new order.',
        type: 'error',
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Search, Sort, Selection & Reorder Toolbar */}
      <AdminGalleryToolbar
        totalCount={items.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={(s) => {
          setSortBy(s);
          if (s !== 'display_order') setIsReorderMode(false);
        }}
        isSelectionMode={isSelectionMode}
        onToggleSelectionMode={() => {
          setIsSelectionMode(!isSelectionMode);
          setSelectedIds(new Set());
        }}
        selectedCount={selectedIds.size}
        onSelectAll={handleSelectAll}
        onClearSelection={handleClearSelection}
        onDeleteSelected={() => setIsBulkDeleteOpen(true)}
        isReorderMode={isReorderMode}
        onToggleReorderMode={() => setIsReorderMode(!isReorderMode)}
      />

      {/* Main Gallery State Rendering */}
      {isLoading ? (
        <AdminGalleryGrid
          items={[]}
          isLoading={true}
          isSelectionMode={false}
          selectedIds={new Set()}
          onToggleSelect={() => {}}
          isReorderMode={false}
          onViewImage={() => {}}
          onEditCaption={() => {}}
          onDeleteImage={() => {}}
        />
      ) : isError ? (
        <div className="p-10 text-center bg-card rounded-xl border border-destructive/20 text-destructive space-y-3 shadow-2xs">
          <HugeiconsIcon icon={AlertCircleIcon} className="mx-auto w-10 h-10" />
          <p className="font-bold text-sm">Unable to Load Gallery Photos</p>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {error?.message || 'A network error occurred while retrieving gallery images.'}
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => refetch()}
            className="h-8 text-xs font-semibold gap-1.5 rounded-lg text-foreground"
          >
            <HugeiconsIcon icon={RefreshIcon} size={14} />
            <span>Retry</span>
          </Button>
        </div>
      ) : items.length === 0 ? (
        <Card className="border border-border/80 bg-card rounded-2xl p-12 text-center space-y-3 shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-cinnamon/10 text-cinnamon flex items-center justify-center mx-auto border border-cinnamon/20 shadow-2xs">
            <HugeiconsIcon icon={Image01Icon} size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-base text-foreground font-heading">
              Your Gallery is Empty
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Upload photos of your cafe, dishes, and beverages to showcase RadhaCafe on the public website.
            </p>
          </div>
          <div className="pt-2">
            <Button
              onClick={() => setIsUploadOpen(true)}
              className="bg-cinnamon hover:bg-cinnamon/90 text-white font-bold h-9 text-xs px-4 rounded-lg shadow-xs gap-1.5"
            >
              <HugeiconsIcon icon={Upload01Icon} size={15} />
              <span>Upload Photos</span>
            </Button>
          </div>
        </Card>
      ) : displayedItems.length === 0 ? (
        <div className="p-12 text-center bg-card rounded-xl border border-border/80 text-muted-foreground space-y-2 shadow-2xs">
          <p className="font-bold text-sm text-foreground">No photos match "{searchQuery}"</p>
          <p className="text-xs">Try searching for different caption keywords.</p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setSearchQuery('')}
            className="h-8 text-xs font-semibold rounded-lg mt-2"
          >
            Clear Search
          </Button>
        </div>
      ) : (
        <AdminGalleryGrid
          items={displayedItems}
          isLoading={false}
          isSelectionMode={isSelectionMode}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          isReorderMode={isReorderMode}
          onMoveEarlier={handleMoveEarlier}
          onMoveLater={handleMoveLater}
          onViewImage={(_, index) => setViewerIndex(index)}
          onEditPhoto={(item) => setEditingPhotoItem(item)}
          onEditCaption={(item) => setEditingItem(item)}
          onDeleteImage={(item) => setDeletingItem(item)}
        />
      )}

      {/* Multi-File Upload Modal */}
      <AdminGalleryUploadModal
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        currentMaxOrder={maxOrder}
      />

      {/* Fullscreen Photo Inspector Lightbox */}
      <AdminGalleryViewer
        items={displayedItems}
        selectedIndex={viewerIndex}
        onClose={() => setViewerIndex(null)}
        onSelectIndex={(idx) => setViewerIndex(idx)}
        onEditPhoto={(item) => setEditingPhotoItem(item)}
        onEditCaption={(item) => setEditingItem(item)}
        onDeleteImage={(item) => setDeletingItem(item)}
      />

      {/* Professional Built-in Photo Editor */}
      <GalleryImageEditor
        item={editingPhotoItem}
        open={Boolean(editingPhotoItem)}
        onClose={() => setEditingPhotoItem(null)}
      />

      {/* Edit Caption Modal */}
      <AdminGalleryEditCaptionModal
        item={editingItem}
        open={Boolean(editingItem)}
        onOpenChange={(open) => {
          if (!open) setEditingItem(null);
        }}
      />

      {/* Single Delete Confirmation Dialog */}
      <AlertDialog
        open={Boolean(deletingItem)}
        onOpenChange={(open) => {
          if (!open) setDeletingItem(null);
        }}
      >
        <AlertDialogContent className="max-w-md bg-card border border-border/80 rounded-2xl p-6 shadow-2xl space-y-3">
          <AlertDialogHeader className="space-y-1 text-left p-0">
            <AlertDialogTitle className="text-lg font-bold font-heading text-foreground">
              Delete this photo?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              This image will be permanently removed from the RadhaCafe public gallery and storage bucket.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {deletingItem && (
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-destructive/10 border border-destructive/20">
              <img
                src={deletingItem.image_url}
                alt="Delete preview"
                className="w-12 h-12 rounded-lg object-cover bg-black/20 shrink-0"
              />
              <p className="text-xs text-foreground font-medium truncate">
                {deletingItem.caption || 'Untitled photo'}
              </p>
            </div>
          )}

          <AlertDialogFooter className="flex gap-2 pt-2 border-t border-border/60">
            <AlertDialogCancel className="h-9 text-xs rounded-lg">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmSingleDelete}
              className="h-9 text-xs bg-destructive hover:bg-destructive/90 text-white font-bold rounded-lg"
            >
              Delete Photo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={isBulkDeleteOpen} onOpenChange={setIsBulkDeleteOpen}>
        <AlertDialogContent className="max-w-md bg-card border border-border/80 rounded-2xl p-6 shadow-2xl space-y-3">
          <AlertDialogHeader className="space-y-1 text-left p-0">
            <AlertDialogTitle className="text-lg font-bold font-heading text-foreground">
              Delete {selectedIds.size} Selected Photos?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              These {selectedIds.size} images will be permanently removed from the public gallery. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="flex gap-2 pt-2 border-t border-border/60">
            <AlertDialogCancel className="h-9 text-xs rounded-lg">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmBulkDelete}
              className="h-9 text-xs bg-destructive hover:bg-destructive/90 text-white font-bold rounded-lg"
            >
              Delete {selectedIds.size} Photos
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
