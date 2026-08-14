import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCafeSettings, useUpdateCafeSettings } from '../../../hooks/useSettings';
import { cafeProfileSchema, type CafeProfileFormData } from '../../../lib/validators/settingsSchema';
import { uploadImageToStorage, BUCKETS, validateImageFile } from '../../../lib/supabase/storage';
import { SettingsSection } from './SettingsSection';
import { SettingsRow } from './SettingsRow';
import { SettingsSaveFooter } from './SettingsSaveFooter';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Button } from '../../ui/button';
import { Skeleton } from '../../ui/skeleton';
import { toast } from '../../ui/toast';
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
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Upload01Icon,
  Image01Icon,
  Delete02Icon,
  Loading03Icon,
  ViewIcon,
} from '@hugeicons/core-free-icons';

interface CafeProfileSettingsProps {
  onDirtyChange?: (isDirty: boolean) => void;
}

export function CafeProfileSettings({ onDirtyChange }: CafeProfileSettingsProps) {
  const { data: settings, isLoading } = useCafeSettings();
  const updateMutation = useUpdateCafeSettings();

  const [uploadingLogo, setUploadingLogo] = useState<boolean>(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [showRemoveLogoDialog, setShowRemoveLogoDialog] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<CafeProfileFormData>({
    resolver: zodResolver(cafeProfileSchema),
    defaultValues: {
      cafe_name: 'RadhaCafe',
      tagline: 'Artisanal Coffee & Warm Hospitality',
      about_text: 'Crafted with Passion & Traditional Roast',
      address: 'Main Market Road, City Center',
      phone: '+91 98765 43210',
      email: 'contact@radhacafe.com',
      opening_hours: 'Mon - Sun: 8:00 AM - 10:00 PM',
    },
  });

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  useEffect(() => {
    if (settings) {
      const initialValues: CafeProfileFormData = {
        cafe_name: settings.cafe_name || 'RadhaCafe',
        tagline: settings.tagline || '',
        about_text: settings.about_text || '',
        address: settings.address || '',
        phone: settings.phone || '',
        email: settings.email || '',
        opening_hours: settings.opening_hours || '',
      };
      reset(initialValues);
      setLogoUrl(settings.logo_url || null);
    }
  }, [settings, reset]);

  const onSubmit = async (formData: CafeProfileFormData) => {
    try {
      await updateMutation.mutateAsync({
        cafe_name: formData.cafe_name.trim(),
        tagline: formData.tagline ? formData.tagline.trim() : null,
        about_text: formData.about_text ? formData.about_text.trim() : null,
        address: formData.address ? formData.address.trim() : null,
        phone: formData.phone ? formData.phone.trim() : null,
        email: formData.email ? formData.email.trim() : null,
        opening_hours: formData.opening_hours ? formData.opening_hours.trim() : null,
      });

      reset(formData);
      toast.add({
        title: 'Cafe Profile Saved',
        description: 'Business information and public details updated.',
        type: 'success',
      });
    } catch (err: any) {
      toast.add({
        title: 'Unable to Save Profile',
        description: err.message || 'Failed to update profile details.',
        type: 'error',
      });
    }
  };

  const handleReset = () => {
    if (settings) {
      reset({
        cafe_name: settings.cafe_name || 'RadhaCafe',
        tagline: settings.tagline || '',
        about_text: settings.about_text || '',
        address: settings.address || '',
        phone: settings.phone || '',
        email: settings.email || '',
        opening_hours: settings.opening_hours || '',
      });
    }
  };

  // Logo upload processing
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid && validation.error) {
      toast.add({
        title: 'Invalid Image',
        description: validation.error,
        type: 'error',
      });
      return;
    }

    try {
      setUploadingLogo(true);
      const { url, error: uploadErr } = await uploadImageToStorage(file, BUCKETS.CAFE_ASSETS, 'logo');
      if (uploadErr || !url) {
        throw new Error(uploadErr || 'Failed to upload logo.');
      }

      await updateMutation.mutateAsync({ logo_url: url });
      setLogoUrl(url);

      toast.add({
        title: 'Brand Logo Updated',
        description: 'New cafe logo uploaded and applied across public site and thermal receipts.',
        type: 'success',
      });
    } catch (err: any) {
      toast.add({
        title: 'Upload Failed',
        description: err.message || 'Could not upload brand logo.',
        type: 'error',
      });
    } finally {
      setUploadingLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Logo removal
  const handleRemoveLogo = async () => {
    setShowRemoveLogoDialog(false);
    try {
      await updateMutation.mutateAsync({ logo_url: null });
      setLogoUrl(null);
      toast.add({
        title: 'Logo Removed',
        description: 'Brand logo cleared. Text branding will be used as default.',
        type: 'success',
      });
    } catch (err: any) {
      toast.add({
        title: 'Removal Failed',
        description: err.message || 'Unable to remove logo.',
        type: 'error',
      });
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
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border/60">
        <div className="space-y-0.5">
          <h3 className="text-lg font-bold font-heading text-foreground">
            Cafe Profile
          </h3>
          <p className="text-xs text-muted-foreground">
            Manage the business information shown throughout RadhaCafe, public pages, and receipts.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => window.open('/', '_blank')}
          className="h-8 text-xs font-semibold rounded-xl border-border/80 bg-card hover:bg-secondary gap-1.5 self-start sm:self-auto shadow-2xs"
        >
          <HugeiconsIcon icon={ViewIcon} size={13} className="text-cinnamon" />
          <span>View Public Site</span>
        </Button>
      </div>

      {/* Hidden File Input for Logo */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="hidden"
        onChange={handleLogoUpload}
      />

      {/* Section 1: Brand Identity & Logo */}
      <SettingsSection title="Brand Identity">
        {/* Brand Logo Row */}
        <SettingsRow
          title="Cafe Brand Logo"
          description="Square or circular brand insignia displayed on the public navigation bar and thermal receipts."
          alignTop
        >
          <div className="flex items-center gap-3.5">
            {/* Logo Preview Avatar */}
            <div className="w-14 h-14 rounded-2xl bg-secondary/50 border border-border/80 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
              {logoUrl ? (
                <img src={logoUrl} alt="Cafe Logo" className="w-full h-full object-contain p-1" />
              ) : (
                <HugeiconsIcon icon={Image01Icon} size={22} className="text-muted-foreground/60" />
              )}
            </div>

            {/* Logo Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingLogo}
                className="h-8 text-xs font-semibold rounded-xl border-border/80 bg-card hover:bg-secondary gap-1.5 shadow-2xs"
              >
                {uploadingLogo ? (
                  <>
                    <HugeiconsIcon icon={Loading03Icon} size={13} className="animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <HugeiconsIcon icon={Upload01Icon} size={13} className="text-cinnamon" />
                    <span>{logoUrl ? 'Change Logo' : 'Upload Logo'}</span>
                  </>
                )}
              </Button>

              {logoUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowRemoveLogoDialog(true)}
                  disabled={uploadingLogo}
                  className="h-8 text-xs font-semibold rounded-xl text-destructive hover:bg-destructive/10 gap-1 px-2.5"
                >
                  <HugeiconsIcon icon={Delete02Icon} size={13} />
                  <span>Remove</span>
                </Button>
              )}
            </div>
          </div>
        </SettingsRow>

        {/* Tagline */}
        <SettingsRow
          id="tagline"
          title="Brand Tagline"
          description="Catchphrase featured beneath your cafe title on customer receipts and hero banners."
        >
          <div className="w-full sm:w-80">
            <Input
              id="tagline"
              {...register('tagline')}
              placeholder="Good coffee. Good moments."
              className="h-9 text-xs rounded-xl bg-background border-border/80"
            />
            {errors.tagline && (
              <p className="text-[11px] text-destructive mt-1 font-medium">
                {errors.tagline.message}
              </p>
            )}
          </div>
        </SettingsRow>

        {/* About Text */}
        <SettingsRow
          id="about_text"
          title="About Description"
          description="Short summary of RadhaCafe heritage, roasting philosophy, and service story."
          alignTop
        >
          <div className="w-full sm:w-80">
            <Textarea
              id="about_text"
              {...register('about_text')}
              rows={3}
              placeholder="Authentic South Indian filter coffee..."
              className="text-xs rounded-xl bg-background border-border/80 resize-none"
            />
            {errors.about_text && (
              <p className="text-[11px] text-destructive mt-1 font-medium">
                {errors.about_text.message}
              </p>
            )}
          </div>
        </SettingsRow>
      </SettingsSection>

      {/* Section 2: Contact & Location */}
      <SettingsSection title="Public Contact & Location" showSeparator={false}>
        {/* Address */}
        <SettingsRow
          id="address"
          title="Physical Address"
          description="Main store location printed on customer receipts and footer directions."
          badge="Shown publicly"
          alignTop
        >
          <div className="w-full sm:w-80">
            <Textarea
              id="address"
              {...register('address')}
              rows={2}
              placeholder="Main Market Road, City Center"
              className="text-xs rounded-xl bg-background border-border/80 resize-none"
            />
            {errors.address && (
              <p className="text-[11px] text-destructive mt-1 font-medium">
                {errors.address.message}
              </p>
            )}
          </div>
        </SettingsRow>

        {/* Phone */}
        <SettingsRow
          id="phone"
          title="Phone Number"
          description="Direct telephone or WhatsApp support contact for customer queries."
          badge="Shown publicly"
        >
          <div className="w-full sm:w-80">
            <Input
              id="phone"
              {...register('phone')}
              placeholder="+91 98765 43210"
              className="h-9 text-xs rounded-xl bg-background border-border/80"
            />
            {errors.phone && (
              <p className="text-[11px] text-destructive mt-1 font-medium">
                {errors.phone.message}
              </p>
            )}
          </div>
        </SettingsRow>

        {/* Email */}
        <SettingsRow
          id="email"
          title="Support Email"
          description="Official email address for supplier communications and feedback."
          badge="Shown publicly"
        >
          <div className="w-full sm:w-80">
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="contact@radhacafe.com"
              className="h-9 text-xs rounded-xl bg-background border-border/80"
            />
            {errors.email && (
              <p className="text-[11px] text-destructive mt-1 font-medium">
                {errors.email.message}
              </p>
            )}
          </div>
        </SettingsRow>

        {/* Opening Hours */}
        <SettingsRow
          id="opening_hours"
          title="Opening Hours"
          description="Weekly operating schedule shown on the website and contact banner."
          badge="Shown publicly"
          alignTop
        >
          <div className="w-full sm:w-80">
            <Textarea
              id="opening_hours"
              {...register('opening_hours')}
              rows={2}
              placeholder="Mon - Sun: 8:00 AM - 10:00 PM"
              className="text-xs rounded-xl bg-background border-border/80 resize-none"
            />
            {errors.opening_hours && (
              <p className="text-[11px] text-destructive mt-1 font-medium">
                {errors.opening_hours.message}
              </p>
            )}
          </div>
        </SettingsRow>
      </SettingsSection>

      {/* Sticky Save Footer */}
      <SettingsSaveFooter
        isDirty={isDirty}
        isPending={updateMutation.isPending}
        onSave={handleSubmit(onSubmit)}
        onReset={handleReset}
      />

      {/* Remove Logo Confirmation Dialog */}
      <AlertDialog open={showRemoveLogoDialog} onOpenChange={setShowRemoveLogoDialog}>
        <AlertDialogContent className="bg-card border-border/90 rounded-2xl shadow-xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading font-bold text-base text-destructive">
              Remove brand logo?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to remove the brand logo? Text cafe branding will be used instead across the public site and receipt printouts.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 pt-2">
            <AlertDialogCancel className="text-xs rounded-lg h-9">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveLogo}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs font-bold rounded-lg h-9"
            >
              Remove Logo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  );
}
