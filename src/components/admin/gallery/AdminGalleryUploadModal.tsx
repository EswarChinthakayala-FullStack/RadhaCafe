import { useState, useRef, useEffect } from 'react';
import { uploadImageToStorage, BUCKETS, validateImageFile } from '../../../lib/supabase/storage';
import { useCreateGalleryItem } from '../../../hooks/useGallery';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Upload01Icon,
  Image01Icon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  AlertCircleIcon,
} from '@hugeicons/core-free-icons';
import { toast } from '../../ui/toast';

interface AdminGalleryUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentMaxOrder: number;
}

interface UploadDraft {
  id: string;
  file: File;
  previewUrl: string;
  width: number;
  height: number;
  caption: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  errorMessage?: string;
}

export function AdminGalleryUploadModal({
  open,
  onOpenChange,
  currentMaxOrder,
}: AdminGalleryUploadModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createMutation = useCreateGalleryItem();

  const [drafts, setDrafts] = useState<UploadDraft[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [overallProgress, setOverallProgress] = useState<{ current: number; total: number } | null>(null);

  // Cleanup object URLs when dialog closes
  useEffect(() => {
    if (!open) {
      drafts.forEach((d) => URL.revokeObjectURL(d.previewUrl));
      setDrafts([]);
      setIsUploading(false);
      setOverallProgress(null);
    }
  }, [open]);

  const handleProcessFiles = (files: FileList | File[]) => {
    const validFiles: File[] = [];
    const errors: string[] = [];

    Array.from(files).forEach((file) => {
      const validation = validateImageFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else if (validation.error) {
        errors.push(`${file.name}: ${validation.error}`);
      }
    });

    if (errors.length > 0) {
      toast.add({
        title: 'Some files could not be added',
        description: errors.slice(0, 2).join(', '),
        type: 'error',
      });
    }

    if (validFiles.length === 0) return;

    // Enforce 20 files per batch
    const remainingSlots = Math.max(0, 20 - drafts.length);
    const filesToAdd = validFiles.slice(0, remainingSlots);

    if (filesToAdd.length < validFiles.length) {
      toast.add({
        title: 'Batch limit reached',
        description: 'You can upload up to 20 images per batch.',
        type: 'warning',
      });
    }

    filesToAdd.forEach((file) => {
      const previewUrl = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        setDrafts((prev) => [
          ...prev,
          {
            id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            file,
            previewUrl,
            width: img.naturalWidth || 800,
            height: img.naturalHeight || 600,
            caption: '',
            status: 'pending',
          },
        ]);
      };
      img.src = previewUrl;
    });
  };

  const handleRemoveDraft = (id: string) => {
    setDrafts((prev) => {
      const target = prev.find((d) => d.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((d) => d.id !== id);
    });
  };

  const handleCaptionChange = (id: string, caption: string) => {
    setDrafts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, caption } : d))
    );
  };

  const handleStartUpload = async () => {
    if (drafts.length === 0 || isUploading) return;

    setIsUploading(true);
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < drafts.length; i++) {
      const draft = drafts[i];
      if (draft.status === 'success') continue;

      setOverallProgress({ current: i + 1, total: drafts.length });
      setDrafts((prev) =>
        prev.map((d) => (d.id === draft.id ? { ...d, status: 'uploading' } : d))
      );

      try {
        // 1. Upload to Supabase storage
        const { url: uploadedUrl, error: uploadError } = await uploadImageToStorage(
          draft.file,
          BUCKETS.GALLERY_IMAGES,
          'gallery'
        );

        if (uploadError || !uploadedUrl) {
          throw new Error(uploadError || 'Storage upload failed');
        }

        // 2. Insert into gallery_images table
        await createMutation.mutateAsync({
          image_url: uploadedUrl,
          caption: draft.caption.trim() || null,
          width: draft.width,
          height: draft.height,
          display_order: currentMaxOrder + i + 1,
        });

        setDrafts((prev) =>
          prev.map((d) => (d.id === draft.id ? { ...d, status: 'success' } : d))
        );
        successCount++;
      } catch (err: any) {
        setDrafts((prev) =>
          prev.map((d) =>
            d.id === draft.id
              ? { ...d, status: 'error', errorMessage: err.message || 'Upload failed' }
              : d
          )
        );
        failCount++;
      }
    }

    setIsUploading(false);

    if (failCount === 0 && successCount > 0) {
      toast.add({
        title: 'Photos Uploaded Successfully',
        description: `${successCount} photo(s) added to the public gallery.`,
        type: 'success',
      });
      onOpenChange(false);
    } else if (successCount > 0 && failCount > 0) {
      toast.add({
        title: 'Upload Partially Completed',
        description: `${successCount} uploaded, ${failCount} failed. You can retry failed images.`,
        type: 'warning',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={isUploading ? () => {} : onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-2xl md:max-w-3xl bg-card border border-border/80 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <DialogHeader className="space-y-1 text-left p-0 border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-cinnamon/10 text-cinnamon border border-cinnamon/20 flex items-center justify-center shadow-2xs shrink-0">
              <HugeiconsIcon icon={Upload01Icon} size={18} />
            </div>
            <div>
              <DialogTitle className="text-lg sm:text-xl font-bold font-heading text-foreground">
                Upload Gallery Photos
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Select or drop multiple photos to showcase on the RadhaCafe public gallery.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-y-auto pr-1 no-scrollbar">
          {/* Drag & Drop Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              if (e.dataTransfer.files) {
                handleProcessFiles(e.dataTransfer.files);
              }
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              isDragOver
                ? 'border-cinnamon bg-cinnamon/5'
                : 'border-border/80 hover:border-cinnamon/60 hover:bg-secondary/40 bg-secondary/20'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="hidden"
              onChange={(e) => {
                if (e.target.files) handleProcessFiles(e.target.files);
              }}
            />
            <div className="w-12 h-12 rounded-xl bg-card border border-border/80 flex items-center justify-center mx-auto text-cinnamon shadow-2xs mb-2">
              <HugeiconsIcon icon={Image01Icon} size={24} />
            </div>
            <p className="text-sm font-bold text-foreground">
              Drop photos here, or <span className="text-cinnamon underline">browse</span>
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Supports JPEG, PNG, WebP, AVIF up to 10MB each (max 20 per batch).
            </p>
          </div>

          {/* Selected File Previews Grid */}
          {drafts.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-foreground">
                  Selected Photos ({drafts.length})
                </span>
                {isUploading && overallProgress && (
                  <span className="font-mono text-cinnamon font-bold text-[11px] animate-pulse">
                    Uploading {overallProgress.current} of {overallProgress.total}...
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {drafts.map((draft) => (
                  <div
                    key={draft.id}
                    className="p-3 rounded-xl border border-border/80 bg-secondary/30 flex gap-3 items-start relative group"
                  >
                    {/* Thumbnail Preview */}
                    <div className="w-16 h-16 rounded-lg bg-black/40 overflow-hidden shrink-0 border border-border/80 relative">
                      <img
                        src={draft.previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      {draft.status === 'uploading' && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="text-[10px] text-white font-mono font-bold animate-pulse">...</span>
                        </div>
                      )}
                      {draft.status === 'success' && (
                        <div className="absolute inset-0 bg-emerald-950/70 flex items-center justify-center text-emerald-400">
                          <HugeiconsIcon icon={CheckmarkCircle02Icon} size={20} />
                        </div>
                      )}
                      {draft.status === 'error' && (
                        <div className="absolute inset-0 bg-red-950/70 flex items-center justify-center text-red-400">
                          <HugeiconsIcon icon={AlertCircleIcon} size={20} />
                        </div>
                      )}
                    </div>

                    {/* Meta & Caption Input */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-semibold text-foreground truncate" title={draft.file.name}>
                          {draft.file.name}
                        </p>
                        {!isUploading && draft.status !== 'success' && (
                          <button
                            type="button"
                            onClick={() => handleRemoveDraft(draft.id)}
                            className="text-muted-foreground hover:text-destructive p-0.5 rounded transition-colors"
                            aria-label="Remove photo"
                          >
                            <HugeiconsIcon icon={Cancel01Icon} size={14} />
                          </button>
                        )}
                      </div>

                      <p className="text-[10px] text-muted-foreground font-mono">
                        {(draft.file.size / 1024 / 1024).toFixed(2)} MB • {draft.width}×{draft.height}px
                      </p>

                      <Input
                        placeholder="Add caption (optional)..."
                        value={draft.caption}
                        disabled={isUploading || draft.status === 'success'}
                        onChange={(e) => handleCaptionChange(draft.id, e.target.value)}
                        className="h-8 text-xs bg-background rounded-md"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-border/60">
          <span className="text-xs text-muted-foreground font-medium">
            {drafts.length > 0 ? `${drafts.length} photo(s) selected` : 'No photos chosen'}
          </span>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isUploading}
              onClick={() => onOpenChange(false)}
              className="h-9 text-xs rounded-lg px-3.5"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={drafts.length === 0 || isUploading}
              onClick={handleStartUpload}
              className="h-9 text-xs bg-cinnamon hover:bg-cinnamon/90 text-white font-bold rounded-lg px-4 gap-1.5 shadow-xs"
            >
              <HugeiconsIcon icon={Upload01Icon} size={15} />
              <span>
                {isUploading
                  ? 'Uploading...'
                  : `Upload ${drafts.length > 0 ? `${drafts.length} Photos` : 'Photos'}`}
              </span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
