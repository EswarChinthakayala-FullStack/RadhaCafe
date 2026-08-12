import { useState } from 'react';
import {
  useGalleryImages,
  useCreateGalleryItem,
  useUpdateGalleryItem,
  useDeleteGalleryItem,
  useReorderGalleryItems,
} from '../../../hooks/useGallery';
import { uploadImageToStorage, BUCKETS, validateImageFile } from '../../../lib/supabase/storage';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Badge } from '../../ui/badge';
import { Card, CardContent } from '../../ui/card';
import { Loader } from '../../shared/Loader';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../ui/tooltip';
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
import { formatDate } from '../../../lib/utils/formatDate';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Upload01Icon,
  Image01Icon,
  Edit01Icon,
  Delete02Icon,
  ArrowUp01Icon,
  ArrowDown01Icon,
  PlusSignIcon,
  RefreshIcon,
  ViewIcon,
} from '@hugeicons/core-free-icons';
import type { GalleryItem } from '../../../lib/supabase/queries/gallery';

export function GalleryManager() {
  const { data: items, isLoading, isError } = useGalleryImages();
  const createMutation = useCreateGalleryItem();
  const updateMutation = useUpdateGalleryItem();
  const deleteMutation = useDeleteGalleryItem();
  const reorderMutation = useReorderGalleryItems();

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [replacingItem, setReplacingItem] = useState<GalleryItem | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<GalleryItem | null>(null);
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);

  const handleOpenUpload = () => {
    setReplacingItem(null);
    setSelectedFile(null);
    setPreviewUrl(null);
    setCaption('');
    setErrorMsg(null);
    setIsUploadOpen(true);
  };

  const handleProcessFile = (file: File) => {
    const validation = validateImageFile(file);
    if (!validation.valid && validation.error) {
      setErrorMsg(validation.error);
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const objectUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(objectUrl);
    setErrorMsg(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleProcessFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleProcessFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMsg('Please select an image file to upload.');
      return;
    }

    try {
      setUploading(true);
      setErrorMsg(null);

      // Upload file to gallery-images bucket
      const { url, error: uploadErr } = await uploadImageToStorage(selectedFile, BUCKETS.GALLERY_IMAGES, 'photos');
      if (uploadErr || !url) {
        throw new Error(uploadErr || 'Failed to upload photo to storage.');
      }

      if (replacingItem) {
        // Update image_url and caption for replacing item
        await updateMutation.mutateAsync({
          id: replacingItem.id,
          input: { caption: caption.trim() || undefined },
        });
        setReplacingItem(null);
      } else {
        // Create new database record
        const displayOrder = (items?.length || 0) + 1;
        await createMutation.mutateAsync({
          image_url: url,
          caption: caption.trim() || undefined,
          display_order: displayOrder,
        });
      }

      setIsUploadOpen(false);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to upload photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    try {
      await updateMutation.mutateAsync({
        id: editingItem.id,
        input: { caption: caption.trim() || undefined },
      });
      setEditingItem(null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update photo caption.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    await deleteMutation.mutateAsync({ id: deletingItem.id, imageUrl: deletingItem.image_url });
    setDeletingItem(null);
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if (!items) return;
    const newItems = [...items];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;

    if (targetIdx < 0 || targetIdx >= newItems.length) return;

    // Swap positions
    const temp = newItems[index];
    newItems[index] = newItems[targetIdx];
    newItems[targetIdx] = temp;

    // Map display orders
    const reorderPayload = newItems.map((item, idx) => ({
      id: item.id,
      display_order: idx + 1,
    }));

    await reorderMutation.mutateAsync(reorderPayload);
  };

  if (isLoading) return <Loader label="Loading gallery photo collection..." />;

  if (isError) {
    return (
      <Card className="border-border/80 bg-card p-6 text-center text-xs text-destructive">
        Unable to load gallery images. Please try refreshing the page.
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-md border border-border/80 bg-card shadow-xs">
          <div>
            <h3 className="font-bold text-sm text-foreground font-heading">Public Website Photo Gallery</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Total Published Photos: <strong className="text-foreground">{items?.length || 0}</strong>
            </p>
          </div>
          <Button onClick={handleOpenUpload} className="bg-cinnamon hover:bg-cinnamon/90 text-white font-bold text-xs gap-1.5 h-9 rounded-md shadow-xs">
            <HugeiconsIcon icon={PlusSignIcon} size={16} />
            <span>Upload Photos</span>
          </Button>
        </div>

        {/* Gallery Grid */}
        {items && items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {items.map((item, idx) => (
              <Card key={item.id} className="border-border/80 bg-card overflow-hidden shadow-xs group hover:border-cinnamon/50 transition-all rounded-md">
                <div className="relative aspect-[4/3] bg-secondary/30 overflow-hidden cursor-pointer" onClick={() => setLightboxItem(item)}>
                  <img
                    src={item.image_url}
                    alt={item.caption || `RadhaCafe Gallery Photo ${idx + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <Badge variant="secondary" className="absolute top-2 left-2 text-[10px] font-bold bg-background/90 backdrop-blur shadow-xs">
                    #{idx + 1}
                  </Badge>

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1 text-xs font-semibold">
                    <HugeiconsIcon icon={ViewIcon} size={18} />
                    <span>Preview</span>
                  </div>
                </div>

                <CardContent className="p-3 space-y-2 text-xs">
                  <p className="font-medium text-foreground line-clamp-1 min-h-[1.25rem]">
                    {item.caption || <span className="text-muted-foreground italic">No caption provided</span>}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-border/60">
                    {/* Reorder Arrows */}
                    <div className="flex items-center gap-1">
                      <Tooltip>
                        <TooltipTrigger>
                          <button
                            disabled={idx === 0 || reorderMutation.isPending}
                            onClick={() => handleMove(idx, 'up')}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-30 transition-colors"
                            aria-label="Move photo up"
                          >
                            <HugeiconsIcon icon={ArrowUp01Icon} size={14} />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="text-[10px]">Move Up</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger>
                          <button
                            disabled={idx === items.length - 1 || reorderMutation.isPending}
                            onClick={() => handleMove(idx, 'down')}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-30 transition-colors"
                            aria-label="Move photo down"
                          >
                            <HugeiconsIcon icon={ArrowDown01Icon} size={14} />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="text-[10px]">Move Down</TooltipContent>
                      </Tooltip>
                    </div>

                    {/* Actions: Edit Caption, Replace, Delete */}
                    <div className="flex items-center gap-1">
                      <Tooltip>
                        <TooltipTrigger>
                          <button
                            onClick={() => {
                              setEditingItem(item);
                              setCaption(item.caption || '');
                            }}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                            aria-label="Edit photo caption"
                          >
                            <HugeiconsIcon icon={Edit01Icon} size={14} />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="text-[10px]">Edit Caption</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger>
                          <button
                            onClick={() => {
                              setReplacingItem(item);
                              setSelectedFile(null);
                              setPreviewUrl(null);
                              setCaption(item.caption || '');
                              setIsUploadOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                            aria-label="Replace photo image"
                          >
                            <HugeiconsIcon icon={RefreshIcon} size={14} />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="text-[10px]">Replace Photo</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger>
                          <button
                            onClick={() => setDeletingItem(item)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            aria-label="Delete photo from gallery"
                          >
                            <HugeiconsIcon icon={Delete02Icon} size={14} />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="text-[10px]">Delete Photo</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center border border-dashed border-border/80 rounded-md bg-card space-y-3">
            <HugeiconsIcon icon={Image01Icon} size={36} className="mx-auto text-muted-foreground/40" />
            <div>
              <h4 className="font-bold text-foreground text-sm font-heading">No gallery photos uploaded yet</h4>
              <p className="text-xs text-muted-foreground mt-1">Upload high-resolution photos of RadhaCafe atmosphere and specialty coffee.</p>
            </div>
            <Button onClick={handleOpenUpload} className="bg-cinnamon hover:bg-cinnamon/90 text-white font-bold text-xs rounded-md">
              Upload Photo
            </Button>
          </div>
        )}

        {/* Upload / Replace Dialog with Drag & Drop */}
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogContent className="max-w-md bg-card rounded-md p-6">
            <DialogHeader className="p-0 border-b border-border/60 pb-3">
              <DialogTitle className="text-base font-bold font-heading">
                {replacingItem ? 'Replace Gallery Photo' : 'Upload Gallery Photo'}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Drag and drop or select a JPEG, PNG, or WebP photo (up to 5MB).
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs pt-2">
              {errorMsg && (
                <div className="p-3 rounded-md bg-destructive/10 text-destructive border border-destructive/20 font-medium">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-2">
                <Label className="font-bold">Select Photo</Label>
                {previewUrl ? (
                  <div className="relative aspect-[4/3] rounded-md border border-border overflow-hidden bg-secondary">
                    <img src={previewUrl} alt="Upload preview" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => document.getElementById('gallery-file-picker')?.click()}
                    className={`aspect-[4/3] rounded-md border-2 border-dashed transition-all flex flex-col items-center justify-center p-4 text-center cursor-pointer ${isDragOver
                      ? 'border-cinnamon bg-cinnamon/5 text-cinnamon'
                      : 'border-border/80 hover:border-cinnamon/60 text-muted-foreground'
                      }`}
                  >
                    <HugeiconsIcon icon={Upload01Icon} size={32} className="text-cinnamon" />
                    <span className="text-xs font-bold text-foreground mt-2">
                      {isDragOver ? 'Drop photo here to upload' : 'Click or Drag & Drop photo here'}
                    </span>
                    <span className="text-[10px] text-muted-foreground mt-1">
                      Supports JPG, PNG, WebP up to 5MB
                    </span>
                  </div>
                )}

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  id="gallery-file-picker"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="gallery-caption" className="font-bold">Photo Caption (Optional)</Label>
                <Input
                  id="gallery-caption"
                  placeholder="e.g. Freshly Roasted Artisanal Espresso"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="rounded-md border-border/80 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsUploadOpen(false)} disabled={uploading} className="rounded-md text-xs">
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-cinnamon hover:bg-cinnamon/90 text-white font-bold rounded-md text-xs" disabled={uploading || !selectedFile}>
                  {uploading ? 'Uploading Photo...' : replacingItem ? 'Save & Replace' : 'Upload & Publish'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Caption Dialog */}
        <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
          <DialogContent className="max-w-md bg-card rounded-md p-6">
            <DialogHeader className="p-0 border-b border-border/60 pb-3">
              <DialogTitle className="text-base font-bold font-heading">Edit Photo Caption</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="edit-caption" className="font-bold">Caption</Label>
                <Input
                  id="edit-caption"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="rounded-md border-border/80 text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 border-t border-border/60 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setEditingItem(null)} className="rounded-md text-xs">
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-cinnamon hover:bg-cinnamon/90 text-white font-bold rounded-md text-xs">
                  Save Caption
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* High-Res Lightbox Preview Dialog */}
        <Dialog open={!!lightboxItem} onOpenChange={(open) => !open && setLightboxItem(null)}>
          <DialogContent className="max-w-3xl bg-card rounded-md p-6">
            <DialogHeader className="p-0 border-b border-border/60 pb-3">
              <DialogTitle className="text-base font-bold font-heading">
                {lightboxItem?.caption || 'Photo Preview'}
              </DialogTitle>
            </DialogHeader>
            {lightboxItem && (
              <div className="space-y-4 pt-2">
                <div className="relative aspect-[16/10] rounded-md overflow-hidden bg-secondary">
                  <img src={lightboxItem.image_url} alt={lightboxItem.caption || 'Photo Preview'} className="w-full h-full object-contain bg-black/90" />
                </div>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>Display Order: #{lightboxItem.display_order}</span>
                  <span>Uploaded: {formatDate(lightboxItem.created_at)}</span>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Alert Dialog */}
        <AlertDialog open={!!deletingItem} onOpenChange={(open) => !open && setDeletingItem(null)}>
          <AlertDialogContent className="bg-card rounded-md p-6">
            <AlertDialogHeader className="p-0 border-b border-border/60 pb-3">
              <AlertDialogTitle className="text-base font-bold font-heading">Delete Photo from Gallery?</AlertDialogTitle>
              <AlertDialogDescription className="text-xs">
                This will remove the photo from the RadhaCafe public website and delete its stored file.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="pt-2">
              <AlertDialogCancel className="text-xs rounded-md">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90 text-white text-xs font-bold rounded-md">
                Delete Photo
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}
