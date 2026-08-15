import { useState, useMemo } from 'react';
import { SETTINGS_CATEGORIES, type SettingsSectionKey } from './SettingsSidebar';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Search01Icon,
  ArrowRight01Icon,
  Cancel01Icon,
} from '@hugeicons/core-free-icons';

interface SettingsMobileHomeProps {
  onSelectCategory: (key: SettingsSectionKey) => void;
  onClose: () => void;
  printerConnected?: boolean;
}

export function SettingsMobileHome({
  onSelectCategory,
  onClose,
  printerConnected,
}: SettingsMobileHomeProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');

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
    <div className="flex h-full flex-col overflow-y-auto p-4 pb-[max(1rem,env(safe-area-inset-bottom))] space-y-4">
      {/* Mobile Top Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-border/70">
        <div>
          <h2 className="text-xl font-bold font-heading text-foreground">
            Settings
          </h2>
          <p className="text-xs text-muted-foreground">
            RadhaCafe Admin Center
          </p>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8.5 w-8.5 p-0 rounded-full hover:bg-secondary text-muted-foreground"
          aria-label="Close Settings"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={18} />
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <HugeiconsIcon
          icon={Search01Icon}
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search settings..."
          className="h-10 pl-9 text-xs rounded-xl bg-background border-border/80"
        />
      </div>

      {/* Mobile Category List */}
      <div className="divide-y divide-border/60 rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
        {filteredCategories.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">
            No settings found matching "{searchQuery}"
          </div>
        ) : (
          filteredCategories.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => onSelectCategory(cat.key)}
              aria-label={`Open ${cat.label} settings`}
              className="w-full text-left p-3.5 flex items-center justify-between gap-3 hover:bg-secondary/40 active:bg-secondary transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-xl bg-cinnamon/10 text-cinnamon border border-cinnamon/20 shrink-0">
                  <HugeiconsIcon icon={cat.icon} size={18} />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <span className="font-bold text-xs text-foreground block truncate">
                    {cat.label}
                  </span>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {cat.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {cat.key === 'printer' && printerConnected !== undefined && (
                  <Badge
                    variant="outline"
                    className={`text-[9px] font-mono px-1.5 py-0 h-4 ${
                      printerConnected
                        ? 'text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                        : 'text-muted-foreground border-border/80'
                    }`}
                  >
                    {printerConnected ? 'Online' : 'Offline'}
                  </Badge>
                )}

                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  size={15}
                  className="text-muted-foreground/60"
                />
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
