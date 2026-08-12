import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { menuItemSchema, type MenuItemFormData } from '../../../lib/validators/menuItemSchema';
import { useCategories } from '../../../hooks/useCategories';
import { useCreateMenuItem, useUpdateMenuItem } from '../../../hooks/useMenuItems';
import type { MenuItem } from '../../../types';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Switch } from '../../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { ItemImageUpload } from './ItemImageUpload';
import { HugeiconsIcon } from '@hugeicons/react';
import { Coffee02Icon, Tag01Icon, Invoice01Icon, Image01Icon, ToggleOffIcon } from '@hugeicons/core-free-icons';

interface MenuItemFormProps {
  initialData?: MenuItem | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function MenuItemForm({ initialData, onSuccess, onCancel }: MenuItemFormProps) {
  const { data: categories } = useCategories();
  const createMutation = useCreateMenuItem();
  const updateMutation = useUpdateMenuItem();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<MenuItemFormData>({
    resolver: zodResolver(menuItemSchema) as any,
    defaultValues: {
      is_available: true,
      description: null,
      image_url: null,
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        description: initialData.description || null,
        price: initialData.price,
        category_id: initialData.category_id || '',
        is_available: initialData.is_available,
        image_url: initialData.image_url || null,
      });
    } else {
      reset({
        name: '',
        description: null,
        price: undefined,
        category_id: categories?.[0]?.id || '',
        is_available: true,
        image_url: null,
      });
    }
  }, [initialData, categories, reset]);

  const selectedCategory = watch('category_id');

  const onSubmit = async (data: MenuItemFormData) => {
    try {
      setErrorMsg(null);
      const payload = {
        name: data.name.trim(),
        description: data.description ? data.description.trim() : null,
        price: data.price,
        category_id: data.category_id,
        image_url: data.image_url || null,
        is_available: data.is_available,
      };

      if (initialData) {
        await updateMutation.mutateAsync({ id: initialData.id, input: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to save menu item. Please try again.');
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-xs">
      {errorMsg && (
        <div className="p-3.5 rounded-md bg-destructive/15 text-destructive border border-destructive/30 font-semibold leading-relaxed">
          {errorMsg}
        </div>
      )}

      {/* 2-Column Responsive Form Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Left Column: Basic Information & Availability */}
        <div className="space-y-5">
          {/* Basic Information Section */}
          <div className="space-y-4 p-5 rounded-md bg-secondary/40 border border-border/60">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <HugeiconsIcon icon={Coffee02Icon} size={15} className="text-primary" />
              <span>BASIC INFORMATION</span>
            </div>

            <div className="space-y-4">
              {/* Item Name */}
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-bold text-foreground">
                  Item Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g. Artisanal Cappuccino"
                  className="h-10 text-xs bg-background rounded-md"
                  {...register('name')}
                />
                {errors.name && <p className="text-destructive font-semibold text-[11px]">{errors.name.message}</p>}
              </div>

              {/* Category Assignment */}
              <div className="space-y-1.5">
                <Label htmlFor="category_id" className="text-xs font-bold text-foreground">
                  Category Assignment <span className="text-destructive">*</span>
                </Label>
                {categories && categories.length > 0 ? (
                  <Select
                    value={selectedCategory || ''}
                    onValueChange={(val: string | null) => setValue('category_id', val || '', { shouldValidate: true })}
                  >
                    <SelectTrigger className="w-full h-10 text-xs bg-background rounded-md">
                      <SelectValue placeholder="Select Category">
                        {categories.find((c) => c.id === selectedCategory)?.name || 'Select Category'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent side="bottom" alignItemWithTrigger={false}>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          <span className="flex items-center gap-2">
                            <HugeiconsIcon icon={Tag01Icon} size={14} className="text-primary" />
                            <span>{c.name}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="p-3 rounded-md border border-amber-500/30 bg-amber-500/10 text-amber-600 text-xs">
                    No categories available. Please create a category in Category Management first.
                  </div>
                )}
                {errors.category_id && (
                  <p className="text-destructive font-semibold text-[11px]">{errors.category_id.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label htmlFor="desc" className="text-xs font-bold text-foreground">
                  Description (Optional)
                </Label>
                <Textarea
                  id="desc"
                  rows={3}
                  placeholder="Rich espresso with steamed velvety milk foam..."
                  className="text-xs bg-background rounded-md resize-none"
                  {...register('description')}
                />
              </div>
            </div>
          </div>

          {/* Availability Toggle Section */}
          <div className="flex items-center justify-between p-4.5 rounded-md bg-secondary/40 border border-border/60">
            <div className="space-y-0.5 pr-2">
              <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                <HugeiconsIcon icon={ToggleOffIcon} size={16} className="text-primary" />
                <span>Available for Order</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                When disabled, this item is hidden from POS & Public menu.
              </p>
            </div>
            <Switch
              id="available"
              checked={watch('is_available')}
              onCheckedChange={(c) => setValue('is_available', c)}
            />
          </div>
        </div>

        {/* Right Column: Pricing & Item Image */}
        <div className="space-y-5">
          {/* Pricing Section */}
          <div className="space-y-3 p-5 rounded-md bg-secondary/40 border border-border/60">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <HugeiconsIcon icon={Invoice01Icon} size={15} className="text-primary" />
              <span>PRICING</span>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="price" className="text-xs font-bold text-foreground">
                Unit Price (₹) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="180.00"
                className="h-10 text-xs bg-background rounded-md w-full"
                {...register('price', { valueAsNumber: true })}
              />
              {errors.price && <p className="text-destructive font-semibold text-[11px]">{errors.price.message}</p>}
            </div>
          </div>

          {/* Item Image Section */}
          <div className="space-y-3 p-5 rounded-md bg-secondary/40 border border-border/60">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <HugeiconsIcon icon={Image01Icon} size={15} className="text-primary" />
              <span>ITEM IMAGE</span>
            </div>

            <ItemImageUpload
              imageUrl={watch('image_url') || undefined}
              onUploadComplete={(url) => setValue('image_url', url)}
              onRemoveImage={() => setValue('image_url', null)}
            />
          </div>
        </div>
      </div>

      {/* Form Action Controls */}
      <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 pt-4 border-t border-border/80">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="h-10 px-5 text-xs font-semibold rounded-md"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-10 px-6 bg-cinnamon hover:bg-cinnamon/90 text-white font-bold text-xs rounded-md shadow-md transition-all"
        >
          {isSubmitting ? 'Saving Item...' : initialData ? 'Update Menu Item' : 'Create Menu Item'}
        </Button>
      </div>
    </form>
  );
}
