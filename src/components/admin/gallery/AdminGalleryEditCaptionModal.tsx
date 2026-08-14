import { useState, useEffect } from 'react';
import { useUpdateGalleryItem } from '../../../hooks/useGallery';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { HugeiconsIcon } from '@hugeicons/react';
import { Edit02Icon } from '@hugeicons/core-free-icons';
import { toast } from '../../ui/toast';
import type { GalleryItem } from '../../../lib/supabase/queries/gallery';

interface AdminGalleryEditCaptionModalProps {
  item: GalleryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdminGalleryEditCaptionModal({
  item,
  open,
  onOpenChange,
}: AdminGalleryEditCaptionModalProps) {
  const updateMutation = useUpdateGalleryItem();
  const [caption, setCaption] = useState('');
  const [title, setTitle] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (item && open) {
      setCaption(item.caption || '');
      setTitle(item.title || '');
      setErrorMsg(null);
    }
  }, [item, open]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    setErrorMsg(null);
    try {
      await updateMutation.mutateAsync({
        id: item.id,
        input: {
          caption: caption.trim() || null,
          title: title.trim() || null,
        },
      });

      toast.add({
        title: 'Caption Updated',
        description: 'Changes will appear on the public gallery immediately.',
        type: 'success',
      });

      onOpenChange(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update caption.');
    }
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-md bg-card border border-border/80 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4">
        <DialogHeader className="space-y-1 text-left p-0">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-cinnamon/10 text-cinnamon border border-cinnamon/20 flex items-center justify-center shadow-2xs shrink-0">
              <HugeiconsIcon icon={Edit02Icon} size={18} />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold font-heading text-foreground">
                Edit Photo Details
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Update the public caption and title for this photograph.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        {/* Thumbnail Preview */}
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-secondary/40 border border-border/60">
          <img
            src={item.image_url}
            alt={item.caption || 'Thumbnail'}
            className="w-14 h-14 rounded-lg object-cover bg-black/20 shrink-0"
          />
          <div className="text-xs text-muted-foreground min-w-0 space-y-0.5 font-mono text-[11px]">
            <p className="font-sans font-bold text-foreground truncate">
              {item.title || 'Cafe Photo'}
            </p>
            {item.width && item.height && (
              <p>{item.width}×{item.height}px</p>
            )}
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-3.5">
          <div className="space-y-1.5">
            <Label htmlFor="photo-title" className="text-xs font-semibold">
              Title (Optional)
            </Label>
            <Input
              id="photo-title"
              placeholder="e.g. Filter Coffee & Samosa"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-9 text-xs bg-background rounded-lg"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <Label htmlFor="photo-caption" className="font-semibold">
                Caption
              </Label>
              <span className="text-[10px] text-muted-foreground">
                {caption.length}/300
              </span>
            </div>
            <Textarea
              id="photo-caption"
              placeholder="e.g. Freshly brewed artisan filter coffee served hot at RadhaCafe."
              rows={3}
              maxLength={300}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="text-xs bg-background rounded-lg resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-9 text-xs rounded-lg px-3.5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={updateMutation.isPending}
              className="h-9 text-xs bg-cinnamon hover:bg-cinnamon/90 text-white font-bold rounded-lg px-4 shadow-xs"
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
