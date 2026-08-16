import type { ChangelogArea, ChangelogCategory } from './types';

export const SCOPE_TO_AREA_MAP: Record<string, ChangelogArea> = {
  printer: 'Printer',
  bluetooth: 'Printer',
  print: 'Printer',
  orders: 'Orders',
  order: 'Orders',
  pos: 'Orders',
  cart: 'Orders',
  checkout: 'Orders',
  offline: 'Offline Mode',
  sync: 'Offline Mode',
  pwa: 'Offline Mode',
  receipt: 'Receipts',
  receipts: 'Receipts',
  menu: 'Menu',
  items: 'Menu',
  specials: 'Menu',
  bestseller: 'Menu',
  bestsellers: 'Menu',
  badge: 'Menu',
  customer: 'Customers',
  customers: 'Customers',
  review: 'Reviews',
  reviews: 'Reviews',
  discussions: 'Reviews',
  gallery: 'Gallery',
  photos: 'Gallery',
  analytics: 'Analytics',
  reports: 'Analytics',
  settings: 'Settings',
  tax: 'Settings',
  profile: 'Settings',
  auth: 'Account',
  account: 'Account',
  security: 'Account',
  water: 'Water',
  changelog: 'General',
};

export const TYPE_TO_CATEGORY_MAP: Record<string, ChangelogCategory> = {
  feat: 'new',
  fix: 'fixed',
  perf: 'performance',
  refactor: 'improved',
  security: 'security',
  improve: 'improved',
  update: 'improved',
};

/**
 * Words that should remain uppercase or formatted specially in title casing
 */
export const SPECIAL_ACRONYMS: Record<string, string> = {
  pos: 'POS',
  pwa: 'PWA',
  ui: 'UI',
  ux: 'UX',
  rpc: 'RPC',
  api: 'API',
  gst: 'GST',
  inr: 'INR',
  id: 'ID',
  uuid: 'UUID',
  db: 'DB',
  gatt: 'GATT',
  url: 'URL',
  json: 'JSON',
  csv: 'CSV',
  ble: 'BLE',
  esc: 'ESC/POS',
};

/**
 * Curated overrides for high-impact commits to ensure beautiful release copy
 */
export interface CommitOverride {
  title?: string;
  description?: string;
  category?: ChangelogCategory;
  area?: ChangelogArea;
  hidden?: boolean;
  group?: string;
}

export const COMMIT_OVERRIDES: Record<string, CommitOverride> = {
  // Background Print Queue & Rush Mode
  'print-queue': {
    title: 'Background Receipt Print Queue & Rush Mode',
    description: 'Order placement now saves instantly without blocking the next order. Receipts are managed in a background queue with tear-slip guidance and automatic BLE recovery.',
    category: 'new',
    area: 'Printer',
  },
  // Offline POS commits
  'offline-orders': {
    title: 'Offline Order Support & Power-Cut Mode',
    description: 'RadhaCafe now works fully offline during electricity cuts or router downtime. Orders are stored safely on the device and synchronized automatically when internet returns.',
    category: 'new',
    area: 'Offline Mode',
  },
  // Saved Bluetooth printers commits
  'printer-session': {
    title: 'Persistent Bluetooth Printer Sessions',
    description: 'The preferred thermal printer now stays connected throughout the admin session and automatically recovers from temporary radio interruptions.',
    category: 'improved',
    area: 'Printer',
  },
  'saved-printers': {
    title: 'Saved Bluetooth Printers & Auto-Connect',
    description: 'Save verified receipt printers, choose a preferred printer, and connect automatically on sign-in without picking from the native Bluetooth dialog every time.',
    category: 'new',
    area: 'Printer',
  },
  // Receipt previews
  'receipt-preview': {
    title: 'Full-Page Receipt Template Preview',
    description: 'Inspect receipt designs in a dedicated responsive preview workspace with authentic thermal slip dimensions before printing.',
    category: 'improved',
    area: 'Receipts',
  },
  // Specific commit hash overrides from history for ultra-clean copy
  '4c27115': {
    title: 'Distinct Best Seller and Popular Indicators',
    description: 'Top-selling dishes and trending menu items now feature dedicated visual badges to accelerate order taking during peak hours.',
    category: 'improved',
    area: 'Menu',
    group: 'menu-badges',
  },
  'af81f7d': {
    title: 'Clearer Best Seller and Popular Badges',
    description: 'Refined badge typography and high-contrast color treatment for effortless dish identification on POS cards.',
    category: 'improved',
    area: 'Menu',
    group: 'menu-badges',
  },
  '1cb6451': {
    title: 'Cleaner Product Badges on Mobile',
    description: 'Menu badges now dynamically adapt on mobile screens without obstructing food photography or product pricing.',
    category: 'improved',
    area: 'Menu',
    group: 'menu-badges',
  },
  '11e979d': {
    title: 'Sticky Receipt Preview & Template Headers',
    description: 'Receipt template preview and customization controls now remain seamlessly aligned with zero gap during page scrolling.',
    category: 'fixed',
    area: 'Receipts',
  },
  '9a291fd': {
    title: 'Adaptive POS Menu Grid & Proportions',
    description: 'Menu items now display on a balanced 8/6/4 responsive column grid with uncropped imagery and touch-friendly card targets.',
    category: 'improved',
    area: 'Menu',
  },
  '53467c1': {
    title: 'Native Photo Sharing via Web Share API',
    description: 'Share high-resolution cafe photos directly to WhatsApp and mobile apps using the native device share sheet.',
    category: 'new',
    area: 'Gallery',
  },
  'fc744e1': {
    title: 'Optimistic UI Updates for Reviews & Gallery',
    description: 'Review submissions and gallery uploads reflect instantly in the admin interface with asynchronous query re-validation.',
    category: 'improved',
    area: 'Reviews',
  },
  'cf65211': {
    title: 'Offline-First Cafe Settings Synchronization',
    description: 'Cafe configuration updates sync automatically with local IndexedDB snapshots for instant startup in offline mode.',
    category: 'improved',
    area: 'Settings',
  },
  '9af978d': {
    title: 'Zero-Crash Hidden Browser Printing',
    description: 'Integrated isolated printing frames to prevent popup blockers and page freezes during browser printing operations.',
    category: 'fixed',
    area: 'Printer',
  },
  '421d485': {
    title: 'Configurable GST Tax Default Rate',
    description: 'Default cafe tax percentage set cleanly to zero with full support for optional regional GST configuration in settings.',
    category: 'improved',
    area: 'Settings',
  },
};
