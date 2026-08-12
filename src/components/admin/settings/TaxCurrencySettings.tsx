import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCafeSettings, useUpdateCafeSettings } from '../../../hooks/useSettings';
import { taxCurrencySchema, type TaxCurrencyFormData } from '../../../lib/validators/settingsSchema';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Button } from '../../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Skeleton } from '../../ui/skeleton';
import { toast } from '../../ui/toast';
import { HugeiconsIcon } from '@hugeicons/react';
import { InvoiceIcon, FloppyDiskIcon } from '@hugeicons/core-free-icons';

export function TaxCurrencySettings() {
  const { data: settings, isLoading } = useCafeSettings();
  const updateMutation = useUpdateCafeSettings();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<TaxCurrencyFormData>({
    resolver: zodResolver(taxCurrencySchema),
    defaultValues: {
      tax_percentage: 5.0,
      currency: 'INR',
    },
  });

  const currencyValue = watch('currency');

  useEffect(() => {
    if (settings) {
      if (settings.tax_percentage !== undefined) setValue('tax_percentage', Number(settings.tax_percentage));
      if (settings.currency) setValue('currency', settings.currency);
    }
  }, [settings, setValue]);

  const onSubmit = async (formData: TaxCurrencyFormData) => {
    try {
      await updateMutation.mutateAsync({
        tax_percentage: Number(formData.tax_percentage),
        currency: formData.currency,
      });

      toast.add({
        title: 'Tax & Currency Preferences Saved',
        description: 'Billing configuration updated. New POS orders will use the updated tax percentage.',
        type: 'success',
      });
    } catch (err: any) {
      toast.add({
        title: 'Unable to Save Billing Settings',
        description: err.message || 'Failed to update billing and tax preferences. Please try again.',
        type: 'error',
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="border-border/80 bg-card shadow-xs rounded-md w-full">
        <CardHeader className="pb-4 border-b border-border/60">
          <Skeleton className="h-6 w-48 rounded-lg" />
          <Skeleton className="h-4 w-72 rounded-lg mt-1" />
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/80 bg-card shadow-xs rounded-md w-full">
      <CardHeader className="pb-4 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-md bg-cinnamon/10 text-cinnamon">
            <HugeiconsIcon icon={InvoiceIcon} size={20} />
          </div>
          <div>
            <CardTitle className="text-base font-bold font-heading text-foreground">
              Tax & Currency Configuration
            </CardTitle>
            <CardDescription className="text-xs">
              Configure default sales tax rate and operational currency for POS orders and receipts.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6 pb-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 text-xs">
          <div className="grid sm:grid-cols-2 gap-6">
            {/* Tax Percentage */}
            <div className="space-y-1.5">
              <Label htmlFor="tax_percentage" className="font-bold text-foreground">
                Sales Tax Percentage (%) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="tax_percentage"
                type="number"
                step="0.01"
                min="0"
                max="100"
                placeholder="5.0"
                {...register('tax_percentage', { valueAsNumber: true })}
                className="bg-background h-9 rounded-md border-border/80 font-medium"
              />
              <p className="text-[11px] text-muted-foreground">
                Tax percentage used when calculating taxes for new orders. Does not alter historical order records.
              </p>
              {errors.tax_percentage && (
                <p className="text-[11px] font-semibold text-destructive">{errors.tax_percentage.message}</p>
              )}
            </div>

            {/* Currency Select */}
            <div className="space-y-1.5">
              <Label htmlFor="currency-select" className="font-bold text-foreground">
                Operating Currency <span className="text-destructive">*</span>
              </Label>
              <Select
                value={currencyValue}
                onValueChange={(val: string | null) => val && setValue('currency', val, { shouldDirty: true })}
              >
                <SelectTrigger id="currency-select" size="sm" className="bg-background h-9 rounded-md border-border/80 font-medium">
                  <SelectValue placeholder="Select Currency" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="INR">INR — Indian Rupee (₹)</SelectItem>
                  <SelectItem value="USD">USD — US Dollar ($)</SelectItem>
                  <SelectItem value="EUR">EUR — Euro (€)</SelectItem>
                  <SelectItem value="GBP">GBP — British Pound (£)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">
                Determines currency formatting across ordering, analytics, receipts, and public pricing.
              </p>
              {errors.currency && (
                <p className="text-[11px] font-semibold text-destructive">{errors.currency.message}</p>
              )}
            </div>
          </div>

          {/* Submit Footer */}
          <div className="pt-4 border-t border-border/60 flex justify-end">
            <Button
              type="submit"
              size="sm"
              disabled={updateMutation.isPending || !isDirty}
              className="bg-cinnamon hover:bg-cinnamon/90 text-white font-bold h-9 px-4 rounded-md gap-2 shadow-xs"
            >
              <HugeiconsIcon icon={FloppyDiskIcon} size={15} />
              <span>{updateMutation.isPending ? 'Saving Tax Settings...' : 'Save Tax & Currency Changes'}</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// Keep BillingSettings alias for backward compatibility
export const BillingSettings = TaxCurrencySettings;
