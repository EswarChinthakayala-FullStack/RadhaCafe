export type CropAspectRatio =
  | 'free'
  | 'original'
  | '1:1'
  | '4:5'
  | '4:3'
  | '3:2'
  | '16:9'
  | '9:16';

export interface CropState {
  x: number; // percentage 0 - 100
  y: number; // percentage 0 - 100
  width: number; // percentage 0 - 100
  height: number; // percentage 0 - 100
  aspectRatio: CropAspectRatio;
}

export interface TransformState {
  rotate: number; // 0, 90, 180, 270
  straighten: number; // -15 to +15 degrees
  flipH: boolean;
  flipV: boolean;
  zoom: number; // 1 to 3
}

export interface ImageAdjustments {
  brightness: number; // -100 to 100, default 0
  exposure: number; // -100 to 100, default 0
  contrast: number; // -100 to 100, default 0
  highlights: number; // -100 to 100, default 0
  shadows: number; // -100 to 100, default 0
  saturation: number; // -100 to 100, default 0
  warmth: number; // -100 to 100, default 0 (color temperature)
}

export interface GalleryImageEditConfig {
  crop: CropState;
  transform: TransformState;
  adjustments: ImageAdjustments;
}

export const DEFAULT_CROP_STATE: CropState = {
  x: 0,
  y: 0,
  width: 100,
  height: 100,
  aspectRatio: 'free',
};

export const DEFAULT_TRANSFORM_STATE: TransformState = {
  rotate: 0,
  straighten: 0,
  flipH: false,
  flipV: false,
  zoom: 1,
};

export const DEFAULT_ADJUSTMENTS: ImageAdjustments = {
  brightness: 0,
  exposure: 0,
  contrast: 0,
  highlights: 0,
  shadows: 0,
  saturation: 0,
  warmth: 0,
};

export const DEFAULT_EDIT_CONFIG: GalleryImageEditConfig = {
  crop: DEFAULT_CROP_STATE,
  transform: DEFAULT_TRANSFORM_STATE,
  adjustments: DEFAULT_ADJUSTMENTS,
};
