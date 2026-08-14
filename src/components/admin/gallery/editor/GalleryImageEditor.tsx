import { useState, useEffect, useRef, useCallback } from 'react';
import {
  type GalleryImageEditConfig,
  type CropAspectRatio,
  DEFAULT_EDIT_CONFIG,
} from '../../../../types/galleryEditor.types';
import {
  loadImageWithCORS,
  getAdjustmentFilter,
  getAspectRatioMultiplier,
  renderEditedImageBlob,
} from '../../../../lib/images/canvasEditor';
import {
  useSaveGalleryImageEdit,
  useRestoreGalleryOriginal,
} from '../../../../hooks/useGallery';
import { Button } from '../../../ui/button';
import { Slider } from '../../../ui/slider';
import { Label } from '../../../ui/label';
import { Input } from '../../../ui/input';
import { Textarea } from '../../../ui/textarea';
import { Badge } from '../../../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../ui/dropdown-menu';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Cancel01Icon,
  CropIcon,
  Sun01Icon,
  RotateLeft01Icon,
  RotateRight01Icon,
  FlipHorizontalIcon,
  FlipVerticalIcon,
  RefreshIcon,
  ViewIcon,
  CheckmarkCircle02Icon,
  MoreVerticalIcon,
} from '@hugeicons/core-free-icons';
import { toast } from '../../../ui/toast';
import type { GalleryItem } from '../../../../lib/supabase/queries/gallery';

interface GalleryImageEditorProps {
  item: GalleryItem | null;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

function parseSliderVal(val: any): number {
  if (typeof val === 'number') return val;
  if (Array.isArray(val) || (val && typeof val === 'object' && 0 in val)) {
    return Number(val[0]) || 0;
  }
  return 0;
}

export function GalleryImageEditor({
  item,
  open,
  onClose,
  onSuccess,
}: GalleryImageEditorProps) {
  const saveMutation = useSaveGalleryImageEdit();
  const restoreMutation = useRestoreGalleryOriginal();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);
  const [isLoadingImg, setIsLoadingImg] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Edit Configuration
  const [config, setConfig] = useState<GalleryImageEditConfig>(DEFAULT_EDIT_CONFIG);
  const [caption, setCaption] = useState('');
  const [title, setTitle] = useState('');
  const [activeTab, setActiveTab] = useState<'crop' | 'adjust' | 'transform' | 'details'>('crop');

  // UI States
  const [isComparing, setIsComparing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load Image and Initial Edit Config
  useEffect(() => {
    if (!open || !item) {
      setLoadedImage(null);
      setLoadError(null);
      setHasChanges(false);
      return;
    }

    setIsLoadingImg(true);
    setLoadError(null);

    // Prefer original unedited image if available for non-destructive workflow
    const sourceUrl = item.original_image_url || item.image_url;

    loadImageWithCORS(sourceUrl)
      .then((img: HTMLImageElement) => {
        setLoadedImage(img);
        setIsLoadingImg(false);

        // Restore saved edit config if present
        if (item.edit_config) {
          setConfig(item.edit_config);
        } else {
          setConfig(DEFAULT_EDIT_CONFIG);
        }
        setCaption(item.caption || '');
        setTitle(item.title || '');
        setHasChanges(false);
      })
      .catch((err: any) => {
        setLoadError(err?.message || 'Unable to load photo for editing.');
        setIsLoadingImg(false);
      });
  }, [open, item]);

  // Update change tracking
  const updateConfig = useCallback(
    (updater: (prev: GalleryImageEditConfig) => GalleryImageEditConfig) => {
      setConfig((prev: GalleryImageEditConfig) => {
        const next = updater(prev);
        setHasChanges(true);
        return next;
      });
    },
    []
  );

  // Canvas Realtime Rendering
  useEffect(() => {
    if (!canvasRef.current || !loadedImage) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const naturalW = loadedImage.naturalWidth || loadedImage.width;
    const naturalH = loadedImage.naturalHeight || loadedImage.height;

    // Display resolution
    const maxDisplay = 1200;
    let displayW = naturalW;
    let displayH = naturalH;
    if (displayW > maxDisplay || displayH > maxDisplay) {
      if (displayW >= displayH) {
        displayH = Math.round((displayH / displayW) * maxDisplay);
        displayW = maxDisplay;
      } else {
        displayW = Math.round((displayW / displayH) * maxDisplay);
        displayH = maxDisplay;
      }
    }

    const isQuarterTurn = config.transform.rotate === 90 || config.transform.rotate === 270;
    canvas.width = isQuarterTurn ? displayH : displayW;
    canvas.height = isQuarterTurn ? displayW : displayH;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (isComparing) {
      // Draw raw unedited original
      ctx.drawImage(loadedImage, 0, 0, canvas.width, canvas.height);
      return;
    }

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);

    // Rotate & Straighten
    const angleRad = ((config.transform.rotate + config.transform.straighten) * Math.PI) / 180;
    ctx.rotate(angleRad);

    // Flips
    const scaleX = config.transform.flipH ? -1 : 1;
    const scaleY = config.transform.flipV ? -1 : 1;
    ctx.scale(scaleX, scaleY);

    // Zoom
    const zoom = Math.max(1, config.transform.zoom || 1);
    ctx.scale(zoom, zoom);

    // Filters
    ctx.filter = getAdjustmentFilter(config.adjustments);

    // Draw
    ctx.drawImage(
      loadedImage,
      -displayW / 2,
      -displayH / 2,
      displayW,
      displayH
    );

    // Warmth Tint
    if (config.adjustments.warmth !== 0) {
      ctx.filter = 'none';
      const warmthVal = config.adjustments.warmth;
      if (warmthVal > 0) {
        ctx.fillStyle = `rgba(255, 170, 70, ${Math.min(0.35, warmthVal / 300)})`;
        ctx.globalCompositeOperation = 'overlay';
        ctx.fillRect(-displayW / 2, -displayH / 2, displayW, displayH);
      } else {
        ctx.fillStyle = `rgba(70, 150, 255, ${Math.min(0.35, Math.abs(warmthVal) / 300)})`;
        ctx.globalCompositeOperation = 'overlay';
        ctx.fillRect(-displayW / 2, -displayH / 2, displayW, displayH);
      }
    }

    ctx.restore();
  }, [loadedImage, config, isComparing]);

  // Aspect Ratio Selection Handler
  const handleSelectAspectRatio = (ratio: CropAspectRatio) => {
    if (!loadedImage) return;
    const naturalRatio = loadedImage.naturalWidth / loadedImage.naturalHeight;
    const multiplier = getAspectRatioMultiplier(ratio, naturalRatio);

    updateConfig((prev: GalleryImageEditConfig) => {
      let newW = 100;
      let newH = 100;

      if (multiplier) {
        if (multiplier >= naturalRatio) {
          newH = Math.min(100, Math.round((naturalRatio / multiplier) * 100));
        } else {
          newW = Math.min(100, Math.round((multiplier / naturalRatio) * 100));
        }
      }

      return {
        ...prev,
        crop: {
          ...prev.crop,
          aspectRatio: ratio,
          width: newW,
          height: newH,
          x: Math.round((100 - newW) / 2),
          y: Math.round((100 - newH) / 2),
        },
      };
    });
  };

  // Reset Adjustments Only
  const handleResetAdjustments = () => {
    updateConfig((prev: GalleryImageEditConfig) => ({
      ...prev,
      adjustments: DEFAULT_EDIT_CONFIG.adjustments,
    }));
  };

  // Reset Everything
  const handleResetAll = () => {
    setConfig(DEFAULT_EDIT_CONFIG);
    setHasChanges(true);
  };

  // Save changes
  const handleSave = async () => {
    if (!item || !loadedImage || isSaving) return;

    setIsSaving(true);
    try {
      // Render final derivative at high resolution
      const { blob, width, height } = await renderEditedImageBlob(loadedImage, config, 2400);

      await saveMutation.mutateAsync({
        id: item.id,
        editedBlob: blob,
        editConfig: config,
        width,
        height,
        caption: caption.trim() || null,
        title: title.trim() || null,
      });

      toast.add({
        title: 'Photo Saved & Published',
        description: 'The updated photo is now live on the public gallery.',
        type: 'success',
      });

      setHasChanges(false);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.add({
        title: 'Save Failed',
        description: err?.message || 'Unable to save photo edits.',
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Restore Original Image
  const handleRestoreOriginal = async () => {
    if (!item) return;

    try {
      await restoreMutation.mutateAsync(item.id);
      toast.add({
        title: 'Original Restored',
        description: 'The original unedited photograph has been restored.',
        type: 'success',
      });
      setShowRestoreDialog(false);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.add({
        title: 'Restore Failed',
        description: err?.message || 'Unable to restore original photo.',
        type: 'error',
      });
    }
  };

  const handleCloseAttempt = () => {
    if (hasChanges) {
      setShowDiscardDialog(true);
    } else {
      onClose();
    }
  };

  if (!open || !item) return null;

  const isPreviouslyEdited = Boolean(item.original_image_url || item.edit_config);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between overflow-hidden select-none animate-in fade-in duration-200">
      {/* Top Navigation & Action Bar */}
      <div className="p-3 sm:p-4 flex items-center justify-between gap-3 text-white border-b border-white/10 bg-black/60 shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            size="icon"
            variant="ghost"
            onClick={handleCloseAttempt}
            className="h-9 w-9 text-white/80 hover:text-white hover:bg-white/10 rounded-full"
            aria-label="Close editor"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={18} />
          </Button>

          <div>
            <h2 className="text-sm sm:text-base font-bold font-heading text-white truncate max-w-[200px] sm:max-w-xs">
              {item.title || item.caption || 'Edit Photo'}
            </h2>
            <p className="text-[10px] sm:text-[11px] text-white/60 font-mono">
              {loadedImage
                ? `${loadedImage.naturalWidth}×${loadedImage.naturalHeight}px`
                : 'Loading photo...'}
            </p>
          </div>
        </div>

        {/* Center/Right Toolbar Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Hold to Compare Button */}
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onMouseDown={() => setIsComparing(true)}
            onMouseUp={() => setIsComparing(false)}
            onTouchStart={() => setIsComparing(true)}
            onTouchEnd={() => setIsComparing(false)}
            className={`h-8 text-xs font-semibold gap-1.5 rounded-lg px-2.5 transition-colors ${
              isComparing
                ? 'bg-cinnamon text-white'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
            title="Press and hold to view original photo"
          >
            <HugeiconsIcon icon={ViewIcon} size={14} />
            <span className="hidden sm:inline">Compare</span>
          </Button>

          {/* Reset All */}
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={handleResetAll}
            className="h-8 text-xs font-semibold text-white/80 hover:text-white hover:bg-white/10 gap-1.5 rounded-lg px-2.5"
            title="Reset all adjustments and transforms"
          >
            <HugeiconsIcon icon={RefreshIcon} size={14} />
            <span className="hidden sm:inline">Reset</span>
          </Button>

          {/* More Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10 rounded-lg"
                  aria-label="More options"
                />
              }
            >
              <HugeiconsIcon icon={MoreVerticalIcon} size={16} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-card border-border/80 text-xs">
              {isPreviouslyEdited && (
                <>
                  <DropdownMenuItem
                    onClick={() => setShowRestoreDialog(true)}
                    className="text-amber-600 dark:text-amber-400 font-semibold gap-2"
                  >
                    <HugeiconsIcon icon={RefreshIcon} size={14} />
                    <span>Restore Original Photo</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={() => setActiveTab('details')} className="gap-2">
                <span>View Photo Details</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Primary Save Button */}
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving || isLoadingImg || !loadedImage}
            className="h-8 text-xs bg-cinnamon hover:bg-cinnamon/90 text-white font-bold rounded-lg px-4 gap-1.5 shadow-xs"
          >
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} />
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </Button>
        </div>
      </div>

      {/* Main Workspace (Canvas + Side Controls) */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
        {/* Center / Left Canvas Viewport */}
        <div className="flex-1 bg-[#0d0d0d] flex items-center justify-center p-3 sm:p-6 relative overflow-hidden">
          {isLoadingImg ? (
            <div className="text-center space-y-2 text-white/60">
              <span className="inline-block w-8 h-8 rounded-full border-2 border-cinnamon border-t-transparent animate-spin" />
              <p className="text-xs font-mono">Preparing photo for editing...</p>
            </div>
          ) : loadError ? (
            <div className="text-center space-y-2 text-destructive p-6 bg-destructive/10 rounded-xl max-w-sm">
              <p className="text-xs font-bold">{loadError}</p>
              <Button size="xs" variant="outline" onClick={onClose} className="h-7 text-xs">
                Close
              </Button>
            </div>
          ) : (
            <div className="relative max-h-full max-w-full flex items-center justify-center">
              <canvas
                ref={canvasRef}
                className="max-h-[60vh] md:max-h-[78vh] max-w-full object-contain rounded-lg shadow-2xl transition-all"
              />

              {/* Rule of Thirds Crop Overlay (when in crop mode) */}
              {activeTab === 'crop' && (
                <div className="absolute inset-0 pointer-events-none border border-white/40 rounded-lg">
                  <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/25" />
                  <div className="absolute right-1/3 top-0 bottom-0 w-px bg-white/25" />
                  <div className="absolute top-1/3 left-0 right-0 h-px bg-white/25" />
                  <div className="absolute bottom-1/3 left-0 right-0 h-px bg-white/25" />
                </div>
              )}

              {/* Original Comparison Badge */}
              {isComparing && (
                <div className="absolute top-3 left-3 bg-black/80 text-amber-400 font-mono text-[11px] font-bold px-2.5 py-1 rounded-md border border-amber-500/40 shadow-md">
                  Viewing Original
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side / Mobile Bottom Panel */}
        <div className="w-full md:w-80 lg:w-96 bg-card border-t md:border-t-0 md:border-l border-border/80 p-4 sm:p-5 flex flex-col justify-between overflow-y-auto max-h-[38vh] md:max-h-full shrink-0 shadow-lg">
          <Tabs value={activeTab} onValueChange={(v: string) => setActiveTab(v as any)} className="space-y-4 flex-1">
            <TabsList className="grid grid-cols-4 bg-secondary/60 h-9 p-1 rounded-lg">
              <TabsTrigger value="crop" className="text-xs font-semibold rounded-md gap-1">
                <HugeiconsIcon icon={CropIcon} size={13} />
                <span>Crop</span>
              </TabsTrigger>
              <TabsTrigger value="adjust" className="text-xs font-semibold rounded-md gap-1">
                <HugeiconsIcon icon={Sun01Icon} size={13} />
                <span>Adjust</span>
              </TabsTrigger>
              <TabsTrigger value="transform" className="text-xs font-semibold rounded-md gap-1">
                <HugeiconsIcon icon={RotateRight01Icon} size={13} />
                <span>Rotate</span>
              </TabsTrigger>
              <TabsTrigger value="details" className="text-xs font-semibold rounded-md gap-1">
                <span>Details</span>
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Crop & Aspect Ratio */}
            <TabsContent value="crop" className="space-y-4 outline-none">
              {/* Aspect Ratio Pills */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground">Aspect Ratio</Label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(
                    [
                      { id: 'free', label: 'Free' },
                      { id: 'original', label: 'Original' },
                      { id: '1:1', label: '1:1 Sq' },
                      { id: '4:5', label: '4:5 Port' },
                      { id: '4:3', label: '4:3 Land' },
                      { id: '3:2', label: '3:2' },
                      { id: '16:9', label: '16:9' },
                      { id: '9:16', label: '9:16' },
                    ] as const
                  ).map(({ id, label }) => {
                    const isSelected = config.crop.aspectRatio === id;
                    return (
                      <Button
                        key={id}
                        type="button"
                        variant={isSelected ? 'default' : 'outline'}
                        size="xs"
                        onClick={() => handleSelectAspectRatio(id)}
                        className={`text-[11px] h-8 rounded-lg ${
                          isSelected
                            ? 'bg-cinnamon text-white font-bold'
                            : 'border-border/80 text-foreground/80'
                        }`}
                      >
                        {label}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Straighten Angle Slider (-15° to +15°) */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <Label className="font-semibold text-foreground">Straighten</Label>
                  <span className="font-mono text-muted-foreground font-semibold">
                    {config.transform.straighten > 0 ? `+${config.transform.straighten}°` : `${config.transform.straighten}°`}
                  </span>
                </div>
                <Slider
                  min={-15}
                  max={15}
                  step={0.5}
                  value={[config.transform.straighten]}
                  onValueChange={(val: any) =>
                    updateConfig((p: GalleryImageEditConfig) => ({
                      ...p,
                      transform: { ...p.transform, straighten: parseSliderVal(val) },
                    }))
                  }
                  className="py-1"
                />
              </div>

              {/* Zoom Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <Label className="font-semibold text-foreground">Zoom</Label>
                  <span className="font-mono text-muted-foreground font-semibold">
                    {config.transform.zoom.toFixed(1)}x
                  </span>
                </div>
                <Slider
                  min={1}
                  max={3}
                  step={0.1}
                  value={[config.transform.zoom]}
                  onValueChange={(val: any) =>
                    updateConfig((p: GalleryImageEditConfig) => ({
                      ...p,
                      transform: { ...p.transform, zoom: parseSliderVal(val) },
                    }))
                  }
                  className="py-1"
                />
              </div>
            </TabsContent>

            {/* Tab 2: Adjustments */}
            <TabsContent value="adjust" className="space-y-3.5 outline-none">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Color & Light
                </span>
                <button
                  type="button"
                  onClick={handleResetAdjustments}
                  className="text-[11px] font-semibold text-cinnamon hover:underline"
                >
                  Reset Light
                </button>
              </div>

              {/* Brightness */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Brightness</span>
                  <span className="font-mono text-[11px]">{config.adjustments.brightness}</span>
                </div>
                <Slider
                  min={-100}
                  max={100}
                  step={1}
                  value={[config.adjustments.brightness]}
                  onValueChange={(val: any) =>
                    updateConfig((p: GalleryImageEditConfig) => ({
                      ...p,
                      adjustments: { ...p.adjustments, brightness: parseSliderVal(val) },
                    }))
                  }
                />
              </div>

              {/* Exposure */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Exposure</span>
                  <span className="font-mono text-[11px]">{config.adjustments.exposure}</span>
                </div>
                <Slider
                  min={-100}
                  max={100}
                  step={1}
                  value={[config.adjustments.exposure]}
                  onValueChange={(val: any) =>
                    updateConfig((p: GalleryImageEditConfig) => ({
                      ...p,
                      adjustments: { ...p.adjustments, exposure: parseSliderVal(val) },
                    }))
                  }
                />
              </div>

              {/* Contrast */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Contrast</span>
                  <span className="font-mono text-[11px]">{config.adjustments.contrast}</span>
                </div>
                <Slider
                  min={-100}
                  max={100}
                  step={1}
                  value={[config.adjustments.contrast]}
                  onValueChange={(val: any) =>
                    updateConfig((p: GalleryImageEditConfig) => ({
                      ...p,
                      adjustments: { ...p.adjustments, contrast: parseSliderVal(val) },
                    }))
                  }
                />
              </div>

              {/* Saturation */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Saturation</span>
                  <span className="font-mono text-[11px]">{config.adjustments.saturation}</span>
                </div>
                <Slider
                  min={-100}
                  max={100}
                  step={1}
                  value={[config.adjustments.saturation]}
                  onValueChange={(val: any) =>
                    updateConfig((p: GalleryImageEditConfig) => ({
                      ...p,
                      adjustments: { ...p.adjustments, saturation: parseSliderVal(val) },
                    }))
                  }
                />
              </div>

              {/* Warmth */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Warmth / Temperature</span>
                  <span className="font-mono text-[11px]">
                    {config.adjustments.warmth > 0 ? `+${config.adjustments.warmth}` : config.adjustments.warmth}
                  </span>
                </div>
                <Slider
                  min={-100}
                  max={100}
                  step={1}
                  value={[config.adjustments.warmth]}
                  onValueChange={(val: any) =>
                    updateConfig((p: GalleryImageEditConfig) => ({
                      ...p,
                      adjustments: { ...p.adjustments, warmth: parseSliderVal(val) },
                    }))
                  }
                />
              </div>
            </TabsContent>

            {/* Tab 3: Transform (Rotate & Flips) */}
            <TabsContent value="transform" className="space-y-4 outline-none">
              <div className="space-y-2">
                <Label className="text-xs font-semibold">90° Rotation</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      updateConfig((p: GalleryImageEditConfig) => ({
                        ...p,
                        transform: { ...p.transform, rotate: (p.transform.rotate + 270) % 360 },
                      }))
                    }
                    className="h-9 text-xs gap-1.5 rounded-lg border-border/80"
                  >
                    <HugeiconsIcon icon={RotateLeft01Icon} size={15} />
                    <span>Rotate Left</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      updateConfig((p: GalleryImageEditConfig) => ({
                        ...p,
                        transform: { ...p.transform, rotate: (p.transform.rotate + 90) % 360 },
                      }))
                    }
                    className="h-9 text-xs gap-1.5 rounded-lg border-border/80"
                  >
                    <HugeiconsIcon icon={RotateRight01Icon} size={15} />
                    <span>Rotate Right</span>
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold">Flip Orientation</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={config.transform.flipH ? 'default' : 'outline'}
                    size="sm"
                    onClick={() =>
                      updateConfig((p: GalleryImageEditConfig) => ({
                        ...p,
                        transform: { ...p.transform, flipH: !p.transform.flipH },
                      }))
                    }
                    className={`h-9 text-xs gap-1.5 rounded-lg ${
                      config.transform.flipH ? 'bg-cinnamon text-white' : 'border-border/80'
                    }`}
                  >
                    <HugeiconsIcon icon={FlipHorizontalIcon} size={15} />
                    <span>Horizontal</span>
                  </Button>

                  <Button
                    type="button"
                    variant={config.transform.flipV ? 'default' : 'outline'}
                    size="sm"
                    onClick={() =>
                      updateConfig((p: GalleryImageEditConfig) => ({
                        ...p,
                        transform: { ...p.transform, flipV: !p.transform.flipV },
                      }))
                    }
                    className={`h-9 text-xs gap-1.5 rounded-lg ${
                      config.transform.flipV ? 'bg-cinnamon text-white' : 'border-border/80'
                    }`}
                  >
                    <HugeiconsIcon icon={FlipVerticalIcon} size={15} />
                    <span>Vertical</span>
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Tab 4: Details & Caption */}
            <TabsContent value="details" className="space-y-3 outline-none">
              <div className="space-y-1.5">
                <Label htmlFor="edit-title" className="text-xs font-semibold">
                  Photo Title
                </Label>
                <Input
                  id="edit-title"
                  placeholder="e.g. Morning Pour-Over"
                  value={title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setTitle(e.target.value);
                    setHasChanges(true);
                  }}
                  className="h-8 text-xs bg-background rounded-lg"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-caption" className="text-xs font-semibold">
                  Caption
                </Label>
                <Textarea
                  id="edit-caption"
                  placeholder="e.g. Artisan coffee crafted fresh at RadhaCafe."
                  rows={3}
                  maxLength={300}
                  value={caption}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                    setCaption(e.target.value);
                    setHasChanges(true);
                  }}
                  className="text-xs bg-background rounded-lg resize-none"
                />
              </div>

              {isPreviouslyEdited && (
                <div className="p-3 rounded-lg bg-secondary/40 border border-border/60 text-[11px] text-muted-foreground space-y-1">
                  <Badge variant="outline" className="text-[10px] text-cinnamon border-cinnamon/30">
                    Non-Destructive Active
                  </Badge>
                  <p>Original source image is preserved and can be restored at any time.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Discard Changes Alert Dialog */}
      <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <AlertDialogContent className="max-w-md bg-card border border-border/80 rounded-2xl p-6 shadow-2xl space-y-3">
          <AlertDialogHeader className="space-y-1 text-left p-0">
            <AlertDialogTitle className="text-lg font-bold font-heading text-foreground">
              Discard photo edits?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              You have unsaved changes. Exiting now will discard all crops and adjustments.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="flex gap-2 pt-2 border-t border-border/60">
            <AlertDialogCancel className="h-9 text-xs rounded-lg">Keep Editing</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowDiscardDialog(false);
                onClose();
              }}
              className="h-9 text-xs bg-destructive hover:bg-destructive/90 text-white font-bold rounded-lg"
            >
              Discard Edits
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Restore Original Alert Dialog */}
      <AlertDialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <AlertDialogContent className="max-w-md bg-card border border-border/80 rounded-2xl p-6 shadow-2xl space-y-3">
          <AlertDialogHeader className="space-y-1 text-left p-0">
            <AlertDialogTitle className="text-lg font-bold font-heading text-foreground">
              Restore the original photo?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              This will revert the public gallery photo back to the raw uploaded image and remove all saved edits.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="flex gap-2 pt-2 border-t border-border/60">
            <AlertDialogCancel className="h-9 text-xs rounded-lg">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRestoreOriginal}
              className="h-9 text-xs bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg"
            >
              Restore Original
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
