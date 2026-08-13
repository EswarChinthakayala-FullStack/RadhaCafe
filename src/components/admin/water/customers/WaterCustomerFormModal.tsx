import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { waterCustomerSchema, type WaterCustomerFormData } from '../../../../validators/waterSchema';
import { useCreateWaterCustomer } from '../../../../hooks/useWaterCustomers';
import type { WaterCustomer } from '../../../../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../ui/dialog';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Textarea } from '../../../ui/textarea';
import { HugeiconsIcon } from '@hugeicons/react';
import { UserAdd01Icon, UserIcon, SmartPhoneIcon, Location01Icon } from '@hugeicons/core-free-icons';
import { toast } from '../../../ui/toast';

interface WaterCustomerFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (createdCustomer: WaterCustomer) => void;
}

export function WaterCustomerFormModal({ open, onOpenChange, onSuccess }: WaterCustomerFormModalProps) {
  const createCustomerMutation = useCreateWaterCustomer();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<WaterCustomerFormData>({
    resolver: zodResolver(waterCustomerSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      address: '',
      notes: '',
    },
  });

  const onSubmit = async (data: WaterCustomerFormData) => {
    setErrorMsg(null);
    try {
      const customer = await createCustomerMutation.mutateAsync({
        name: data.name.trim(),
        phone: data.phone.trim(),
        email: data.email?.trim() || null,
        address: data.address?.trim() || null,
        notes: data.notes?.trim() || null,
      });

      toast.add({
        title: 'Water Customer Profile Created',
        description: `Customer profile for ${customer.name} created successfully.`,
        type: 'success',
      });

      reset();
      onOpenChange(false);
      if (onSuccess) onSuccess(customer);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create water customer profile.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border border-border/80 rounded-md p-6 shadow-2xl space-y-4">
        <DialogHeader className="space-y-1 text-left">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 flex items-center justify-center mb-2 shadow-2xs">
            <HugeiconsIcon icon={UserAdd01Icon} size={20} />
          </div>
          <DialogTitle className="text-xl font-bold font-heading text-foreground">
            Create Water Customer Profile
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Add a customer profile specifically for RadhaWater delivery & Pay-Later tracking.
          </DialogDescription>
        </DialogHeader>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 pt-1">
          {/* Customer Name */}
          <div className="space-y-1.5">
            <Label htmlFor="w-cust-name" className="text-xs font-semibold flex items-center gap-1.5">
              <HugeiconsIcon icon={UserIcon} size={14} className="text-sky-500" />
              <span>Customer Name *</span>
            </Label>
            <Input
              id="w-cust-name"
              placeholder="e.g. Ananya Rao"
              {...register('name')}
              className="h-10 text-xs bg-background rounded-md"
            />
            {errors.name && (
              <p className="text-[11px] text-destructive font-medium">{errors.name.message}</p>
            )}
          </div>

          {/* Phone Number */}
          <div className="space-y-1.5">
            <Label htmlFor="w-cust-phone" className="text-xs font-semibold flex items-center gap-1.5">
              <HugeiconsIcon icon={SmartPhoneIcon} size={14} className="text-sky-500" />
              <span>Phone Number *</span>
            </Label>
            <Input
              id="w-cust-phone"
              type="tel"
              placeholder="e.g. 9876543210"
              {...register('phone')}
              className="h-10 text-xs bg-background rounded-md"
            />
            {errors.phone && (
              <p className="text-[11px] text-destructive font-medium">{errors.phone.message}</p>
            )}
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <Label htmlFor="w-cust-addr" className="text-xs font-semibold flex items-center gap-1.5">
              <HugeiconsIcon icon={Location01Icon} size={14} className="text-sky-500" />
              <span>Delivery Address (Optional)</span>
            </Label>
            <Input
              id="w-cust-addr"
              placeholder="e.g. Door 4-12, Main Road, Tallur"
              {...register('address')}
              className="h-10 text-xs bg-background rounded-md"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="w-cust-notes" className="text-xs font-semibold">
              Notes (Optional)
            </Label>
            <Textarea
              id="w-cust-notes"
              placeholder="e.g. Prefers morning delivery around 9 AM"
              rows={2}
              {...register('notes')}
              className="text-xs bg-background rounded-md resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-9 text-xs rounded-md"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || createCustomerMutation.isPending}
              className="h-9 text-xs bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-md shadow-xs"
            >
              {isSubmitting || createCustomerMutation.isPending ? 'Saving...' : 'Create Customer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
