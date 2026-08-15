import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCafeSettings, useUpdateCafeSettings } from '../../../hooks/useSettings';
import { SettingsSection } from './SettingsSection';
import { SettingsRow } from './SettingsRow';
import { SettingsSaveFooter } from './SettingsSaveFooter';
import { Input } from '../../ui/input';
import { Switch } from '../../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Skeleton } from '../../ui/skeleton';
import { toast } from '../../ui/toast';
import { HugeiconsIcon } from '@hugeicons/react';
import { Alert01Icon } from '@hugeicons/core-free-icons';

const orderPaymentSchema = z.object({
  tax_percentage: z
    .number({ message: 'Tax rate must be a valid number' })
    .min(0, 'Tax percentage cannot be negative')
    .max(100, 'Tax percentage cannot exceed 100%'),
});

type OrderPaymentFormData = z.infer<typeof orderPaymentSchema>;

interface OrderPaymentSettingsProps {
  onDirtyChange?: (isDirty: boolean) => void;
}

export function OrderPaymentSettings({ onDirtyChange }: OrderPaymentSettingsProps) {
  const { data: settings, isLoading } = useCafeSettings();
  const updateMutation = useUpdateCafeSettings();

  // Local storage runtime preferences
  const [defaultPaymentMethod, setDefaultPaymentMethod] = useState<string>(() => {
    return localStorage.getItem('radhacafe_default_payment_method') || 'upi';
  });

  const [autoPrintOrder, setAutoPrintOrder] = useState<boolean>(() => {
    return localStorage.getItem('radhacafe_autoprint_completion') === 'true';
  });

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<OrderPaymentFormData>({
    resolver: zodResolver(orderPaymentSchema),
    defaultValues: {
      tax_percentage: 0.0,
    },
  });

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  useEffect(() => {
    if (settings) {
      const tax = settings.tax_percentage !== undefined ? Number(settings.tax_percentage) : 0.0;
      setValue('tax_percentage', tax);
      reset({ tax_percentage: tax });
    }
  }, [settings, setValue, reset]);

  const onSubmit = async (formData: OrderPaymentFormData) => {
    try {
      await updateMutation.mutateAsync({
        tax_percentage: Number(formData.tax_percentage),
      });

      reset(formData);
      toast.add({
        title: 'Tax Configuration Saved',
        description: `POS orders will now apply ${formData.tax_percentage}% tax automatically.`,
        type: 'success',
      });
    } catch {
      toast.add({
        title: 'Unable to Save Tax Settings',
        description: 'Unable to save these settings. Your changes are still here.',
        type: 'error',
      });
    }
  };

  const handleReset = () => {
    if (settings) {
      const tax = settings.tax_percentage !== undefined ? Number(settings.tax_percentage) : 5.0;
      reset({ tax_percentage: tax });
    }
  };

  const handlePaymentMethodChange = (method: string | null) => {
    if (!method) return;
    setDefaultPaymentMethod(method);
    localStorage.setItem('radhacafe_default_payment_method', method);
    toast.add({
      title: 'Default Payment Method Updated',
      description: `New order forms will pre-select ${method.toUpperCase()}.`,
      type: 'success',
    });
  };

  const handleAutoPrintToggle = (checked: boolean) => {
    setAutoPrintOrder(checked);
    localStorage.setItem('radhacafe_autoprint_completion', String(checked));
    toast.add({
      title: 'Auto-Print Preference',
      description: checked
        ? 'Thermal receipts will print automatically upon placing orders.'
        : 'Auto-print disabled.',
      type: 'success',
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-6 w-32 rounded-lg" />
          <Skeleton className="h-4 w-64 rounded-md" />
        </div>
        <div className="space-y-4 pt-4">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header */}
      <div className="space-y-0.5 pb-2 border-b border-border/60">
        <h3 className="text-lg font-bold font-heading text-foreground">
          Orders & Payments
        </h3>
        <p className="text-xs text-muted-foreground">
          Configure default sales tax rate, billing currency, and counter payment presets.
        </p>
      </div>

      {/* Section 1: Taxation & Pricing */}
      <SettingsSection title="Taxation & Billing">
        {/* Tax Percentage Row */}
        <SettingsRow
          id="tax_percentage"
          title="Sales Tax / GST Rate"
          description="Percentage added to POS line totals during customer bill calculation."
          badge="Orders"
        >
          <div className="w-full sm:w-36">
            <div className="relative">
              <Input
                id="tax_percentage"
                type="number"
                step="0.1"
                min="0"
                max="100"
                {...register('tax_percentage', { valueAsNumber: true })}
                placeholder="5.0"
                className="h-9 text-xs rounded-xl bg-background border-border/80 pr-7 font-mono font-bold"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                %
              </span>
            </div>
            {errors.tax_percentage && (
              <p className="text-[11px] text-destructive mt-1 font-medium">
                {errors.tax_percentage.message}
              </p>
            )}
          </div>
        </SettingsRow>

        {/* Currency Display */}
        <SettingsRow
          title="Operational Currency"
          description="Fixed denomination for menu rates and transaction reporting."
        >
          <div className="text-xs font-mono font-bold text-foreground bg-secondary/30 px-3 py-2 rounded-xl border border-border/60">
            ₹ INR (Indian Rupee)
          </div>
        </SettingsRow>
      </SettingsSection>

      {/* Section 2: Counter Checkout Automation */}
      <SettingsSection title="Counter Checkout Defaults" showSeparator={false}>
        {/* Default Payment Mode */}
        <SettingsRow
          title="Default POS Payment Method"
          description="Pre-selected payment mode when opening the New Order counter register."
        >
          <Select value={defaultPaymentMethod} onValueChange={handlePaymentMethodChange}>
            <SelectTrigger className="h-9 w-full sm:w-56 text-xs rounded-xl border-border/80 bg-background">
              <SelectValue placeholder="Select payment" />
            </SelectTrigger>
            <SelectContent className="rounded-xl text-xs">
              <SelectItem value="upi">UPI (Instant QR / App)</SelectItem>
              <SelectItem value="cash">Cash (Counter Tender)</SelectItem>
              <SelectItem value="card">Card (POS Machine)</SelectItem>
            </SelectContent>
          </Select>
        </SettingsRow>

        {/* Auto-Print on Checkout */}
        <SettingsRow
          id="auto-print"
          title="Auto-Print Receipt on Order Placement"
          description="Transmit ESC/POS thermal receipt byte stream automatically upon creating a new order."
        >
          <Switch
            id="auto-print"
            checked={autoPrintOrder}
            onCheckedChange={handleAutoPrintToggle}
          />
        </SettingsRow>
      </SettingsSection>

      {/* Historical Order Integrity Warning Box */}
      <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-300 flex items-start gap-2.5">
        <HugeiconsIcon icon={Alert01Icon} size={16} className="text-amber-600 shrink-0 mt-0.5" />
        <span className="leading-relaxed text-[11px]">
          <strong>Historical Integrity:</strong> Changing sales tax applies exclusively to new POS orders created from now on. Past order amounts and reprint receipts preserve their original historical amounts.
        </span>
      </div>

      {/* Sticky Save Footer */}
      <SettingsSaveFooter
        isDirty={isDirty}
        isPending={updateMutation.isPending}
        onSave={handleSubmit(onSubmit)}
        onReset={handleReset}
      />
    </form>
  );
}
