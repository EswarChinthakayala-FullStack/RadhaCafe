import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useCafeSettings, useUpdateCafeSettings } from '../../../hooks/useSettings';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Button } from '../../ui/button';
import { Loader } from '../../shared/Loader';
import type { CafeSettings } from '../../../lib/supabase/queries/settings';

export function CafeSettingsForm() {
  const { data: settings, isLoading } = useCafeSettings();
  const updateMutation = useUpdateCafeSettings();

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { register, handleSubmit, setValue } = useForm<CafeSettings>({
    defaultValues: {
      cafe_name: 'RadhaCafe',
      tagline: 'Artisanal Coffee & Warm Hospitality',
      about_text: 'Crafted with Passion & Traditional Roast',
      address: 'Main Market Road, City Center',
      phone: '+91 98765 43210',
      email: 'contact@radhacafe.com',
      opening_hours: 'Mon - Sun: 8:00 AM - 10:00 PM',
      tax_percentage: 0.0,
      currency: 'INR',
    },
  });

  useEffect(() => {
    if (settings) {
      if (settings.cafe_name) setValue('cafe_name', settings.cafe_name);
      if (settings.tagline) setValue('tagline', settings.tagline);
      if (settings.about_text) setValue('about_text', settings.about_text);
      if (settings.address) setValue('address', settings.address);
      if (settings.phone) setValue('phone', settings.phone);
      if (settings.email) setValue('email', settings.email);
      if (settings.opening_hours) setValue('opening_hours', settings.opening_hours);
    }
  }, [settings, setValue]);

  const onSubmit = async (formData: CafeSettings) => {
    if (!formData.cafe_name || !formData.cafe_name.trim()) {
      setErrorMsg('Cafe Brand Name is required.');
      return;
    }

    try {
      setErrorMsg(null);
      setSuccessMsg(null);

      await updateMutation.mutateAsync({
        cafe_name: formData.cafe_name.trim(),
        tagline: formData.tagline ? formData.tagline.trim() : null,
        about_text: formData.about_text ? formData.about_text.trim() : null,
        address: formData.address ? formData.address.trim() : null,
        phone: formData.phone ? formData.phone.trim() : null,
        email: formData.email ? formData.email.trim() : null,
        opening_hours: formData.opening_hours ? formData.opening_hours.trim() : null,
      });

      setSuccessMsg('Cafe details updated successfully.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update cafe details.');
    }
  };

  if (isLoading) return <Loader label="Loading cafe store configuration..." />;

  return (
    <Card className="border-border/80 bg-card shadow-sm max-w-2xl">
      <CardHeader>
        <CardTitle className="text-base font-bold font-heading text-foreground">General Cafe Details</CardTitle>
        <CardDescription className="text-xs">
          Public brand information, address, contact details, and operating hours.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded bg-destructive/10 text-destructive border border-destructive/20 font-medium">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded bg-success/10 text-success border border-success/20 font-medium">
              {successMsg}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="cname" className="font-bold">Cafe Brand Name</Label>
            <Input id="cname" placeholder="RadhaCafe" {...register('cafe_name')} required />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tagline" className="font-bold">Tagline</Label>
            <Input id="tagline" placeholder="Fresh Coffee. Warm Moments." {...register('tagline')} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="about" className="font-bold">About RadhaCafe</Label>
            <Textarea
              id="about"
              rows={3}
              placeholder="Tell visitors about RadhaCafe and what makes your specialty coffee special..."
              {...register('about_text')}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="addr" className="font-bold">Cafe Physical Address</Label>
            <Textarea id="addr" rows={2} placeholder="Main Market Road, City Center" {...register('address')} />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="ph" className="font-bold">Contact Phone Number</Label>
              <Input id="ph" placeholder="+91 98765 43210" {...register('phone')} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="em" className="font-bold">Email Address</Label>
              <Input id="em" type="email" placeholder="contact@radhacafe.com" {...register('email')} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="oh" className="font-bold">Opening Hours</Label>
            <Input id="oh" placeholder="Mon - Sun: 8:00 AM - 10:00 PM" {...register('opening_hours')} />
          </div>

          <div className="pt-2 border-t border-border flex justify-end">
            <Button type="submit" size="sm" className="bg-primary text-white font-bold" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving Cafe Details...' : 'Save Cafe Details'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
