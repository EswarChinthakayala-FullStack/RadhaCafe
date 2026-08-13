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
import { UserAdd01Icon, UserIcon, SmartPhoneIcon, Location01Icon, Target01Icon, Loading03Icon } from '@hugeicons/core-free-icons';
import { toast } from '../../../ui/toast';

interface WaterCustomerFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (createdCustomer: WaterCustomer) => void;
}

export function WaterCustomerFormModal({ open, onOpenChange, onSuccess }: WaterCustomerFormModalProps) {
  const createCustomerMutation = useCreateWaterCustomer();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<WaterCustomerFormData>({
    resolver: zodResolver(waterCustomerSchema),
    defaultValues: {
      name: '',
      phone: '',
      address: '',
      notes: '',
    },
  });

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.add({ title: 'Geolocation is not supported by your browser.', type: 'error' });
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`
          );
          const data = await res.json();

          let addressStr = '';
          if (data && data.address) {
            const parts = [
              data.address.amenity || data.address.building || data.address.shop || data.address.office,
              data.address.road || data.address.street || data.address.pedestrian,
              data.address.suburb || data.address.neighbourhood || data.address.village || data.address.town || data.address.city_district,
              data.address.city || data.address.county || data.address.state_district,
              data.address.postcode,
            ].filter(Boolean);

            addressStr = parts.length > 0 ? parts.join(', ') : data.display_name;
          } else if (data && data.display_name) {
            addressStr = data.display_name;
          } else {
            addressStr = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
          }

          setValue('address', addressStr, { shouldValidate: true });
          toast.add({ title: 'Location auto-detected successfully!', type: 'success' });
        } catch (err) {
          toast.add({ title: 'Failed to fetch location address.', type: 'error' });
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          toast.add({ title: 'Location permission denied.', type: 'error' });
        } else {
          toast.add({ title: 'Could not detect location.', type: 'error' });
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

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
          <div className="w-10 h-10 rounded-xl bg-cinnamon/10 text-cinnamon border border-cinnamon/20 flex items-center justify-center mb-2 shadow-2xs">
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
              <HugeiconsIcon icon={UserIcon} size={14} className="text-cinnamon" />
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
              <HugeiconsIcon icon={SmartPhoneIcon} size={14} className="text-cinnamon" />
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

          {/* Address with Auto-Detect */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="w-cust-addr" className="text-xs font-semibold flex items-center gap-1.5">
                <HugeiconsIcon icon={Location01Icon} size={14} className="text-cinnamon" />
                <span>Delivery Address (Optional)</span>
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleDetectLocation}
                disabled={isLocating}
                className="h-6 text-[11px] px-2 text-cinnamon hover:bg-cinnamon/10 border border-cinnamon/20 rounded-md flex items-center gap-1"
              >
                {isLocating ? (
                  <>
                    <HugeiconsIcon icon={Loading03Icon} size={12} className="animate-spin text-cinnamon" />
                    <span>Detecting...</span>
                  </>
                ) : (
                  <>
                    <HugeiconsIcon icon={Target01Icon} size={12} className="text-cinnamon" />
                    <span>Auto-Detect</span>
                  </>
                )}
              </Button>
            </div>
            <div className="relative">
              <Input
                id="w-cust-addr"
                placeholder="e.g. Door 4-12, Main Road, Tallur"
                {...register('address')}
                className="h-10 text-xs bg-background rounded-md pr-9"
              />
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={isLocating}
                title="Auto-detect location using GPS"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-cinnamon transition-colors disabled:opacity-50"
              >
                <HugeiconsIcon
                  icon={isLocating ? Loading03Icon : Target01Icon}
                  size={15}
                  className={isLocating ? 'animate-spin text-cinnamon' : ''}
                />
              </button>
            </div>
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
