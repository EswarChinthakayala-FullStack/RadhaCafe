import { useState, useEffect } from 'react';
import { uploadImageToStorage, BUCKETS, validateImageFile } from '../../../lib/supabase/storage';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Upload01Icon,
  Image01Icon,
  Delete02Icon,
  Loading03Icon,
  Link01Icon,
  Alert02Icon,
} from '@hugeicons/core-free-icons';

interface ItemImageUploadProps {
  imageUrl?: string;
  onUploadComplete: (url: string) => void;
  onRemoveImage?: () => void;
}

export function ItemImageUpload({ imageUrl, onUploadComplete, onRemoveImage }: ItemImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(imageUrl || null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
  const [directUrl, setDirectUrl] = useState<string>(imageUrl || '');
  const [imgLoadError, setImgLoadError] = useState(false);

  // Sync external image URL prop
  useEffect(() => {
    setPreviewUrl(imageUrl || null);
    setDirectUrl(imageUrl || '');
    setImgLoadError(false);
  }, [imageUrl]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image file (5MB, JPEG/PNG/WebP/SVG)
    const validation = validateImageFile(file);
    if (!validation.valid && validation.error) {
      setErrorMsg(validation.error);
      return;
    }

    const objectUrl = URL.createObjectURL(file);

    try {
      setErrorMsg(null);
      setUploading(true);
      setImgLoadError(false);

      const { url, error } = await uploadImageToStorage(file, BUCKETS.MENU_IMAGES, 'items');
      if (error) {
        // Rollback preview if storage upload failed
        setPreviewUrl(imageUrl || null);
        setErrorMsg(error || 'Storage upload failed. Try entering a direct Image URL below.');
        return;
      }

      if (url) {
        setPreviewUrl(url);
        setDirectUrl(url);
        onUploadComplete(url);
      }
    } catch (err: any) {
      setPreviewUrl(imageUrl || null);
      setErrorMsg(err.message || 'Image upload failed. Try entering a direct Image URL below.');
    } finally {
      setUploading(false);
      URL.revokeObjectURL(objectUrl);
    }
  };

  const handleDirectUrlChange = (val: string) => {
    setDirectUrl(val);
    setErrorMsg(null);
    setImgLoadError(false);
    if (val.trim()) {
      setPreviewUrl(val.trim());
      onUploadComplete(val.trim());
    } else {
      setPreviewUrl(null);
      if (onRemoveImage) onRemoveImage();
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    setDirectUrl('');
    setErrorMsg(null);
    setImgLoadError(false);
    if (onRemoveImage) onRemoveImage();
  };

  return (
    <div className="space-y-3">
      {/* Mode Switcher */}
      <div className="flex items-center gap-2 pb-1">
        <button
          type="button"
          onClick={() => { setUploadMode('file'); setErrorMsg(null); }}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${uploadMode === 'file'
            ? 'bg-primary/10 text-primary border border-primary/30'
            : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
            }`}
        >
          <HugeiconsIcon icon={Upload01Icon} size={13} />
          <span>Upload File</span>
        </button>

        <button
          type="button"
          onClick={() => { setUploadMode('url'); setErrorMsg(null); }}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${uploadMode === 'url'
            ? 'bg-primary/10 text-primary border border-primary/30'
            : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
            }`}
        >
          <HugeiconsIcon icon={Link01Icon} size={13} />
          <span>Image URL</span>
        </button>
      </div>

      <div className="flex items-start gap-4">
        {/* Thumbnail Preview */}
        {previewUrl && !imgLoadError ? (
          <div className="relative w-20 h-20 rounded-md border border-border overflow-hidden bg-secondary shadow-xs group shrink-0">
            <img
              src={previewUrl}
              alt="Menu item preview"
              className="w-full h-full object-cover"
              onError={() => setImgLoadError(true)}
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-1 right-1 bg-destructive/90 text-white rounded-full p-1 hover:bg-destructive transition-colors shadow-xs"
              aria-label="Remove item image"
              title="Remove Image"
            >
              <HugeiconsIcon icon={Delete02Icon} size={12} />
            </button>
          </div>
        ) : (
          <div className="w-20 h-20 rounded-md border border-dashed border-border/80 bg-secondary/30 flex flex-col items-center justify-center text-muted-foreground/60 shrink-0">
            <HugeiconsIcon icon={Image01Icon} size={22} />
            <span className="text-[10px] font-semibold mt-1">No Image</span>
          </div>
        )}

        {/* Input Area based on Mode */}
        <div className="flex-1 space-y-2">
          {uploadMode === 'file' ? (
            <div className="space-y-2">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/svg+xml"
                id="menu-img-file-input"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="xs"
                disabled={uploading}
                onClick={() => document.getElementById('menu-img-file-input')?.click()}
                className="gap-1.5 text-xs font-semibold h-9 px-3 rounded-md"
              >
                <HugeiconsIcon icon={uploading ? Loading03Icon : Upload01Icon} size={14} className={uploading ? 'animate-spin' : ''} />
                <span>{uploading ? 'Uploading to Storage...' : previewUrl ? 'Replace Image File' : 'Choose Image File'}</span>
              </Button>
              <p className="text-[10px] text-muted-foreground">JPEG, PNG, WebP or SVG up to 5MB.</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              <Input
                placeholder="https://images.unsplash.com/photo-..."
                value={directUrl}
                onChange={(e) => handleDirectUrlChange(e.target.value)}
                className="h-10 text-xs bg-background rounded-md"
              />
              <p className="text-[10px] text-muted-foreground">Paste any valid public image URL.</p>
            </div>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-1.5 p-2.5 rounded-md bg-destructive/10 text-destructive border border-destructive/20 text-xs font-medium">
          <HugeiconsIcon icon={Alert02Icon} size={14} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
