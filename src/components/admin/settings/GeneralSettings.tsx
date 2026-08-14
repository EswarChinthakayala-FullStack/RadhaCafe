import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCafeSettings, useUpdateCafeSettings } from '../../../hooks/useSettings';
import { SettingsSection } from './SettingsSection';
import { SettingsRow } from './SettingsRow';
import { SettingsSaveFooter } from './SettingsSaveFooter';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Badge } from '../../ui/badge';
import { Skeleton } from '../../ui/skeleton';
import { toast } from '../../ui/toast';
import { HugeiconsIcon } from '@hugeicons/react';
import { InformationCircleIcon } from '@hugeicons/core-free-icons';

const generalSchema = z.object({
  cafe_name: z.string().min(1, 'Cafe name is required').max(100, 'Cafe name is too long'),
});

type GeneralFormData = z.infer<typeof generalSchema>;

interface GeneralSettingsProps {
  onDirtyChange?: (isDirty: boolean) => void;
}

export function GeneralSettings({ onDirtyChange }: GeneralSettingsProps) {
  const { data: settings, isLoading } = useCafeSettings();
  const updateMutation = useUpdateCafeSettings();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<GeneralFormData>({
    resolver: zodResolver(generalSchema),
    defaultValues: {
      cafe_name: 'RadhaCafe',
    },
  });

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  useEffect(() => {
    if (settings?.cafe_name) {
      setValue('cafe_name', settings.cafe_name);
      reset({ cafe_name: settings.cafe_name });
    }
  }, [settings, setValue, reset]);

  const onSubmit = async (formData: GeneralFormData) => {
    try {
      await updateMutation.mutateAsync({
        cafe_name: formData.cafe_name.trim(),
      });
      reset({ cafe_name: formData.cafe_name.trim() });
      toast.add({
        title: 'Settings Saved',
        description: 'Cafe business name updated successfully.',
        type: 'success',
      });
    } catch (err: any) {
      toast.add({
        title: 'Unable to Save Settings',
        description: err.message || 'Failed to update cafe name. Please try again.',
        type: 'error',
      });
    }
  };

  const handleReset = () => {
    if (settings?.cafe_name) {
      reset({ cafe_name: settings.cafe_name });
    }
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
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header */}
      <div className="space-y-1 pb-2">
        <h3 className="text-lg font-bold font-heading text-foreground">
          General Settings
        </h3>
        <p className="text-xs text-muted-foreground">
          Manage core business defaults, localization, and system currency standards.
        </p>
      </div>

      {/* Section 1: Business Defaults */}
      <SettingsSection title="Business Defaults">
        <SettingsRow
          id="cafe_name"
          title="Cafe Name"
          description="The official registered brand name displayed across POS screens, customer bills, and receipts."
          badge="Core"
        >
          <div className="w-full sm:w-72">
            <Input
              id="cafe_name"
              {...register('cafe_name')}
              placeholder="RadhaCafe"
              className="h-9 text-xs rounded-xl bg-background border-border/80"
            />
            {errors.cafe_name && (
              <p className="text-[11px] text-destructive mt-1 font-medium">
                {errors.cafe_name.message}
              </p>
            )}
          </div>
        </SettingsRow>

        <SettingsRow
          title="Operational Currency"
          description="Standard billing currency for POS item pricing, tax calculation, and payment capture."
        >
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="font-mono text-xs font-bold text-foreground border-border/80 bg-secondary/50 px-3 py-1.5 rounded-xl h-9"
            >
              ₹ INR (Indian Rupee)
            </Badge>
          </div>
        </SettingsRow>

        <SettingsRow
          title="Business Timezone"
          description="Governs opening hours schedules, shift turnovers, and daily sales report timestamps."
        >
          <div className="text-xs font-mono font-medium text-foreground bg-secondary/30 px-3 py-2 rounded-xl border border-border/60">
            Asia/Kolkata (IST — UTC+5:30)
          </div>
        </SettingsRow>
      </SettingsSection>

      {/* Section 2: Regional Formatting */}
      <SettingsSection title="Display Preferences" showSeparator={false}>
        <SettingsRow
          title="Date Format"
          description="Default date representation format used across orders, receipts, and analytics tables."
        >
          <Select defaultValue="DD/MM/YYYY">
            <SelectTrigger className="h-9 w-full sm:w-48 text-xs rounded-xl border-border/80 bg-background">
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent className="rounded-xl text-xs">
              <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (14/08/2026)</SelectItem>
              <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (08/14/2026)</SelectItem>
              <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (2026-08-14)</SelectItem>
            </SelectContent>
          </Select>
        </SettingsRow>

        <SettingsRow
          title="Time Format"
          description="Standard clock format for order creation times and kitchen ticket printouts."
        >
          <Select defaultValue="12h">
            <SelectTrigger className="h-9 w-full sm:w-48 text-xs rounded-xl border-border/80 bg-background">
              <SelectValue placeholder="Select clock" />
            </SelectTrigger>
            <SelectContent className="rounded-xl text-xs">
              <SelectItem value="12h">12-Hour (06:30 PM)</SelectItem>
              <SelectItem value="24h">24-Hour (18:30)</SelectItem>
            </SelectContent>
          </Select>
        </SettingsRow>
      </SettingsSection>

      {/* Notice Card */}
      <div className="p-3.5 rounded-2xl bg-secondary/30 border border-border/60 text-xs text-muted-foreground flex items-start gap-2.5">
        <HugeiconsIcon icon={InformationCircleIcon} size={16} className="text-cinnamon shrink-0 mt-0.5" />
        <span className="leading-relaxed text-[11px]">
          Currency and timezone settings are calibrated to RadhaCafe's South Indian operations. For specialized multi-branch invoicing, configure your receipt template parameters.
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
