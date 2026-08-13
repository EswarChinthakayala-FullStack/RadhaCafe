import { useState } from 'react';
import { MenuItemList } from '../../components/admin/menu/MenuItemList';
import { MenuItemForm } from '../../components/admin/menu/MenuItemForm';
import { CategoryManager } from '../../components/admin/menu/CategoryManager';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { HugeiconsIcon } from '@hugeicons/react';
import { PlusSignIcon, Coffee02Icon, Folder01Icon } from '@hugeicons/core-free-icons';
import type { MenuItem } from '../../types';

export function MenuPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const scrollToCategories = () => {
    const el = document.getElementById('category-manager-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4 sm:pb-5">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold font-heading text-foreground flex items-center gap-3">
            <div className="p-2.5 rounded-md bg-cinnamon/10 text-cinnamon shrink-0 border border-cinnamon/20 shadow-2xs">
              <HugeiconsIcon icon={Coffee02Icon} size={22} />
            </div>
            <span>Menu Management</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Manage categories, menu items, pricing and availability.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2.5 w-full sm:flex sm:w-auto sm:items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={scrollToCategories}
            className="text-xs font-semibold h-10 px-3 sm:px-4 rounded-md gap-1.5 justify-center"
          >
            <HugeiconsIcon icon={Folder01Icon} size={15} />
            <span>Manage Categories</span>
          </Button>
          <Button
            onClick={handleCreate}
            className="bg-cinnamon hover:bg-cinnamon/90 text-white font-bold text-xs gap-1.5 h-10 px-4 sm:px-5 rounded-md shadow-md transition-all justify-center"
          >
            <HugeiconsIcon icon={PlusSignIcon} size={16} />
            <span>Add Menu Item</span>
          </Button>
        </div>
      </div>

      {/* Category Management Section */}
      <div id="category-manager-section">
        <CategoryManager />
      </div>

      {/* Menu Item Catalog Table & Filters */}
      <MenuItemList onEdit={handleEdit} />

      {/* Create / Edit Menu Item Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-4xl max-w-4xl w-full max-h-[90vh] overflow-y-auto no-scrollbar bg-card rounded-md border border-border p-6 sm:p-8 shadow-2xl space-y-6">
          <DialogHeader>
            <DialogTitle className="font-bold text-lg font-heading text-foreground flex items-center gap-2">
              <HugeiconsIcon icon={Coffee02Icon} size={20} className="text-primary" />
              <span>{editingItem ? 'Edit Menu Item' : 'Create New Menu Item'}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Configure product details, category assignment, price, image, and availability status.
            </DialogDescription>
          </DialogHeader>
          <MenuItemForm
            initialData={editingItem}
            onSuccess={() => setIsFormOpen(false)}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
