import { useState, useEffect, useRef } from 'react';
import { useCafeSettings, useUpdateCafeSettings } from '../../../hooks/useSettings';
import { uploadImageToStorage, BUCKETS, validateImageFile } from '../../../lib/supabase/storage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { Button } from '../../ui/button';
import { Skeleton } from '../../ui/skeleton';
import { toast } from '../../ui/toast';
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
import { Upload01Icon, Image01Icon, Delete02Icon, RefreshIcon } from '@hugeicons/core-free-icons';

export function BrandingSettings() {
  const { data: settings, isLoading } = useCafeSettings();
  const updateMutation = useUpdateCafeSettings();

  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isRemoveOpen, setIsRemoveOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (settings?.logo_url) {
      setLogoUrl(settings.logo_url);
      setPreviewUrl(settings.logo_url);
    }
  }, [settings]);

  const processFile = async (file: File) => {
    const validation = validateImageFile(file);
    if (!validation.valid && validation.error) {
      toast.add({
        title: 'Invalid File',
        description: validation.error,
        type: 'error',
      });
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    try {
      setUploading(true);

      const { url, error: uploadErr } = await uploadImageToStorage(file, BUCKETS.CAFE_ASSETS, 'logo');
      if (uploadErr || !url) {
        throw new Error(uploadErr || 'Failed to upload logo image to storage.');
      }

      await updateMutation.mutateAsync({ logo_url: url });
      setLogoUrl(url);

      toast.add({
        title: 'Brand Logo Updated',
        description: 'New cafe logo has been uploaded and applied across website headers and printed receipts.',
        type: 'success',
      });
    } catch (err: any) {
      toast.add({
        title: 'Upload Failed',
        description: err.message || 'Unable to upload logo. Please check file format and try again.',
        type: 'error',
      });
      setPreviewUrl(logoUrl);
    } finally {
      setUploading(false);
      URL.revokeObjectURL(objectUrl);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleRemoveConfirm = async () => {
    try {
      await updateMutation.mutateAsync({ logo_url: null });
      setLogoUrl(null);
      setPreviewUrl(null);
      setIsRemoveOpen(false);

      toast.add({
        title: 'Logo Removed',
        description: 'Brand logo has been removed. Website and receipts will revert to text branding.',
        type: 'success',
      });
    } catch (err: any) {
      toast.add({
        title: 'Remove Failed',
        description: err.message || 'Failed to remove logo.',
        type: 'error',
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="border-border/80 bg-card shadow-xs rounded-md w-full">
        <CardHeader className="pb-4 border-b border-border/60">
          <Skeleton className="h-6 w-48 rounded-lg" />
          <Skeleton className="h-4 w-72 rounded-lg mt-1" />
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <Skeleton className="h-40 w-full rounded-md" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/80 bg-card shadow-xs rounded-md w-full">
      <CardHeader className="pb-4 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-md bg-cinnamon/10 text-cinnamon">
            <HugeiconsIcon icon={Image01Icon} size={20} />
          </div>
          <div>
            <CardTitle className="text-base font-bold font-heading text-foreground">
              Branding & Cafe Logo
            </CardTitle>
            <CardDescription className="text-xs">
              Upload and manage the RadhaCafe brand logo displayed on the website header and printed receipts.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6 pb-6 space-y-6 text-xs">
        {/* Upload & Preview Dropzone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative p-6 rounded-md border-2 border-dashed transition-all cursor-pointer flex flex-col sm:flex-row items-center gap-6 ${dragActive
            ? 'border-cinnamon bg-cinnamon/10 scale-[1.01]'
            : 'border-border/80 bg-secondary/20 hover:border-cinnamon/50 hover:bg-secondary/40'
            }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/svg+xml"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Logo Preview Box */}
          {previewUrl ? (
            <div className="relative w-32 h-32 rounded-md border border-border bg-background p-3 flex items-center justify-center shadow-xs overflow-hidden shrink-0 group">
              <img
                src={previewUrl}
                alt="RadhaCafe Logo Preview"
                className="max-w-full max-h-full object-contain"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                <HugeiconsIcon icon={RefreshIcon} size={16} className="text-white" />
                <span className="text-[10px] text-white font-bold">Replace</span>
              </div>
            </div>
          ) : (
            <div className="w-32 h-32 rounded-md border border-dashed border-border/80 bg-background flex flex-col items-center justify-center text-muted-foreground/60 shrink-0">
              <HugeiconsIcon icon={Image01Icon} size={36} />
              <span className="text-[10px] mt-1 font-semibold">No Custom Logo</span>
            </div>
          )}

          {/* Upload Dropzone Text & Actions */}
          <div className="space-y-2 text-center sm:text-left flex-1" onClick={(e) => e.stopPropagation()}>
            <div>
              <h4 className="font-bold text-foreground text-sm">
                {logoUrl ? 'Update Brand Logo' : 'Upload Brand Logo'}
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                Click or drag & drop an image file here to set your official cafe logo.
              </p>
              <p className="text-[11px] text-muted-foreground/80 mt-1">
                Supported formats: JPEG, PNG, WebP, SVG (Max size: 5MB).
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2 flex-wrap">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="gap-1.5 text-xs font-semibold h-9 px-3.5 rounded-md border-border/80"
              >
                <HugeiconsIcon icon={Upload01Icon} size={14} />
                <span>{uploading ? 'Uploading Logo...' : logoUrl ? 'Replace Logo' : 'Upload Logo'}</span>
              </Button>

              {logoUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={uploading}
                  onClick={() => setIsRemoveOpen(true)}
                  className="text-destructive hover:bg-destructive/10 gap-1.5 text-xs h-9 px-3 rounded-md font-semibold"
                >
                  <HugeiconsIcon icon={Delete02Icon} size={14} />
                  <span>Remove Logo</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Remove Logo Confirmation Alert Dialog */}
        <AlertDialog open={isRemoveOpen} onOpenChange={setIsRemoveOpen}>
          <AlertDialogContent className="bg-card border-border rounded-md max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-base font-bold font-heading text-foreground">
                Remove Cafe Logo?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs leading-relaxed text-muted-foreground">
                This will delete the current logo configuration. The website header and thermal printed receipts will automatically revert to using default RadhaCafe text branding.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="text-xs h-9 rounded-md">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleRemoveConfirm}
                className="bg-destructive hover:bg-destructive/90 text-white text-xs font-bold h-9 rounded-md"
              >
                Remove Logo
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
