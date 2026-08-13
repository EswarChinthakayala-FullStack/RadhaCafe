import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { waterEventInquirySchema, type WaterEventInquiryFormData } from '../../validators/waterSchema';
import { useCreateWaterEventInquiry } from '../../hooks/useWaterEvents';
import { useWaterProducts } from '../../hooks/useWaterProducts';
import { formatCurrency } from '../../lib/utils/formatCurrency';
import { formatDate } from '../../lib/utils/formatDate';
import { Navbar } from '../../components/landing/Navbar';
import { Footer } from '../../components/landing/Footer';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { Calendar } from '../../components/ui/calendar';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  DropletIcon,
  Calendar01Icon,
  SmartPhoneIcon,
  UserIcon,
  Location01Icon,
  CheckmarkCircle02Icon,
  TruckIcon,
  SparklesIcon,
  Building01Icon,
  Target01Icon,
  Loading03Icon,
} from '@hugeicons/core-free-icons';

export function PublicWaterPage() {
  const { data: products } = useWaterProducts(true);
  const createInquiryMutation = useCreateWaterEventInquiry();
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

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
        } catch (err) {
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

  const normalProduct = products?.find((p) => p.water_type === 'normal') || {
    name: 'RadhaWater Normal 20L Can',
    price: 5,
    description: 'Pure & fresh 20 Litre drinking water can',
  };

  const coolingProduct = products?.find((p) => p.water_type === 'cooling') || {
    name: 'RadhaWater Cooling Water',
    price: 30,
    description: 'Chilled 20 Litre cooling drinking water can',
  };

  return (
    <div className="min-h-screen bg-[#140A06] text-[#F5E6D3] flex flex-col font-sans">
      <Navbar />

      {/* Hero Section — Same warm espresso palette as RadhaCafe */}
      <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden bg-gradient-to-b from-[#0C0603] via-[#1C120C] to-[#140A06] text-white border-b border-[#E5A88B]/20">
        {/* Warm ambient glow orbs */}
        <div className="absolute top-10 left-1/4 w-[30rem] h-[30rem] bg-[#D9825B]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-[30rem] h-[30rem] bg-[#E5A88B]/8 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cinnamon/15 border border-cinnamon/30 text-cinnamon text-xs font-bold shadow-lg shadow-cinnamon/10 backdrop-blur-md">
            <HugeiconsIcon icon={DropletIcon} size={15} className="text-cinnamon" />
            <span>RadhaCafe Ecosystem — Pure Drinking Water Supply</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold font-heading tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#F5E6D3] via-white to-[#E5A88B] max-w-3xl mx-auto leading-tight">
            RadhaWater Service
          </h1>

          <p className="text-sm sm:text-base text-[#E5A88B]/80 max-w-2xl mx-auto leading-relaxed">
            Hygienically purified 20 Litre drinking water cans delivered for daily household, commercial, wedding, and event supplies in Tallur.
          </p>

          {/* Glassmorphism Pricing Cards */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <div className="p-5 rounded-md bg-[#2C1810]/60 backdrop-blur-2xl border border-cinnamon/30 shadow-2xl text-left flex items-center gap-4 hover:border-cinnamon/60 transition-all hover:scale-[1.02]">
              <div className="w-13 h-13 rounded-md bg-cinnamon/20 text-cinnamon flex items-center justify-center font-bold text-2xl border border-cinnamon/30 shadow-inner px-3 py-2">
                ₹{normalProduct.price}
              </div>
              <div>
                <p className="text-xs text-cinnamon font-bold uppercase tracking-wider font-heading">Normal 20L Can</p>
                <p className="text-base font-extrabold text-white">{formatCurrency(normalProduct.price)} / Can</p>
              </div>
            </div>

            <div className="p-5 rounded-md bg-[#2C1810]/60 backdrop-blur-2xl border border-amber-500/30 shadow-2xl text-left flex items-center gap-4 hover:border-amber-400/60 transition-all hover:scale-[1.02]">
              <div className="w-13 h-13 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-2xl border border-amber-500/30 shadow-inner px-3 py-2">
                ₹{coolingProduct.price}
              </div>
              <div>
                <p className="text-xs text-amber-300 font-bold uppercase tracking-wider font-heading">Cooling 20L Can</p>
                <p className="text-base font-extrabold text-white">{formatCurrency(coolingProduct.price)} / Can</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid Section */}
      <section className="py-16 bg-[#140A06] relative border-b border-[#E5A88B]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 relative z-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-transparent bg-clip-text bg-gradient-to-r from-[#F5E6D3] to-[#E5A88B]">
              Bulk Supply for Events & Daily Delivery
            </h2>
            <p className="text-xs sm:text-sm text-[#E5A88B]/60 max-w-xl mx-auto">
              We cater to all water requirement scales, from single-can daily doorstep drops to multi-hundred can wedding supplies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border border-cinnamon/20 bg-[#1C120C]/80 backdrop-blur-md rounded-md shadow-xl hover:border-cinnamon/50 hover:bg-[#2C1810]/60 transition-all">
              <CardContent className="p-6 space-y-3">
                <div className="w-12 h-12 rounded-md bg-cinnamon/15 text-cinnamon flex items-center justify-center border border-cinnamon/25 shadow-inner">
                  <HugeiconsIcon icon={TruckIcon} size={24} />
                </div>
                <h3 className="font-bold text-base text-[#F5E6D3] font-heading">Daily Can Supply</h3>
                <p className="text-xs text-[#E5A88B]/60 leading-relaxed">
                  Regular daily doorstep delivery of Normal (₹5) & Chilled Cooling (₹30) 20 Litre drinking water cans for homes, shops, and offices.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-amber-500/20 bg-[#1C120C]/80 backdrop-blur-md rounded-md shadow-xl hover:border-amber-500/50 hover:bg-[#2C1810]/60 transition-all">
              <CardContent className="p-6 space-y-3">
                <div className="w-12 h-12 rounded-md bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/25 shadow-inner">
                  <HugeiconsIcon icon={SparklesIcon} size={24} />
                </div>
                <h3 className="font-bold text-base text-[#F5E6D3] font-heading">Weddings & Parties</h3>
                <p className="text-xs text-[#E5A88B]/60 leading-relaxed">
                  Bulk drinking water arrangements for marriage halls, birthday parties, reception functions, and family gatherings with timely delivery.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-cinnamon/20 bg-[#1C120C]/80 backdrop-blur-md rounded-md shadow-xl hover:border-cinnamon/50 hover:bg-[#2C1810]/60 transition-all">
              <CardContent className="p-6 space-y-3">
                <div className="w-12 h-12 rounded-md bg-cinnamon/15 text-cinnamon flex items-center justify-center border border-cinnamon/25 shadow-inner">
                  <HugeiconsIcon icon={Building01Icon} size={24} />
                </div>
                <h3 className="font-bold text-base text-[#F5E6D3] font-heading">Corporate & Institutions</h3>
                <p className="text-xs text-[#E5A88B]/60 leading-relaxed">
                  Scheduled water supply for corporate offices, banks, schools, and business establishments with monthly ledger billing.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Event Inquiry Form Section */}
      <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <Card className="border border-cinnamon/25 bg-[#1C120C]/80 backdrop-blur-2xl rounded-md p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="space-y-2 text-center sm:text-left border-b border-[#E5A88B]/15 pb-4">
            <Badge className="bg-cinnamon/15 text-cinnamon border-cinnamon/30 text-xs font-bold px-3 py-1 mb-1">
              <HugeiconsIcon icon={SparklesIcon} size={14} className="mr-1 text-cinnamon" /> Event Booking
            </Badge>
            <h2 className="text-2xl font-bold font-heading text-[#F5E6D3]">
              Book Bulk Water Supply for Your Event
            </h2>
            <p className="text-xs text-[#E5A88B]/60">
              Planning a wedding, party, or corporate event? Fill out the inquiry form below and our team will get back to you with custom pricing and delivery slots.
            </p>
          </div>

          {submittedSuccess ? (
            <div className="p-8 text-center space-y-4 rounded-md bg-emerald-500/15 border border-emerald-500/25 backdrop-blur-md">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-inner border border-emerald-400/30">
                <HugeiconsIcon icon={CheckmarkCircle02Icon} size={32} />
              </div>
              <h3 className="text-xl font-bold font-heading text-[#F5E6D3]">Inquiry Submitted Successfully!</h3>
              <p className="text-xs max-w-md mx-auto leading-relaxed text-emerald-300/80">
                Thank you for choosing RadhaWater. Our team will contact you shortly to confirm your event water delivery schedule.
              </p>
              <Button
                type="button"
                size="sm"
                onClick={() => setSubmittedSuccess(false)}
                className="bg-cinnamon hover:bg-cinnamon/90 text-white font-bold text-xs h-9 px-4 rounded-lg shadow-lg shadow-cinnamon/25"
              >
                Submit Another Request
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-lg bg-red-500/15 text-red-300 border border-red-500/25 text-xs font-medium">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Your Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="req-name" className="text-xs font-semibold flex items-center gap-1.5 text-[#E5A88B]">
                    <HugeiconsIcon icon={UserIcon} size={14} className="text-cinnamon" />
                    <span>Your Name *</span>
                  </Label>
                  <Input
                    id="req-name"
                    placeholder="e.g. Ananya Rao"
                    {...register('customer_name')}
                    className="h-10 text-xs bg-[#0C0603]/60 border-cinnamon/25 text-[#F5E6D3] placeholder:text-[#E5A88B]/30 rounded-md focus:border-cinnamon"
                  />
                  {errors.customer_name && (
                    <p className="text-[11px] text-red-400 font-medium">{errors.customer_name.message}</p>
                  )}
                </div>

                {/* Phone Number */}
                <div className="space-y-1.5">
                  <Label htmlFor="req-phone" className="text-xs font-semibold flex items-center gap-1.5 text-[#E5A88B]">
                    <HugeiconsIcon icon={SmartPhoneIcon} size={14} className="text-cinnamon" />
                    <span>Phone Number *</span>
                  </Label>
                  <Input
                    id="req-phone"
                    type="tel"
                    placeholder="e.g. 9876543210"
                    {...register('phone')}
                    className="h-10 text-xs bg-[#0C0603]/60 border-cinnamon/25 text-[#F5E6D3] placeholder:text-[#E5A88B]/30 rounded-md focus:border-cinnamon"
                  />
                  {errors.phone && (
                    <p className="text-[11px] text-red-400 font-medium">{errors.phone.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Event Type */}
                <div className="space-y-1.5">
                  <Label htmlFor="req-type" className="text-xs font-semibold text-[#E5A88B]">
                    Event Type *
                  </Label>
                  <Input
                    id="req-type"
                    placeholder="e.g. Wedding / Birthday"
                    {...register('event_type')}
                    className="h-10 text-xs bg-[#0C0603]/60 border-cinnamon/25 text-[#F5E6D3] placeholder:text-[#E5A88B]/30 rounded-md focus:border-cinnamon"
                  />
                  {errors.event_type && (
                    <p className="text-[11px] text-red-400 font-medium">{errors.event_type.message}</p>
                  )}
                </div>

                {/* Event Date */}
                <div className="space-y-1.5">
                  <Label htmlFor="req-date" className="text-xs font-semibold flex items-center gap-1.5 text-[#E5A88B]">
                    <HugeiconsIcon icon={Calendar01Icon} size={14} className="text-cinnamon" />
                    <span>Event Date *</span>
                  </Label>
                  <Popover>
                    <PopoverTrigger
                      render={
                        <Button
                          variant="outline"
                          className="w-full h-10 justify-start text-xs bg-[#0C0603]/60 border-cinnamon/25 text-[#F5E6D3] rounded-md gap-2 px-3 font-normal hover:bg-[#1C120C]/60"
                        />
                      }
                    >
                      <HugeiconsIcon icon={Calendar01Icon} size={14} className="text-cinnamon" />
                      <span>
                        {watch('event_date')
                          ? formatDate(watch('event_date'), 'dd MMM yyyy')
                          : 'Select Event Date from Calendar'}
                      </span>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-auto p-0 rounded-md bg-[#1C120C] border border-cinnamon/30 shadow-2xl z-50">
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
                    className="h-10 text-xs bg-[#0C0603]/60 border-cinnamon/25 text-[#F5E6D3] rounded-md font-bold"
                  />
                  {errors.estimated_quantity && (
                    <p className="text-[11px] text-red-400 font-medium">{errors.estimated_quantity.message}</p>
                  )}
                </div>
              </div>

              {/* Delivery Location with Auto Detect */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="req-loc" className="text-xs font-semibold flex items-center gap-1.5 text-[#E5A88B]">
                    <HugeiconsIcon icon={Location01Icon} size={14} className="text-cinnamon" />
                    <span>Delivery Location / Venue Address *</span>
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleDetectLocation}
                    disabled={isLocating}
                    className="h-7 text-[11px] px-2.5 text-cinnamon hover:text-cinnamon hover:bg-cinnamon/15 border border-cinnamon/30 rounded-lg flex items-center gap-1.5 transition-all shadow-2xs"
                  >
                    {isLocating ? (
                      <>
                        <HugeiconsIcon icon={Loading03Icon} size={13} className="animate-spin text-cinnamon" />
                        <span>Detecting Location...</span>
                      </>
                    ) : (
                      <>
                        <HugeiconsIcon icon={Target01Icon} size={13} className="text-cinnamon" />
                        <span>Auto-Detect Location</span>
                      </>
                    )}
                  </Button>
                </div>
                <div className="relative">
                  <Input
                    id="req-loc"
                    placeholder="e.g. Royal Function Hall, Main Road, Tallur"
                    {...register('location')}
                    className="h-10 text-xs bg-[#0C0603]/60 border-cinnamon/25 text-[#F5E6D3] placeholder:text-[#E5A88B]/30 rounded-md focus:border-cinnamon pr-10"
                  />
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={isLocating}
                    title="Auto-detect location using GPS"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#E5A88B]/60 hover:text-cinnamon transition-colors disabled:opacity-50"
                  >
                    <HugeiconsIcon
                      icon={isLocating ? Loading03Icon : Target01Icon}
                      size={16}
                      className={isLocating ? 'animate-spin text-cinnamon' : ''}
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

              {/* Additional Message */}
              <div className="space-y-1.5">
                <Label htmlFor="req-notes" className="text-xs font-semibold text-[#E5A88B]">
                  Additional Notes (Optional)
                </Label>
                <Textarea
                  id="req-notes"
                  placeholder="e.g. Prefer 30 Normal cans and 20 Cooling cans with dispensers"
                  rows={3}
                  {...register('notes')}
                  className="text-xs bg-[#0C0603]/60 border-cinnamon/25 text-[#F5E6D3] placeholder:text-[#E5A88B]/30 rounded-md resize-none"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || createInquiryMutation.isPending}
                className="w-full bg-cinnamon hover:bg-cinnamon/90 text-white font-bold h-11 text-sm rounded-md shadow-lg shadow-cinnamon/25 transition-all"
              >
                {isSubmitting || createInquiryMutation.isPending
                  ? 'Submitting Inquiry...'
                  : 'Submit Event Inquiry Request'}
              </Button>
            </form>
          )}
        </Card>
      </section>

      <Footer />
    </div>
  );
}
