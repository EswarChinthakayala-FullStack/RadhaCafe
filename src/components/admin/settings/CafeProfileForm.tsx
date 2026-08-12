import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCafeSettings, useUpdateCafeSettings } from '../../../hooks/useSettings';
import { cafeProfileSchema, type CafeProfileFormData } from '../../../lib/validators/settingsSchema';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Button } from '../../ui/button';
import { Skeleton } from '../../ui/skeleton';
import { toast } from '../../ui/toast';
import { HugeiconsIcon } from '@hugeicons/react';
import { Store01Icon, FloppyDiskIcon } from '@hugeicons/core-free-icons';

export function CafeProfileForm() {
  const { data: settings, isLoading } = useCafeSettings();
  const updateMutation = useUpdateCafeSettings();

  const {
    register,
    handleSubmit,
    setValue,
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
    if (settings) {
      if (settings.cafe_name) setValue('cafe_name', settings.cafe_name);
      if (settings.tagline) setValue('tagline', settings.tagline || '');
      if (settings.about_text) setValue('about_text', settings.about_text || '');
      if (settings.address) setValue('address', settings.address || '');
      if (settings.phone) setValue('phone', settings.phone || '');
      if (settings.email) setValue('email', settings.email || '');
      if (settings.opening_hours) setValue('opening_hours', settings.opening_hours || '');
    }
  }, [settings, setValue]);

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

      toast.add({
        title: 'Cafe Profile Saved',
        description: 'Cafe details and public business information have been updated.',
        type: 'success',
      });
    } catch (err: any) {
      toast.add({
        title: 'Unable to Save Settings',
        description: err.message || 'Failed to update cafe profile details. Please try again.',
        type: 'error',
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="border-border/80 bg-card shadow-xs rounded-md">
        <CardHeader className="pb-4 border-b border-border/60">
          <Skeleton className="h-6 w-48 rounded-lg" />
          <Skeleton className="h-4 w-72 rounded-lg mt-1" />
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-20 w-full rounded-md" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/80 bg-card shadow-xs rounded-md w-full">
      <CardHeader className="pb-4 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-md bg-cinnamon/10 text-cinnamon">
            <HugeiconsIcon icon={Store01Icon} size={20} />
          </div>
          <div>
            <CardTitle className="text-base font-bold font-heading text-foreground">
              Cafe Business Profile
            </CardTitle>
            <CardDescription className="text-xs">
              Manage public brand details, contact information, and operating hours.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6 pb-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 text-xs">
          {/* Cafe Name */}
          <div className="space-y-1.5">
            <Label htmlFor="cafe_name" className="font-bold text-foreground">
              Cafe Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="cafe_name"
              placeholder="RadhaCafe"
              {...register('cafe_name')}
              className="bg-background h-9 rounded-md border-border/80 font-medium"
            />
            <p className="text-[11px] text-muted-foreground">
              The name displayed throughout the customer-facing website and printed receipts.
            </p>
            {errors.cafe_name && (
              <p className="text-[11px] font-semibold text-destructive">{errors.cafe_name.message}</p>
            )}
          </div>

          {/* Tagline */}
          <div className="space-y-1.5">
            <Label htmlFor="tagline" className="font-bold text-foreground">
              Tagline
            </Label>
            <Input
              id="tagline"
              placeholder="Artisanal Coffee & Warm Hospitality"
              {...register('tagline')}
              className="bg-background h-9 rounded-md border-border/80"
            />
            <p className="text-[11px] text-muted-foreground">
              A short brand statement displayed on the public cafe website.
            </p>
            {errors.tagline && (
              <p className="text-[11px] font-semibold text-destructive">{errors.tagline.message}</p>
            )}
          </div>

          {/* About */}
          <div className="space-y-1.5">
            <Label htmlFor="about_text" className="font-bold text-foreground">
              About / Description
            </Label>
            <Textarea
              id="about_text"
              rows={3}
              placeholder="Tell visitors about RadhaCafe and what makes your specialty coffee special..."
              {...register('about_text')}
              className="bg-background rounded-md border-border/80"
            />
            <p className="text-[11px] text-muted-foreground">
              The cafe story or description shown in the About section.
            </p>
            {errors.about_text && (
              <p className="text-[11px] font-semibold text-destructive">{errors.about_text.message}</p>
            )}
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <Label htmlFor="address" className="font-bold text-foreground">
              Address
            </Label>
            <Textarea
              id="address"
              rows={2}
              placeholder="1A, Vellampalli Tallur Rd, opp. Pattu Office, Tallur 523264"
              {...register('address')}
              className="bg-background rounded-md border-border/80"
            />
            <p className="text-[11px] text-muted-foreground">
              The physical cafe address displayed on the website and receipt.
            </p>
            {errors.address && (
              <p className="text-[11px] font-semibold text-destructive">{errors.address.message}</p>
            )}
          </div>

          {/* Contact Details Grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="font-bold text-foreground">
                Phone Number
              </Label>
              <Input
                id="phone"
                placeholder="+91 99666 30913"
                {...register('phone')}
                className="bg-background h-9 rounded-md border-border/80"
              />
              <p className="text-[11px] text-muted-foreground">
                Primary contact phone number for customer inquiries.
              </p>
              {errors.phone && (
                <p className="text-[11px] font-semibold text-destructive">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="font-bold text-foreground/80">
                Email Address <span className="text-[10px] font-semibold text-muted-foreground">(Non-editable)</span>
              </Label>
              <Input
                id="email"
                type="email"
                disabled
                readOnly
                placeholder="contact@radhacafe.com"
                {...register('email')}
                className="bg-secondary/40 text-muted-foreground h-9 rounded-md border-border/80 cursor-not-allowed select-none font-medium"
              />
              <p className="text-[11px] text-muted-foreground">
                System email account bound to administrator login (non-editable).
              </p>
            </div>
          </div>

          {/* Opening Hours */}
          <div className="space-y-1.5">
            <Label htmlFor="opening_hours" className="font-bold text-foreground">
              Opening Hours
            </Label>
            <Input
              id="opening_hours"
              placeholder="Mon - Sun: 8:00 AM - 10:00 PM"
              {...register('opening_hours')}
              className="bg-background h-9 rounded-md border-border/80"
            />
            <p className="text-[11px] text-muted-foreground">
              The opening schedule displayed to customers.
            </p>
            {errors.opening_hours && (
              <p className="text-[11px] font-semibold text-destructive">{errors.opening_hours.message}</p>
            )}
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
              <span>{updateMutation.isPending ? 'Saving Profile...' : 'Save Profile Changes'}</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
