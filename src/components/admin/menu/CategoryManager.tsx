import { useState } from 'react';
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useReorderCategories,
} from '../../../hooks/useCategories';
import { useMenuItems } from '../../../hooks/useMenuItems';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../ui/alert-dialog';
import { Label } from '../../ui/label';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Folder01Icon,
  PlusSignIcon,
  Edit01Icon,
  Delete02Icon,
  ArrowUp01Icon,
  ArrowDown01Icon,
  Coffee02Icon,
  BubbleTeaIcon,
  DrinkIcon,
  GlassWaterIcon,
  CupSodaIcon,
  CakeIcon,
  CookieIcon,
  Bread01Icon,
  Dish01Icon,
  RiceBowl01Icon,
  Pizza01Icon,
  Hamburger01Icon,
  Tag01Icon,
  PackageIcon,
  GridIcon,
} from '@hugeicons/core-free-icons';
import type { Category } from '../../../types';

// Predefined safe HugeIcons mapping for categories
const CATEGORY_ICONS = [
  { key: 'Coffee02Icon', label: 'Coffee', icon: Coffee02Icon },
  { key: 'BubbleTeaIcon', label: 'Tea & Chai', icon: BubbleTeaIcon },
  { key: 'DrinkIcon', label: 'Milk & Drinks', icon: DrinkIcon },
  { key: 'GlassWaterIcon', label: 'Pure Water', icon: GlassWaterIcon },
  { key: 'CupSodaIcon', label: 'Cold Drinks', icon: CupSodaIcon },
  { key: 'CakeIcon', label: 'Pastry & Dessert', icon: CakeIcon },
  { key: 'CookieIcon', label: 'Cookies & Bakery', icon: CookieIcon },
  { key: 'Bread01Icon', label: 'Breads & Toast', icon: Bread01Icon },
  { key: 'Dish01Icon', label: 'Main Dishes', icon: Dish01Icon },
  { key: 'RiceBowl01Icon', label: 'Rice & Biryani', icon: RiceBowl01Icon },
  { key: 'Pizza01Icon', label: 'Pizza & Pasta', icon: Pizza01Icon },
  { key: 'Hamburger01Icon', label: 'Burgers & Snacks', icon: Hamburger01Icon },
  { key: 'Tag01Icon', label: 'General Tag', icon: Tag01Icon },
  { key: 'PackageIcon', label: 'Package & Goods', icon: PackageIcon },
  { key: 'GridIcon', label: 'Grid Menu', icon: GridIcon },
];

export function CategoryManager() {
  const { data: categories, isLoading: isCategoriesLoading } = useCategories();
  const { data: menuItems } = useMenuItems(false);

  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();
  const reorderMutation = useReorderCategories();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  const [name, setName] = useState('');
  const [selectedIconKey, setSelectedIconKey] = useState<string>('Coffee02Icon');
  const [displayOrder, setDisplayOrder] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Compute category item counts efficiently from existing menu dataset
  const categoryItemCounts = (menuItems || []).reduce<Record<string, number>>((acc, item) => {
    if (item.category_id) {
      acc[item.category_id] = (acc[item.category_id] || 0) + 1;
    }
    return acc;
  }, {});

  const handleOpenAdd = () => {
    setName('');
    setSelectedIconKey('Coffee02Icon');
    setDisplayOrder((categories?.length || 0) + 1);
    setErrorMsg(null);
    setIsAddOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSelectedIconKey(cat.icon || 'Coffee02Icon');
    setDisplayOrder(cat.display_order || 0);
    setErrorMsg(null);
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Category name is required.');
      return;
    }
    try {
      await createMutation.mutateAsync({
        name: name.trim(),
        icon: selectedIconKey,
        display_order: Number(displayOrder),
      });
      setIsAddOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create category.');
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !name.trim()) return;
    try {
      await updateMutation.mutateAsync({
        id: editingCategory.id,
        input: {
          name: name.trim(),
          icon: selectedIconKey,
          display_order: Number(displayOrder),
        },
      });
      setEditingCategory(null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update category.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return;
    try {
      await deleteMutation.mutateAsync(deletingCategory.id);
      setDeletingCategory(null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete category.');
    }
  };

  const handleMoveOrder = async (cat: Category, direction: 'up' | 'down') => {
    if (!categories || categories.length < 2) return;
    const sorted = [...categories].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    const index = sorted.findIndex((c) => c.id === cat.id);
    if (index === -1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;

    const currentCat = sorted[index];
    const swapCat = sorted[targetIndex];

    // Swap display order values
    const newCurrentOrder = swapCat.display_order || targetIndex + 1;
    const newSwapOrder = currentCat.display_order || index + 1;

    try {
      await reorderMutation.mutateAsync([
        { id: currentCat.id, display_order: newCurrentOrder },
        { id: swapCat.id, display_order: newSwapOrder },
      ]);
    } catch (err: any) {
      console.error('Reorder error:', err);
    }
  };

  const renderIconComponent = (iconKey: string | null) => {
    const matched = CATEGORY_ICONS.find((i) => i.key === iconKey) || CATEGORY_ICONS[0];
    return <HugeiconsIcon icon={matched.icon} size={14} className="text-primary shrink-0" />;
  };

  return (
    <div className="p-4 sm:p-5 rounded-md border border-border/80 bg-card space-y-4 shadow-sm">
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-border">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0">
            <HugeiconsIcon icon={Folder01Icon} size={18} />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-sm font-heading text-foreground truncate">Menu Categories</h3>
            <p className="text-[11px] text-muted-foreground line-clamp-1">Organize offerings for POS ordering and menu display.</p>
          </div>
        </div>
        <Button
          size="sm"
          onClick={handleOpenAdd}
          className="bg-cinnamon hover:bg-cinnamon/90 text-white font-bold text-xs gap-1.5 h-9 rounded-md shadow-xs shrink-0"
        >
          <HugeiconsIcon icon={PlusSignIcon} size={15} />
          <span className="hidden xs:inline">Add Category</span>
          <span className="xs:hidden">Add</span>
        </Button>
      </div>

      {/* Category List Cards — Responsive Row Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
        {isCategoriesLoading ? (
          <div className="col-span-full py-4 text-center text-xs text-muted-foreground animate-pulse">
            Loading categories...
          </div>
        ) : categories && categories.length > 0 ? (
          categories.map((cat, index) => {
            const count = categoryItemCounts[cat.id] || 0;
            return (
              <div
                key={cat.id}
                className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-md border border-border/80 bg-secondary/30 hover:bg-secondary/60 text-xs font-semibold text-foreground transition-all shadow-xs group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {renderIconComponent(cat.icon ?? null)}
                  <span className="font-bold truncate text-xs">{cat.name}</span>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 rounded-md font-mono bg-background text-muted-foreground border border-border/50 shrink-0">
                    {count} {count === 1 ? 'item' : 'items'}
                  </Badge>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {/* Display Order Badge */}
                  <span className="text-[10px] font-mono text-muted-foreground/70 mr-1" title="Display Order">
                    #{cat.display_order}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-0.5 pl-1.5 border-l border-border/60">
                    {/* Move Up */}
                    <button
                      type="button"
                      onClick={() => handleMoveOrder(cat, 'up')}
                      disabled={index === 0 || reorderMutation.isPending}
                      className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-background disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      aria-label={`Move ${cat.name} up`}
                      title="Move Up"
                    >
                      <HugeiconsIcon icon={ArrowUp01Icon} size={14} />
                    </button>

                    {/* Move Down */}
                    <button
                      type="button"
                      onClick={() => handleMoveOrder(cat, 'down')}
                      disabled={index === categories.length - 1 || reorderMutation.isPending}
                      className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-background disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      aria-label={`Move ${cat.name} down`}
                      title="Move Down"
                    >
                      <HugeiconsIcon icon={ArrowDown01Icon} size={14} />
                    </button>

                    {/* Edit */}
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(cat)}
                      className="p-1 rounded text-muted-foreground hover:text-primary hover:bg-background transition-colors"
                      aria-label={`Edit ${cat.name}`}
                      title="Edit Category"
                    >
                      <HugeiconsIcon icon={Edit01Icon} size={14} />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => setDeletingCategory(cat)}
                      className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      aria-label={`Delete ${cat.name}`}
                      title="Delete Category"
                    >
                      <HugeiconsIcon icon={Delete02Icon} size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          /* Empty State */
          <div className="w-full p-6 text-center border border-dashed border-border/80 rounded-md bg-secondary/20 space-y-3">
            <div className="w-10 h-10 mx-auto rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <HugeiconsIcon icon={Folder01Icon} size={20} />
            </div>
            <div>
              <h4 className="font-bold text-xs text-foreground">No Categories Yet</h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">Create your first category to organize the menu.</p>
            </div>
            <Button
              size="xs"
              onClick={handleOpenAdd}
              className="bg-cinnamon hover:bg-cinnamon/90 text-white font-bold text-xs gap-1.5 h-8 rounded-lg"
            >
              <HugeiconsIcon icon={PlusSignIcon} size={14} />
              <span>Create Category</span>
            </Button>
          </div>
        )}
      </div>

      {/* Add / Edit Category Dialog */}
      <Dialog open={isAddOpen || !!editingCategory} onOpenChange={(open) => !open && (setIsAddOpen(false), setEditingCategory(null))}>
        <DialogContent className="max-w-md bg-card rounded-md border border-border p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold font-heading text-foreground flex items-center gap-2">
              <HugeiconsIcon icon={Folder01Icon} size={18} className="text-primary" />
              <span>{editingCategory ? 'Edit Category' : 'Create Category'}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Categories help organize menu items for POS ordering and public display.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={editingCategory ? handleSaveEdit : handleSaveAdd} className="space-y-4 text-xs pt-1">
            {errorMsg && (
              <div className="p-3 rounded-md bg-destructive/15 text-destructive border border-destructive/30 font-semibold text-xs leading-relaxed">
                {errorMsg}
              </div>
            )}

            {/* Category Name */}
            <div className="space-y-1.5">
              <Label htmlFor="cat-name" className="font-bold text-foreground">
                Category Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="cat-name"
                placeholder="e.g. Hot Coffees / Artisanal Pastries"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10 text-xs rounded-md"
                required
              />
            </div>

            {/* Category Icon Selector */}
            <div className="space-y-1.5">
              <Label className="font-bold text-foreground">Category Icon</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CATEGORY_ICONS.map((ico) => {
                  const isSelected = selectedIconKey === ico.key;
                  return (
                    <button
                      key={ico.key}
                      type="button"
                      onClick={() => setSelectedIconKey(ico.key)}
                      className={`flex items-center gap-2 p-2 rounded-md border text-xs text-left transition-all ${isSelected
                        ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                        : 'border-border bg-background text-muted-foreground hover:text-foreground hover:bg-secondary/40'
                        }`}
                    >
                      <HugeiconsIcon icon={ico.icon} size={16} className={isSelected ? 'text-primary' : 'text-muted-foreground'} />
                      <span className="truncate text-[11px]">{ico.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Display Order */}
            <div className="space-y-1.5">
              <Label htmlFor="cat-order" className="font-bold text-foreground">Display Order</Label>
              <Input
                id="cat-order"
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(Number(e.target.value))}
                className="h-10 text-xs rounded-md"
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => (setIsAddOpen(false), setEditingCategory(null))}
                className="h-9 px-4 rounded-md text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="h-9 px-5 bg-cinnamon hover:bg-cinnamon/90 text-white font-bold rounded-md shadow-xs"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Category'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={!!deletingCategory} onOpenChange={(open) => !open && setDeletingCategory(null)}>
        <AlertDialogContent className="bg-card rounded-md border border-border p-6 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold font-heading text-foreground">
              Delete Category "{deletingCategory?.name}"?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              Deleting this category will set associated menu items to uncategorized. Existing menu items and historical receipts will remain completely preserved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="h-9 rounded-md text-xs font-semibold">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="h-9 bg-destructive hover:bg-destructive/90 text-white text-xs font-bold rounded-md"
            >
              Delete Category
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
