import type {
  GalleryImageEditConfig,
  ImageAdjustments,
  CropAspectRatio,
} from '../../types/galleryEditor.types';

/**
 * Load an image with anonymous CORS to prevent canvas tainting.
 */
export function loadImageWithCORS(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => {
      // Retry without CORS if local/blob URL
      const fallbackImg = new Image();
      fallbackImg.onload = () => resolve(fallbackImg);
      fallbackImg.onerror = (err) => reject(err);
      fallbackImg.src = src;
    };
    img.src = src;
  });
}

/**
 * Compute the CSS filter string from standard image adjustments.
 */
export function getAdjustmentFilter(adjustments: ImageAdjustments): string {
  const brightness = 1 + (adjustments.brightness + adjustments.exposure * 0.6) / 100;
  const contrast = 1 + adjustments.contrast / 100;
  const saturate = 1 + adjustments.saturation / 100;

  // Clamped values for safety
  const safeBrightness = Math.max(0.1, Math.min(3, brightness));
  const safeContrast = Math.max(0.1, Math.min(3, contrast));
  const safeSaturate = Math.max(0, Math.min(3, saturate));

  return `brightness(${safeBrightness}) contrast(${safeContrast}) saturate(${safeSaturate})`;
}

/**
 * Calculate crop rectangle aspect ratio numbers.
 */
export function getAspectRatioMultiplier(ratio: CropAspectRatio, naturalRatio: number): number | null {
  switch (ratio) {
    case '1:1':
      return 1;
    case '4:5':
      return 4 / 5;
    case '4:3':
      return 4 / 3;
    case '3:2':
      return 3 / 2;
    case '16:9':
      return 16 / 9;
    case '9:16':
      return 9 / 16;
    case 'original':
      return naturalRatio;
    case 'free':
    default:
      return null;
  }
}

/**
 * Render the fully transformed and filtered image onto an off-screen canvas and export as WebP Blob.
 */
export async function renderEditedImageBlob(
  image: HTMLImageElement,
  config: GalleryImageEditConfig,
  maxLongEdge = 2400
): Promise<{ blob: Blob; width: number; height: number }> {
  const origW = image.naturalWidth || image.width;
  const origH = image.naturalHeight || image.height;

  // 1. Calculate Crop Box in original image coordinates
  const cropBox = {
    x: (config.crop.x / 100) * origW,
    y: (config.crop.y / 100) * origH,
    w: Math.max(10, (config.crop.width / 100) * origW),
    h: Math.max(10, (config.crop.height / 100) * origH),
  };

  // 2. Determine Output Canvas Resolution (scaled to maxLongEdge without upscaling)
  let targetW = cropBox.w;
  let targetH = cropBox.h;

  if (targetW > maxLongEdge || targetH > maxLongEdge) {
    if (targetW >= targetH) {
      targetH = Math.round((targetH / targetW) * maxLongEdge);
      targetW = maxLongEdge;
    } else {
      targetW = Math.round((targetW / targetH) * maxLongEdge);
      targetH = maxLongEdge;
    }
  }

  // Account for 90 or 270 degree rotation
  const isQuarterTurn = config.transform.rotate === 90 || config.transform.rotate === 270;
  const finalW = isQuarterTurn ? targetH : targetW;
  const finalH = isQuarterTurn ? targetW : targetH;

  const canvas = document.createElement('canvas');
  canvas.width = finalW;
  canvas.height = finalH;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not supported');

  ctx.save();

  // Position at canvas center for rotation & flips
  ctx.translate(finalW / 2, finalH / 2);

  // Apply Rotation & Straighten
  const totalAngleRad = ((config.transform.rotate + config.transform.straighten) * Math.PI) / 180;
  ctx.rotate(totalAngleRad);

  // Apply Flips
  const scaleX = config.transform.flipH ? -1 : 1;
  const scaleY = config.transform.flipV ? -1 : 1;
  ctx.scale(scaleX, scaleY);

  // Apply Zoom
  const zoom = Math.max(1, config.transform.zoom || 1);
  ctx.scale(zoom, zoom);

  // Apply CSS Filters (Brightness, Contrast, Saturation, Exposure)
  ctx.filter = getAdjustmentFilter(config.adjustments);

  // Draw Cropped Region
  ctx.drawImage(
    image,
    cropBox.x,
    cropBox.y,
    cropBox.w,
    cropBox.h,
    -targetW / 2,
    -targetH / 2,
    targetW,
    targetH
  );

  // Apply Warmth / Temperature Tint
  if (config.adjustments.warmth !== 0) {
    ctx.filter = 'none';
    const warmthVal = config.adjustments.warmth;
    if (warmthVal > 0) {
      // Warm Amber
      ctx.fillStyle = `rgba(255, 170, 70, ${Math.min(0.35, warmthVal / 300)})`;
      ctx.globalCompositeOperation = 'overlay';
      ctx.fillRect(-targetW / 2, -targetH / 2, targetW, targetH);
    } else {
      // Cool Blue
      ctx.fillStyle = `rgba(70, 150, 255, ${Math.min(0.35, Math.abs(warmthVal) / 300)})`;
      ctx.globalCompositeOperation = 'overlay';
      ctx.fillRect(-targetW / 2, -targetH / 2, targetW, targetH);
    }
  }

  ctx.restore();

  // Convert to WebP or fallback to JPEG
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve({ blob, width: finalW, height: finalH });
        } else {
          // Fallback to jpeg
          canvas.toBlob(
            (jpegBlob) => {
              if (jpegBlob) {
                resolve({ blob: jpegBlob, width: finalW, height: finalH });
              } else {
                reject(new Error('Failed to export image blob from canvas'));
              }
            },
            'image/jpeg',
            0.9
          );
        }
      },
      'image/webp',
      0.9
    );
  });
}
