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
  PlusSignIcon,
  RefreshIcon,
} from '@hugeicons/core-free-icons';
import type { MenuItem } from '../../../types';

interface MenuItemTableProps {
  items: MenuItem[];
  onEdit: (item: MenuItem) => void;
  onDuplicate: (item: MenuItem) => void;
  onToggleAvailability: (item: MenuItem, available: boolean) => void;
  onToggleSpecial: (item: MenuItem, isSpecial: boolean) => void;
  onDelete: (item: MenuItem) => void;
  onAddNew: () => void;
  onResetFilters: () => void;
  isFiltered: boolean;
}

export function MenuItemTable({
  items,
  onEdit,
  onDuplicate,
  onToggleAvailability,
  onToggleSpecial,
  onDelete,
  onAddNew,
  onResetFilters,
  isFiltered,
}: MenuItemTableProps) {
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const todayStr = new Date().toISOString().split('T')[0];

  const handleImageError = (id: string) => {
    setImgErrors((prev) => ({ ...prev, [id]: true }));
  };

  if (items.length === 0) {
    return (
      <div className="p-8 sm:p-12 text-center rounded-xl border border-dashed border-border/80 bg-card space-y-4">
        <div className="w-14 h-14 rounded-full bg-cinnamon/10 text-cinnamon flex items-center justify-center mx-auto border border-cinnamon/20 shadow-2xs">
          <HugeiconsIcon icon={Coffee02Icon} size={28} />
        </div>
        <div className="space-y-1 max-w-sm mx-auto">
          <h3 className="font-bold text-base text-foreground font-heading">
            {isFiltered ? 'No matching menu items' : 'No menu items yet'}
          </h3>
          <p className="text-xs text-muted-foreground">
            {isFiltered
              ? 'Try modifying your search or clearing active filters to see more products.'
              : 'Add your first RadhaCafe menu item to begin building the operational catalog.'}
          </p>
        </div>
        <div className="flex items-center justify-center gap-2 pt-2">
          {isFiltered ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onResetFilters}
              className="text-xs font-semibold rounded-lg gap-1.5 h-9"
            >
              <HugeiconsIcon icon={RefreshIcon} size={14} />
              <span>Clear Filters</span>
            </Button>
          ) : null}
          <Button
            size="sm"
            onClick={onAddNew}
            className="bg-cinnamon hover:bg-cinnamon/90 text-white font-bold text-xs rounded-lg gap-1.5 h-9 px-4 shadow-sm"
          >
            <HugeiconsIcon icon={PlusSignIcon} size={14} />
            <span>Add Menu Item</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/80 bg-card shadow-2xs overflow-hidden">
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-border/80 bg-secondary/40 text-muted-foreground font-semibold text-[11px] uppercase tracking-wider">
              <th className="py-3 px-4 min-w-[220px]">Item</th>
              <th className="py-3 px-3 min-w-[120px]">Category</th>
              <th className="py-3 px-3 min-w-[90px]">Price</th>
              <th className="py-3 px-3 min-w-[120px] hidden md:table-cell">Tags</th>
              <th className="py-3 px-3 min-w-[110px] hidden lg:table-cell">Badges</th>
              <th className="py-3 px-3 min-w-[100px] text-center">Available</th>
              <th className="py-3 px-4 text-right min-w-[90px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {items.map((item) => {
              const isSpecialToday = Boolean(
                item.daily_special_date && item.daily_special_date === todayStr
              );
              const hasImgErr = Boolean(imgErrors[item.id]);

              return (
                <tr
                  key={item.id}
                  className={`hover:bg-secondary/20 transition-colors ${
                    !item.is_available ? 'opacity-70 bg-secondary/10' : ''
                  }`}
                >
                  {/* Item Image + Title + Description */}
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-lg border border-border/80 bg-secondary/40 overflow-hidden shrink-0">
                        {item.image_url && !hasImgErr ? (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            loading="lazy"
                            onError={() => handleImageError(item.id)}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground/50">
                            <HugeiconsIcon icon={Coffee02Icon} size={18} />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <p className="font-bold text-foreground truncate">{item.name}</p>
                        {item.description ? (
                          <p className="text-[11px] text-muted-foreground truncate max-w-[240px]">
                            {item.description}
                          </p>
                        ) : (
                          <p className="text-[10px] text-muted-foreground/50 italic">No description</p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-2.5 px-3">
                    <Badge variant="outline" className="text-[10px] font-semibold bg-secondary/50 border-border/70 text-foreground">
                      {item.category?.name || 'Uncategorized'}
                    </Badge>
                  </td>

                  {/* Price */}
                  <td className="py-2.5 px-3">
                    <span className="font-bold font-mono text-foreground text-xs sm:text-sm">
                      {formatCurrency(item.price)}
                    </span>
                  </td>

                  {/* Tags */}
                  <td className="py-2.5 px-3 hidden md:table-cell">
                    <div className="flex items-center gap-1 flex-wrap max-w-[140px]">
                      {(item.tags || []).slice(0, 2).map((t, idx) => (
                        <span
                          key={idx}
                          className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-secondary text-muted-foreground"
                        >
                          {t}
                        </span>
                      ))}
                      {(item.tags || []).length > 2 && (
                        <span className="text-[9px] text-muted-foreground font-semibold">
                          +{(item.tags || []).length - 2}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Badges */}
                  <td className="py-2.5 px-3 hidden lg:table-cell">
                    <div className="flex items-center gap-1 flex-wrap">
                      {isSpecialToday && (
                        <Badge className="bg-amber-600/90 text-white text-[9px] px-1.5 py-0.5 rounded gap-0.5 font-semibold">
                          <HugeiconsIcon icon={StarIcon} size={10} />
                          <span>Special</span>
                        </Badge>
                      )}
                      {item.is_best_seller && (
                        <Badge className="bg-cinnamon/90 text-white text-[9px] px-1.5 py-0.5 rounded gap-0.5 font-semibold">
                          <HugeiconsIcon icon={FireIcon} size={10} />
                          <span>Best Seller</span>
                        </Badge>
                      )}
                      {!isSpecialToday && !item.is_best_seller && (
                        <span className="text-[10px] text-muted-foreground/60">—</span>
                      )}
                    </div>
                  </td>

                  {/* Availability Toggle */}
                  <td className="py-2.5 px-3 text-center">
                    <div className="flex justify-center">
                      <Switch
                        checked={item.is_available}
                        onCheckedChange={(checked: boolean) => onToggleAvailability(item, checked)}
                        aria-label={`Toggle availability for ${item.name}`}
                        className="scale-80 data-[state=checked]:bg-emerald-600"
                      />
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-2.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => onEdit(item)}
                        className="h-7 px-2 text-xs font-semibold rounded-md border-border/80"
                      >
                        <HugeiconsIcon icon={Edit01Icon} size={12} />
                        <span className="hidden sm:inline ml-1">Edit</span>
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              size="xs"
                              variant="ghost"
                              className="h-7 w-7 p-0 rounded-md text-muted-foreground hover:text-foreground"
                              aria-label="More actions"
                            />
                          }
                        >
                          <HugeiconsIcon icon={MoreVerticalIcon} size={13} />
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
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
