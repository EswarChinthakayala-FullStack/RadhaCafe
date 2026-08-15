import { useState, useMemo } from 'react';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import { HugeiconsIcon } from '@hugeicons/react';
import type { IconSvgElement } from '@hugeicons/react';
import {
  Settings01Icon,
  Store01Icon,
  MoneyBag02Icon,
  PrinterIcon,
  InvoiceIcon,
  UserIcon,
  InformationCircleIcon,
  Search01Icon,
} from '@hugeicons/core-free-icons';

export type SettingsSectionKey =
  | 'general'
  | 'profile'
  | 'orders'
  | 'printer'
  | 'receipts'
  | 'account'
  | 'about';

export interface SettingsCategoryDef {
  key: SettingsSectionKey;
  label: string;
  description: string;
  icon: IconSvgElement;
  keywords: string[];
}

export const SETTINGS_CATEGORIES: SettingsCategoryDef[] = [
  {
    key: 'general',
    label: 'General',
    description: 'Cafe name, currency, timezone & date formats',
    icon: Settings01Icon,
    keywords: ['name', 'brand', 'currency', 'inr', 'timezone', 'date', 'time', 'format'],
  },
  {
    key: 'profile',
    label: 'Cafe Profile',
    description: 'Logo, tagline, about, address & opening hours',
    icon: Store01Icon,
    keywords: ['logo', 'tagline', 'about', 'address', 'phone', 'email', 'hours', 'contact', 'location'],
  },
  {
    key: 'orders',
    label: 'Orders & Payments',
    description: 'Sales tax percentage & checkout defaults',
    icon: MoneyBag02Icon,
    keywords: ['tax', 'gst', 'payment', 'upi', 'cash', 'card', 'auto-print', 'billing'],
  },
  {
    key: 'printer',
    label: 'Printer',
    description: 'Bluetooth thermal hardware & paper rolls',
    icon: PrinterIcon,
    keywords: ['printer', 'bluetooth', 'thermal', 'paper', '58mm', '80mm', 'hardware', 'test print'],
  },
  {
    key: 'receipts',
    label: 'Receipts',
    description: 'Active receipt layout & design templates',
    icon: InvoiceIcon,
    keywords: ['receipt', 'template', 'preview', 'slip', 'layout', 'design', 'printout'],
  },
  {
    key: 'account',
    label: 'Account & Security',
    description: 'Administrator credentials & sign out',
    icon: UserIcon,
    keywords: ['admin', 'email', 'auth', 'password', 'session', 'security', 'logout', 'sign out'],
  },
  {
    key: 'about',
    label: 'About',
    description: 'Release build & software specifications',
    icon: InformationCircleIcon,
    keywords: ['about', 'version', 'build', 'specs', 'release', 'radhacafe'],
  },
];

interface SettingsSidebarProps {
  activeKey: SettingsSectionKey;
  onSelectKey: (key: SettingsSectionKey) => void;
  printerConnected?: boolean;
}

export function SettingsSidebar({
  activeKey,
  onSelectKey,
  printerConnected,
}: SettingsSidebarProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter categories by label or search keywords
  const filteredCategories = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return SETTINGS_CATEGORIES;
    return SETTINGS_CATEGORIES.filter(
      (cat) =>
        cat.label.toLowerCase().includes(q) ||
        cat.description.toLowerCase().includes(q) ||
        cat.keywords.some((k) => k.includes(q))
    );
  }, [searchQuery]);

  return (
    <div className="flex flex-col h-full bg-secondary/30 border-r border-border/80 p-3 sm:p-4 space-y-3 select-none">
      {/* Sidebar Top Title */}
      <div className="px-2 pt-1 pb-1">
        <h2 className="text-base font-bold font-heading text-foreground tracking-tight">
          Settings
        </h2>
        <p className="text-[11px] text-muted-foreground">
          RadhaCafe Workspace
        </p>
      </div>

      {/* Quick Filter Search */}
      <div className="relative">
        <HugeiconsIcon
          icon={Search01Icon}
          size={13}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search settings..."
          className="h-8 pl-8 text-xs rounded-xl bg-background border-border/70 focus:border-cinnamon"
        />
      </div>

      {/* Nav Items List */}
      <nav className="space-y-1 overflow-y-auto flex-1 pr-1 -mr-1">
        {filteredCategories.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            No settings match "{searchQuery}"
          </div>
        ) : (
          filteredCategories.map((cat) => {
            const isActive = activeKey === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => onSelectKey(cat.key)}
                aria-current={isActive ? 'page' : undefined}
                className={`w-full text-left px-3 py-2 rounded-xl transition-all text-xs font-semibold flex items-center justify-between gap-2.5 ${
                  isActive
                    ? 'bg-card text-foreground border border-border/90 shadow-2xs font-bold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`p-1.5 rounded-lg shrink-0 transition-colors ${
                      isActive
                        ? 'bg-cinnamon/10 text-cinnamon border border-cinnamon/20'
                        : 'text-muted-foreground'
                    }`}
                  >
                    <HugeiconsIcon icon={cat.icon} size={15} />
                  </div>
                  <span className="truncate">{cat.label}</span>
                </div>

                {/* Status Badges on specific items */}
                {cat.key === 'printer' && printerConnected !== undefined && (
                  <Badge
                    variant="outline"
                    className={`text-[9px] font-mono px-1.5 py-0 h-4 shrink-0 ${
                      printerConnected
                        ? 'text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                        : 'text-muted-foreground border-border/80'
                    }`}
                  >
                    {printerConnected ? 'Online' : 'Offline'}
                  </Badge>
                )}
              </button>
            );
          })
        )}
      </nav>
    </div>
  );
}
