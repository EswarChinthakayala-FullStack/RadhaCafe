import type { LogoAlignment, LogoSize } from '../../types';
import { ESC_POS_COMMANDS } from '../../constants/printerCommands';

export interface RasterLogoOptions {
  paperWidth: number; // 32 = 58mm (384 dots max), 48 = 80mm (576 dots max)
  logoSize: LogoSize;
  logoAlignment: LogoAlignment;
}

// In-memory LRU raster byte cache for rush-hour instant throughput
const rasterCache = new Map<string, Uint8Array>();
const MAX_CACHE_ENTRIES = 50;

/**
 * Calculates target dot width based on paper width and size preset
 */
export function calculateTargetWidth(paperWidth: number, size: LogoSize): number {
  const maxDots = paperWidth >= 48 ? 576 : 384;

  let width: number;
  switch (size) {
    case 'small':
      width = Math.round(maxDots * 0.35); // ~136 dots (58mm) or ~200 dots (80mm)
      break;
    case 'large':
      width = Math.round(maxDots * 0.75); // ~288 dots (58mm) or ~432 dots (80mm)
      break;
    case 'medium':
    default:
      width = Math.round(maxDots * 0.55); // ~216 dots (58mm) or ~320 dots (80mm)
      break;
  }

  // Ensure width is a multiple of 8 for 1-bit ESC/POS byte packing
  return Math.max(16, Math.round(width / 8) * 8);
}

/**
 * Loads an image from a URL into an HTML Image element
 */
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || typeof Image === 'undefined') {
      return reject(new Error('Image loading not supported in this environment'));
    }

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error(`Failed to load image: ${err}`));
    img.src = url;
  });
}

/**
 * Converts an image into ESC/POS GS v 0 raster bit image byte commands
 */
export async function convertImageToEscPosRaster(
  imageUrl: string,
  options: RasterLogoOptions
): Promise<Uint8Array | null> {
  if (!imageUrl || typeof window === 'undefined') return null;

  const cacheKey = `${imageUrl}:${options.paperWidth}:${options.logoSize}:${options.logoAlignment}`;
  if (rasterCache.has(cacheKey)) {
    return rasterCache.get(cacheKey)!;
  }

  try {
    const img = await loadImage(imageUrl);
    const targetWidth = calculateTargetWidth(options.paperWidth, options.logoSize);
    const aspectRatio = img.naturalHeight / (img.naturalWidth || 1);
    const targetHeight = Math.max(8, Math.round(targetWidth * aspectRatio));

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;

    // Fill canvas with pure white background (thermal paper base)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
    const { data } = imageData;

    const widthInBytes = targetWidth / 8;
    const xL = widthInBytes & 0xff;
    const xH = (widthInBytes >> 8) & 0xff;
    const yL = targetHeight & 0xff;
    const yH = (targetHeight >> 8) & 0xff;

    // 1-bit Monochrome Bitmap Buffer (1 = Black dot, 0 = White space)
    const bitmapBytes = new Uint8Array(widthInBytes * targetHeight);
    let byteIndex = 0;

    for (let y = 0; y < targetHeight; y++) {
      for (let x = 0; x < targetWidth; x += 8) {
        let byte = 0;
        for (let b = 0; b < 8; b++) {
          const pixelIndex = ((y * targetWidth) + (x + b)) * 4;
          const r = data[pixelIndex];
          const g = data[pixelIndex + 1];
          const bVal = data[pixelIndex + 2];
          const alpha = data[pixelIndex + 3];

          // Treat transparent pixels as white
          if (alpha < 128) {
            continue;
          }

          // Grayscale luminance
          const luminance = 0.299 * r + 0.587 * g + 0.114 * bVal;

          // High contrast threshold for clean thermal output
          if (luminance < 165) {
            byte |= 1 << (7 - b);
          }
        }
        bitmapBytes[byteIndex++] = byte;
      }
    }

    // Build ESC/POS Raster Command:
    // 1. Set alignment (ESC a n)
    // 2. Raster Image (GS v 0 m xL xH yL yH d1...dk)
    // 3. Reset alignment (ESC a 0) + small line feed
    const alignBytes =
      options.logoAlignment === 'center'
        ? ESC_POS_COMMANDS.ALIGN_CENTER
        : options.logoAlignment === 'right'
        ? ESC_POS_COMMANDS.ALIGN_RIGHT
        : ESC_POS_COMMANDS.ALIGN_LEFT;

    const header = [
      ...alignBytes,
      0x1d, 0x76, 0x30, 0x00, // GS v 0 0
      xL, xH,
      yL, yH,
    ];

    const footer = [
      ...ESC_POS_COMMANDS.ALIGN_LEFT,
      ...ESC_POS_COMMANDS.FEED_LINE,
    ];

    const result = new Uint8Array(header.length + bitmapBytes.length + footer.length);
    result.set(new Uint8Array(header), 0);
    result.set(bitmapBytes, header.length);
    result.set(new Uint8Array(footer), header.length + bitmapBytes.length);

    // Store in LRU cache
    if (rasterCache.size >= MAX_CACHE_ENTRIES) {
      const firstKey = rasterCache.keys().next().value;
      if (firstKey) rasterCache.delete(firstKey);
    }
    rasterCache.set(cacheKey, result);

    return result;
  } catch (err) {
    console.warn('Failed to convert logo image to ESC/POS raster, falling back to text:', err);
    return null;
  }
}

/**
 * Clears the local logo raster cache (e.g. when Cafe Logo is updated)
 */
export function clearRasterLogoCache(): void {
  rasterCache.clear();
}
