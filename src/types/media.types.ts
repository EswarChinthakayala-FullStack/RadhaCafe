export type ImageVisualRole =
  | 'hero'
  | 'cafe-interior'
  | 'coffee-detail'
  | 'drink-product'
  | 'food-menu'
  | 'atmosphere'
  | 'gallery'
  | 'water'
  | 'location';

export interface HeroSlideMedia {
  id: string;
  src: string;
  alt: string;
  titleMain: string;
  titleAccent: string;
  subtitle: string;
  desktopPosition?: string;
  mobilePosition?: string;
  overlayStrength?: 'light' | 'medium' | 'deep';
}

export interface AtmosphereMedia {
  id: string;
  src: string;
  alt: string;
  title: string;
  subtitle?: string;
  role: ImageVisualRole;
}
