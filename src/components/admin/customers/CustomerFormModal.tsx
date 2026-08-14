import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { customerSchema, type CustomerFormData } from '../../../validators/customerSchema';
import { useCreateCustomer } from '../../../hooks/useCustomers';
import type { Customer } from '../../../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { HugeiconsIcon } from '@hugeicons/react';
import { UserAdd01Icon, UserIcon, SmartPhoneIcon, NoteIcon } from '@hugeicons/core-free-icons';
import { toast } from '../../ui/toast';

interface CustomerFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (createdCustomer: Customer) => void;
}

export function CustomerFormModal({ open, onOpenChange, onSuccess }: CustomerFormModalProps) {
  const createCustomerMutation = useCreateCustomer();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: '',
      phone: '',
      notes: '',
    },
  });

  const onSubmit = async (data: CustomerFormData) => {
    setErrorMsg(null);
    try {
      const customer = await createCustomerMutation.mutateAsync({
        name: data.name.trim(),
        phone: data.phone.trim(),
        notes: data.notes?.trim() || null,
      });

      toast.add({
        title: 'Customer Added',
        description: `Customer profile for ${customer.name} created successfully.`,
        type: 'success',
      });

      reset();
      onOpenChange(false);
      if (onSuccess) onSuccess(customer);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create customer profile.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-md bg-card border border-border/80 rounded-xl p-4 sm:p-6 shadow-2xl space-y-3 sm:space-y-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-1 text-left">
          <div className="w-10 h-10 rounded-md bg-cinnamon/10 text-cinnamon border border-cinnamon/20 flex items-center justify-center mb-2 shadow-2xs">
            <HugeiconsIcon icon={UserAdd01Icon} size={20} />
          </div>
          <DialogTitle className="text-xl font-bold font-heading text-foreground">
            Create Customer Profile
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Add a new customer for credit / Pay-Later tracking and order history.
          </DialogDescription>
        </DialogHeader>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
          {/* Customer Name */}
          <div className="space-y-1.5">
            <Label htmlFor="cust-name" className="text-xs font-semibold flex items-center gap-1.5">
              <HugeiconsIcon icon={UserIcon} size={14} className="text-cinnamon" />
              <span>Customer Name *</span>
            </Label>
            <Input
              id="cust-name"
              placeholder="e.g. Ramesh Kumar"
              {...register('name')}
              className="h-10 text-xs bg-background rounded-md"
            />
            {errors.name && (
              <p className="text-[11px] text-destructive font-medium">{errors.name.message}</p>
            )}
          </div>

          {/* Phone Number */}
          <div className="space-y-1.5">
            <Label htmlFor="cust-phone" className="text-xs font-semibold flex items-center gap-1.5">
              <HugeiconsIcon icon={SmartPhoneIcon} size={14} className="text-cinnamon" />
              <span>Phone Number *</span>
            </Label>
            <Input
              id="cust-phone"
              type="tel"
              placeholder="e.g. 9876543210"
              {...register('phone')}
              className="h-10 text-xs bg-background rounded-md"
            />
            {errors.phone && (
              <p className="text-[11px] text-destructive font-medium">{errors.phone.message}</p>
            )}
          </div>

          {/* Optional Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="cust-notes" className="text-xs font-semibold flex items-center gap-1.5">
              <HugeiconsIcon icon={NoteIcon} size={14} className="text-muted-foreground" />
              <span>Notes (Optional)</span>
            </Label>
            <Textarea
              id="cust-notes"
              placeholder="e.g. Regular customer, prefers cold brew"
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
              className="h-9 text-xs bg-cinnamon hover:bg-cinnamon/90 text-white font-bold rounded-md shadow-xs"
            >
              {isSubmitting || createCustomerMutation.isPending ? 'Saving...' : 'Create Customer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
