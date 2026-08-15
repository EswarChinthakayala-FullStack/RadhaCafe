import { useState } from 'react';
import { formatCurrency } from '../../../lib/utils/formatCurrency';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Switch } from '../../ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Edit01Icon,
  Copy01Icon,
  StarIcon,
  Delete02Icon,
  MoreVerticalIcon,
  Coffee02Icon,
  FireIcon,
  Award01Icon,
} from '@hugeicons/core-free-icons';
import type { MenuItem } from '../../../types';

interface MenuItemCardProps {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  onDuplicate: (item: MenuItem) => void;
  onToggleAvailability: (item: MenuItem, available: boolean) => void;
  onToggleSpecial: (item: MenuItem, isSpecial: boolean) => void;
  onDelete: (item: MenuItem) => void;
}

export function MenuItemCard({
  item,
  onEdit,
  onDuplicate,
  onToggleAvailability,
  onToggleSpecial,
  onDelete,
}: MenuItemCardProps) {
  const [imgError, setImgError] = useState(false);
  const todayStr = new Date().toISOString().split('T')[0];
  const isSpecialToday = Boolean(item.daily_special_date && item.daily_special_date === todayStr);

  const displayTags = (item.tags || []).slice(0, 2);
  const extraTagsCount = Math.max(0, (item.tags || []).length - 2);

  return (
    <div
      className={`group rounded-xl border bg-card shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden relative ${
        !item.is_available
          ? 'opacity-80 border-dashed border-border/90 bg-secondary/15'
          : 'border-border/80 hover:border-cinnamon/40'
      }`}
    >
      {/* Top Image Section */}
      <div className="relative aspect-4/3 w-full bg-white border-b border-border/40 overflow-hidden shrink-0 flex items-center justify-center p-1.5">
        {item.image_url && !imgError ? (
          <img
            src={item.image_url}
            alt={item.name}
            loading="lazy"
            onError={() => setImgError(true)}
            className={`w-full h-full object-contain ${
              !item.is_available ? 'grayscale-[50%] contrast-[90%]' : ''
            }`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/50 bg-secondary/30">
            <HugeiconsIcon icon={Coffee02Icon} size={28} />
            <span className="text-[10px] font-semibold mt-1">RadhaCafe</span>
          </div>
        )}

        {/* Badges Overlay */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {!item.is_available && (
            <Badge className="bg-destructive/90 text-white font-bold text-[10px] px-2 py-0.5 shadow-xs uppercase tracking-wider backdrop-blur-xs">
              Unavailable
            </Badge>
          )}
          {isSpecialToday && (
            <Badge className="bg-amber-600 text-white font-bold text-[10px] px-2 py-0.5 shadow-xs flex items-center gap-1 backdrop-blur-xs">
              <HugeiconsIcon icon={StarIcon} size={11} />
              <span>Today's Special</span>
            </Badge>
          )}
          {item.is_best_seller && (
            <Badge className="bg-orange-600 text-white font-bold text-[10px] px-2 py-0.5 shadow-xs flex items-center gap-1 backdrop-blur-xs">
              <HugeiconsIcon icon={Award01Icon} size={11} />
              <span>Best Seller</span>
            </Badge>
          )}
          {!item.is_best_seller && item.tags?.includes('popular') && (
            <Badge className="bg-cinnamon text-white font-bold text-[10px] px-2 py-0.5 shadow-xs flex items-center gap-1 backdrop-blur-xs">
              <HugeiconsIcon icon={FireIcon} size={11} />
              <span>Popular</span>
            </Badge>
          )}
        </div>

        {/* Quick Availability Switch in Header */}
        <div className="absolute top-2 right-2 z-10 bg-background/80 backdrop-blur-md p-1.5 rounded-lg shadow-xs border border-border/60 flex items-center gap-1.5">
          <Switch
            checked={item.is_available}
            onCheckedChange={(checked: boolean) => onToggleAvailability(item, checked)}
            aria-label={`Toggle availability for ${item.name}`}
            className="scale-75 origin-right data-[state=checked]:bg-emerald-600"
          />
        </div>
      </div>

      {/* Card Content */}
      <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
        <div className="space-y-1">
          {/* Category & Tags Row */}
          <div className="flex items-center justify-between gap-1 flex-wrap">
            <span className="text-[10px] font-bold text-cinnamon uppercase tracking-wider">
              {item.category?.name || 'Uncategorized'}
            </span>
            {displayTags.length > 0 && (
              <div className="flex items-center gap-1">
                {displayTags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-secondary text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
                {extraTagsCount > 0 && (
                  <span className="text-[9px] font-semibold text-muted-foreground">
                    +{extraTagsCount}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Item Name */}
          <h3 className="font-bold text-sm text-foreground line-clamp-1 group-hover:text-cinnamon transition-colors">
            {item.name}
          </h3>

          {/* Description */}
          {item.description ? (
            <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed min-h-[30px]">
              {item.description}
            </p>
          ) : (
            <p className="text-[11px] text-muted-foreground/50 italic min-h-[30px]">
              No description added.
            </p>
          )}
        </div>

        {/* Bottom Row: Price & Actions */}
        <div className="pt-2 border-t border-border/60 flex items-center justify-between gap-2">
          <div>
            <span className="text-xs text-muted-foreground block text-[10px] font-medium leading-none">Price</span>
            <span className="font-bold text-sm sm:text-base font-mono text-foreground">
              {formatCurrency(item.price)}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              size="xs"
              variant="outline"
              onClick={() => onEdit(item)}
              className="h-8 px-2.5 text-xs font-semibold rounded-lg gap-1 border-border/80 hover:bg-secondary"
            >
              <HugeiconsIcon icon={Edit01Icon} size={13} />
              <span>Edit</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    size="xs"
                    variant="ghost"
                    className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-foreground"
                    aria-label="More item actions"
                  />
                }
              >
                <HugeiconsIcon icon={MoreVerticalIcon} size={14} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 text-xs">
                <DropdownMenuItem onClick={() => onDuplicate(item)} className="gap-2 cursor-pointer">
                  <HugeiconsIcon icon={Copy01Icon} size={14} />
                  <span>Duplicate Item</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onToggleSpecial(item, !isSpecialToday)}
                  className="gap-2 cursor-pointer"
                >
                  <HugeiconsIcon icon={StarIcon} size={14} className="text-amber-600" />
                  <span>{isSpecialToday ? 'Remove Special' : "Set Today's Special"}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(item)}
                  className="gap-2 text-destructive cursor-pointer focus:text-destructive focus:bg-destructive/10"
                >
                  <HugeiconsIcon icon={Delete02Icon} size={14} />
                  <span>Delete Item</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}
