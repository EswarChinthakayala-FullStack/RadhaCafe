import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { waterProductSchema, type WaterProductFormData } from '../../../validators/waterSchema';
import {
  useWaterProducts,
  useCreateWaterProduct,
  useUpdateWaterProduct,
} from '../../../hooks/useWaterProducts';
import { formatCurrency } from '../../../lib/utils/formatCurrency';
import type { WaterProduct } from '../../../types';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent } from '../../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../components/ui/dialog';
import { Skeleton } from '../../../components/ui/skeleton';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  DropletIcon,
  PlusSignIcon,
  PencilEdit01Icon,
  AlertCircleIcon,
} from '@hugeicons/core-free-icons';
import { toast } from '../../../components/ui/toast';

export function WaterProductsPage() {
  const { data: products, isLoading, isError, error } = useWaterProducts(false);
  const createProductMutation = useCreateWaterProduct();
  const updateProductMutation = useUpdateWaterProduct();

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<WaterProduct | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<WaterProductFormData>({
    resolver: zodResolver(waterProductSchema),
    defaultValues: {
      name: '',
      water_type: 'normal',
      unit_name: 'can',
      price: 5,
      description: '',
      is_available: true,
    },
  });

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    reset({
      name: '',
      water_type: 'normal',
      unit_name: 'can',
      price: 5,
      description: '',
      is_available: true,
    });
    setFormError(null);
    setShowFormModal(true);
  };

  const handleOpenEditModal = (prod: WaterProduct) => {
    setEditingProduct(prod);
    reset({
      name: prod.name,
      water_type: prod.water_type,
      unit_name: prod.unit_name,
      price: Number(prod.price),
      description: prod.description || '',
      is_available: prod.is_available,
    });
    setFormError(null);
    setShowFormModal(true);
  };

  const onSubmit = async (data: WaterProductFormData) => {
    setFormError(null);
    try {
      if (editingProduct) {
        await updateProductMutation.mutateAsync({
          id: editingProduct.id,
          payload: {
            name: data.name,
            water_type: data.water_type,
            unit_name: data.unit_name,
            price: data.price,
            description: data.description || null,
            is_available: data.is_available,
          },
        });
        toast.add({
          title: 'Product Updated',
          description: `Successfully updated ${data.name}.`,
          type: 'success',
        });
      } else {
        await createProductMutation.mutateAsync({
          name: data.name,
          water_type: data.water_type,
          unit_name: data.unit_name,
          price: data.price,
          description: data.description || null,
          is_available: data.is_available,
        });
        toast.add({
          title: 'Water Product Added',
          description: `Successfully created ${data.name}.`,
          type: 'success',
        });
      }
      setShowFormModal(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save water product.');
    }
  };

  const handleToggleAvailability = async (prod: WaterProduct) => {
    try {
      await updateProductMutation.mutateAsync({
        id: prod.id,
        payload: { is_available: !prod.is_available },
      });
      toast.add({
        title: 'Availability Changed',
        description: `${prod.name} is now ${!prod.is_available ? 'Available' : 'Unavailable'}.`,
        type: 'info',
      });
    } catch (err: any) {
      toast.add({
        title: 'Update Error',
        description: err.message || 'Failed to toggle availability.',
        type: 'error',
      });
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4 sm:pb-5">
        <div>
          <h2 className="text-2xl font-bold font-heading text-foreground flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 shrink-0 border border-sky-500/20 shadow-2xs">
              <HugeiconsIcon icon={DropletIcon} size={22} />
            </div>
            <span>Water Products & Pricing</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Manage 20L water cans catalog, database-driven prices (Normal ₹5, Cooling ₹30), and availability.
          </p>
        </div>

        <Button
          onClick={handleOpenAddModal}
          className="bg-sky-600 hover:bg-sky-700 text-white font-bold h-10 text-xs px-4 rounded-md shadow-xs gap-2 shrink-0 self-start sm:self-auto"
        >
          <HugeiconsIcon icon={PlusSignIcon} size={16} />
          <span>Add Water Product</span>
        </Button>
      </div>

      {/* Product Cards List */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-44 rounded-md" />
          ))}
        </div>
      ) : isError ? (
        <div className="p-8 text-center bg-card rounded-md border border-destructive/20 text-destructive space-y-2 text-xs">
          <HugeiconsIcon icon={AlertCircleIcon} className="mx-auto w-8 h-8" />
          <p className="font-bold">Failed to load water products</p>
          <p className="text-muted-foreground">{(error as any)?.message}</p>
        </div>
      ) : !products || products.length === 0 ? (
        <div className="p-12 text-center bg-card rounded-md border border-dashed border-border/80 space-y-3">
          <HugeiconsIcon icon={DropletIcon} className="mx-auto w-10 h-10 text-muted-foreground/40" />
          <p className="font-bold text-sm text-foreground">No water products in database</p>
          <Button
            size="sm"
            onClick={handleOpenAddModal}
            className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs gap-1.5 h-9 rounded-md shadow-xs"
          >
            <HugeiconsIcon icon={PlusSignIcon} size={15} />
            <span>Create First Product</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {products.map((prod) => {
            const isCooling = prod.water_type === 'cooling';
            return (
              <Card
                key={prod.id}
                className={
                  prod.is_available
                    ? 'border border-border/80 bg-card rounded-md shadow-2xs hover:border-sky-500/40 transition-all'
                    : 'border border-border/50 bg-secondary/20 rounded-md opacity-75'
                }
              >
                <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-base text-foreground font-heading">{prod.name}</h3>
                      <Badge
                        variant={prod.is_available ? 'default' : 'outline'}
                        className={
                          prod.is_available
                            ? isCooling
                              ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30 text-[10px] uppercase font-bold'
                              : 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30 text-[10px] uppercase font-bold'
                            : 'text-muted-foreground text-[10px] uppercase'
                        }
                      >
                        {prod.water_type} • {prod.unit_name}
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {prod.description || '20 Litre drinking water can'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border/50">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold">Database Price</p>
                      <p className="text-xl font-bold font-heading text-sky-600 dark:text-sky-400">
                        {formatCurrency(prod.price)}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Button
                        size="xs"
                        variant={prod.is_available ? 'outline' : 'secondary'}
                        onClick={() => handleToggleAvailability(prod)}
                        className="h-8 text-[11px] font-semibold rounded-md"
                      >
                        {prod.is_available ? 'Make Unavailable' : 'Make Available'}
                      </Button>
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => handleOpenEditModal(prod)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground rounded-md"
                      >
                        <HugeiconsIcon icon={PencilEdit01Icon} size={14} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add / Edit Product Modal */}
      <Dialog open={showFormModal} onOpenChange={setShowFormModal}>
        <DialogContent className="max-w-md bg-card border border-border/80 rounded-md p-6 shadow-2xl space-y-4">
          <DialogHeader className="space-y-1 text-left">
            <DialogTitle className="text-xl font-bold font-heading text-foreground">
              {editingProduct ? 'Edit Water Product' : 'Add Water Product'}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Configure product details, database-driven price, and stock availability.
            </DialogDescription>
          </DialogHeader>

          {formError && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 text-xs font-medium">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="wp-name" className="text-xs font-semibold">Product Name *</Label>
              <Input
                id="wp-name"
                placeholder="e.g. RadhaWater Normal 20L Can"
                {...register('name')}
                className="h-10 text-xs bg-background rounded-md"
              />
              {errors.name && (
                <p className="text-[11px] text-destructive font-medium">{errors.name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="wp-type" className="text-xs font-semibold">Water Type *</Label>
                <select
                  id="wp-type"
                  {...register('water_type')}
                  className="w-full h-10 text-xs bg-background border border-input rounded-md px-3 font-semibold"
                >
                  <option value="normal">Normal Water (₹5)</option>
                  <option value="cooling">Cooling Water (₹30)</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="wp-unit" className="text-xs font-semibold">Unit *</Label>
                <select
                  id="wp-unit"
                  {...register('unit_name')}
                  className="w-full h-10 text-xs bg-background border border-input rounded-md px-3 font-semibold"
                >
                  <option value="can">20L Can</option>
                  <option value="jar">Jar</option>
                  <option value="bottle">Bottle</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="wp-price" className="text-xs font-semibold">Database Unit Price (₹) *</Label>
              <Input
                id="wp-price"
                type="number"
                step="0.50"
                min="0"
                {...register('price', { valueAsNumber: true })}
                className="h-10 text-xs bg-background rounded-md font-bold"
              />
              {errors.price && (
                <p className="text-[11px] text-destructive font-medium">{errors.price.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="wp-desc" className="text-xs font-semibold">Description (Optional)</Label>
              <Textarea
                id="wp-desc"
                placeholder="e.g. Pure & fresh 20 Litre drinking water can"
                rows={2}
                {...register('description')}
                className="text-xs bg-background rounded-md resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowFormModal(false)}
                className="h-9 text-xs rounded-md"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting || createProductMutation.isPending || updateProductMutation.isPending}
                className="h-9 text-xs bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-md shadow-xs"
              >
                {isSubmitting ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
