import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { waterEventInquirySchema, type WaterEventInquiryFormData } from '../../../validators/waterSchema';
import { useCreateWaterEventInquiry } from '../../../hooks/useWaterEvents';
import { formatDate } from '../../../lib/utils/formatDate';
import { ScrollReveal } from '../../shared/ScrollReveal';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';
import { Calendar } from '../../ui/calendar';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Calendar01Icon,
  SmartPhoneIcon,
  UserIcon,
  Location01Icon,
  CheckmarkCircle02Icon,
  SparklesIcon,
  Target01Icon,
  Loading03Icon,
} from '@hugeicons/core-free-icons';

export function WaterEventForm() {
  const createInquiryMutation = useCreateWaterEventInquiry();
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<WaterEventInquiryFormData>({
    resolver: zodResolver(waterEventInquirySchema),
    defaultValues: {
      customer_name: '',
      phone: '',
      event_type: 'Wedding',
      event_date: '',
      estimated_quantity: 50,
      location: '',
      notes: '',
    },
  });

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

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

          setValue('location', addressStr, { shouldValidate: true });
        } catch {
          setLocationError('Failed to fetch location address name. Please type your location.');
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError('Location permission denied. Please enter your address manually.');
        } else {
          setLocationError('Could not detect location. Please enter address manually.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const onSubmit = async (data: WaterEventInquiryFormData) => {
    setErrorMsg(null);
    try {
      await createInquiryMutation.mutateAsync({
        customer_name: data.customer_name,
        phone: data.phone,
        event_type: data.event_type,
        event_date: data.event_date,
        estimated_quantity: data.estimated_quantity,
        location: data.location,
        notes: data.notes || null,
      });
      setSubmittedSuccess(true);
      reset();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit inquiry. Please try again.');
    }
  };

  return (
    <section
      id="event-form"
      className="py-20 sm:py-28 bg-[#140A06] text-cream border-b border-[#2C1810] relative overflow-hidden"
      aria-label="Event Water Requirement Booking Form"
    >
      <div className="container px-4 md:px-8 max-w-4xl mx-auto relative z-10 space-y-8">
        <ScrollReveal>
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B85C1E]/15 border border-[#B85C1E]/30 text-[#E5A88B] text-[11px] font-bold tracking-[0.2em] uppercase">
              <HugeiconsIcon icon={SparklesIcon} size={13} />
              <span>Direct Public Inquiry</span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-cream leading-tight">
              Request Water Supply for{' '}
              <span className="font-serif italic font-normal text-[#E5A88B]">
                Your Occasion.
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-[#EAD5C3]/75 max-w-lg mx-auto leading-relaxed">
              Fill in your event details below and our team will get in touch directly to confirm logistics and delivery timings.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="p-6 sm:p-10 rounded-2xl bg-[#1C100B]/90 border border-[#3E2519]/70 shadow-2xl backdrop-blur-xl space-y-6">
            {submittedSuccess ? (
              <div className="p-8 text-center space-y-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-md">
                <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-inner border border-emerald-400/30">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} size={32} />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold font-heading text-white">
                  Inquiry Received Successfully!
                </h3>
                <p className="text-xs sm:text-sm max-w-md mx-auto leading-relaxed text-emerald-200/80">
                  Thank you for contacting RadhaWater. Our delivery team will review your requirement and call you at the provided phone number to confirm your schedule.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setSubmittedSuccess(false)}
                    className="inline-flex items-center justify-center bg-[#B85C1E] hover:bg-[#D97026] text-white font-bold text-xs h-10 px-6 rounded-full shadow-lg transition-all cursor-pointer"
                  >
                    Submit Another Requirement
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {errorMsg && (
                  <div className="p-3.5 rounded-xl bg-red-500/15 text-red-300 border border-red-500/30 text-xs font-medium">
                    {errorMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  {/* Customer Name */}
                  <div className="space-y-1.5">
                    <Label htmlFor="req-name" className="text-xs font-semibold flex items-center gap-1.5 text-[#E5A88B]">
                      <HugeiconsIcon icon={UserIcon} size={14} className="text-[#E5A88B]" />
                      <span>Your Name *</span>
                    </Label>
                    <Input
                      id="req-name"
                      placeholder="e.g. Ramesh Varma"
                      {...register('customer_name')}
                      className="h-11 text-xs bg-[#0E0604]/80 border-[#3E2519]/70 text-cream placeholder:text-[#EAD5C3]/30 rounded-xl focus:border-[#E5A88B]"
                    />
                    {errors.customer_name && (
                      <p className="text-[11px] text-red-400 font-medium">{errors.customer_name.message}</p>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-1.5">
                    <Label htmlFor="req-phone" className="text-xs font-semibold flex items-center gap-1.5 text-[#E5A88B]">
                      <HugeiconsIcon icon={SmartPhoneIcon} size={14} className="text-[#E5A88B]" />
                      <span>Phone Number *</span>
                    </Label>
                    <Input
                      id="req-phone"
                      type="tel"
                      placeholder="e.g. 9876543210"
                      {...register('phone')}
                      className="h-11 text-xs bg-[#0E0604]/80 border-[#3E2519]/70 text-cream placeholder:text-[#EAD5C3]/30 rounded-xl focus:border-[#E5A88B]"
                    />
                    {errors.phone && (
                      <p className="text-[11px] text-red-400 font-medium">{errors.phone.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
                  {/* Event Type */}
                  <div className="space-y-1.5">
                    <Label htmlFor="req-type" className="text-xs font-semibold text-[#E5A88B]">
                      Event Type *
                    </Label>
                    <Input
                      id="req-type"
                      placeholder="e.g. Wedding / Function"
                      {...register('event_type')}
                      className="h-11 text-xs bg-[#0E0604]/80 border-[#3E2519]/70 text-cream placeholder:text-[#EAD5C3]/30 rounded-xl focus:border-[#E5A88B]"
                    />
                    {errors.event_type && (
                      <p className="text-[11px] text-red-400 font-medium">{errors.event_type.message}</p>
                    )}
                  </div>

                  {/* Event Date */}
                  <div className="space-y-1.5">
                    <Label htmlFor="req-date" className="text-xs font-semibold flex items-center gap-1.5 text-[#E5A88B]">
                      <HugeiconsIcon icon={Calendar01Icon} size={14} className="text-[#E5A88B]" />
                      <span>Event Date *</span>
                    </Label>
                    <Popover>
                      <PopoverTrigger
                        render={
                          <Button
                            variant="outline"
                            className="w-full h-11 justify-start text-xs bg-[#0E0604]/80 border-[#3E2519]/70 text-cream rounded-xl gap-2 px-3 font-normal hover:bg-[#1C100B]"
                          />
                        }
                      >
                        <HugeiconsIcon icon={Calendar01Icon} size={14} className="text-[#E5A88B]" />
                        <span>
                          {watch('event_date')
                            ? formatDate(watch('event_date'), 'dd MMM yyyy')
                            : 'Select Date'}
                        </span>
                      </PopoverTrigger>
                      <PopoverContent align="start" className="w-auto p-0 rounded-xl bg-[#1C100B] border border-[#3E2519] shadow-2xl z-50">
                        <Calendar
                          mode="single"
                          selected={watch('event_date') ? new Date(watch('event_date') + 'T00:00:00') : undefined}
                          onSelect={(date) => {
                            if (date) {
                              const yyyy = date.getFullYear();
                              const mm = String(date.getMonth() + 1).padStart(2, '0');
                              const dd = String(date.getDate()).padStart(2, '0');
                              setValue('event_date', `${yyyy}-${mm}-${dd}`, { shouldValidate: true });
                            }
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                    {errors.event_date && (
                      <p className="text-[11px] text-red-400 font-medium">{errors.event_date.message}</p>
                    )}
                  </div>

                  {/* Estimated Cans */}
                  <div className="space-y-1.5">
                    <Label htmlFor="req-qty" className="text-xs font-semibold text-[#E5A88B]">
                      Estimated 20L Cans *
                    </Label>
                    <Input
                      id="req-qty"
                      type="number"
                      min={1}
                      {...register('estimated_quantity', { valueAsNumber: true })}
                      className="h-11 text-xs bg-[#0E0604]/80 border-[#3E2519]/70 text-cream rounded-xl font-bold font-mono focus:border-[#E5A88B]"
                    />
                    {errors.estimated_quantity && (
                      <p className="text-[11px] text-red-400 font-medium">{errors.estimated_quantity.message}</p>
                    )}
                  </div>
                </div>

                {/* Delivery Location with Auto Detect */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2 pb-0.5">
                    <Label htmlFor="req-loc" className="font-bold text-xs text-cream flex items-center gap-1.5 min-w-0">
                      <HugeiconsIcon icon={Location01Icon} size={14} className="text-[#E5A88B] shrink-0" />
                      <span className="truncate sm:hidden">Delivery Location *</span>
                      <span className="hidden sm:inline">Delivery Location / Venue Address *</span>
                    </Label>
                    <button
                      type="button"
                      onClick={handleDetectLocation}
                      disabled={isLocating}
                      className="h-7 text-[11px] px-2.5 text-[#E5A88B] hover:text-white hover:bg-[#B85C1E]/20 border border-[#B85C1E]/30 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shrink-0 whitespace-nowrap"
                    >
                      {isLocating ? (
                        <>
                          <HugeiconsIcon icon={Loading03Icon} size={13} className="animate-spin text-[#E5A88B]" />
                          <span>Detecting...</span>
                        </>
                      ) : (
                        <>
                          <HugeiconsIcon icon={Target01Icon} size={13} className="text-[#E5A88B]" />
                          <span>Auto-Detect GPS</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      id="req-loc"
                      placeholder="e.g. Royal Kalyana Mandapam, Main Road, Tallur"
                      {...register('location')}
                      className="h-11 text-xs bg-[#0E0604]/80 border-[#3E2519]/70 text-cream placeholder:text-[#EAD5C3]/30 rounded-xl focus:border-[#E5A88B] pr-10"
                    />
                    <button
                      type="button"
                      onClick={handleDetectLocation}
                      disabled={isLocating}
                      title="Auto-detect location using GPS"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#E5A88B]/60 hover:text-[#E5A88B] transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <HugeiconsIcon
                        icon={isLocating ? Loading03Icon : Target01Icon}
                        size={16}
                        className={isLocating ? 'animate-spin text-[#E5A88B]' : ''}
                      />
                    </button>
                  </div>
                  {locationError && (
                    <p className="text-[11px] text-amber-400 font-medium">{locationError}</p>
                  )}
                  {errors.location && (
                    <p className="text-[11px] text-red-400 font-medium">{errors.location.message}</p>
                  )}
                </div>

                {/* Additional Notes */}
                <div className="space-y-1.5">
                  <Label htmlFor="req-notes" className="text-xs font-semibold text-[#E5A88B]">
                    Additional Notes (Optional)
                  </Label>
                  <Textarea
                    id="req-notes"
                    placeholder="e.g. Prefer 40 Normal cans and 20 Cooling cans with dispensers for wedding dinner"
                    rows={3}
                    {...register('notes')}
                    className="text-xs bg-[#0E0604]/80 border-[#3E2519]/70 text-cream placeholder:text-[#EAD5C3]/30 rounded-xl resize-none focus:border-[#E5A88B]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || createInquiryMutation.isPending}
                  className="w-full bg-gradient-to-r from-[#B85C1E] to-[#D97026] hover:from-[#C86624] hover:to-[#E87E34] text-white font-bold h-12 text-sm rounded-xl shadow-lg shadow-[#B85C1E]/25 transition-all cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting || createInquiryMutation.isPending
                    ? 'Submitting Requirement...'
                    : 'Submit Event Water Inquiry'}
                </button>
              </form>
            )}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
