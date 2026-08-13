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
} from '@hugeicons/core-free-icons';

export function PublicWaterPage() {
  const { data: products } = useWaterProducts(true);
  const createInquiryMutation = useCreateWaterEventInquiry();
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
    <div className="min-h-screen bg-[#06151F] text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      <Navbar />

      {/* Glassy Ocean Blue Hero Section */}
      <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden bg-gradient-to-b from-[#051724] via-[#09273B] to-[#06151F] text-white border-b border-sky-500/20">
        {/* Ambient Glowing Glass Orbs */}
        <div className="absolute top-10 left-1/4 w-[30rem] h-[30rem] bg-sky-500/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-[30rem] h-[30rem] bg-cyan-400/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/15 border border-sky-400/30 text-sky-300 text-xs font-bold shadow-lg shadow-sky-500/10 backdrop-blur-md">
            <HugeiconsIcon icon={DropletIcon} size={15} className="text-sky-400 animate-pulse" />
            <span>RadhaCafe Ecosystem — Pure Drinking Water Supply</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold font-heading tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-sky-100 to-cyan-300 max-w-3xl mx-auto leading-tight">
            RadhaWater Service
          </h1>

          <p className="text-sm sm:text-base text-sky-200/80 max-w-2xl mx-auto leading-relaxed">
            Hygienically purified 20 Litre drinking water cans delivered for daily household, commercial, wedding, and event supplies in Tallur.
          </p>

          {/* Glassmorphism Pricing Highlight Cards */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <div className="p-5 rounded-2xl bg-sky-950/40 backdrop-blur-2xl border border-sky-400/40 shadow-2xl text-left flex items-center gap-4 hover:border-sky-300 transition-all hover:scale-[1.02]">
              <div className="w-13 h-13 rounded-xl bg-gradient-to-br from-sky-500/30 to-cyan-500/30 text-sky-200 flex items-center justify-center font-bold text-2xl border border-sky-400/40 shadow-inner px-3 py-2">
                ₹{normalProduct.price}
              </div>
              <div>
                <p className="text-xs text-sky-300 font-bold uppercase tracking-wider font-heading">Normal 20L Can</p>
                <p className="text-base font-extrabold text-white">{formatCurrency(normalProduct.price)} / Can</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-cyan-950/40 backdrop-blur-2xl border border-cyan-400/40 shadow-2xl text-left flex items-center gap-4 hover:border-cyan-300 transition-all hover:scale-[1.02]">
              <div className="w-13 h-13 rounded-xl bg-gradient-to-br from-cyan-500/30 to-blue-500/30 text-cyan-200 flex items-center justify-center font-bold text-2xl border border-cyan-400/40 shadow-inner px-3 py-2">
                ₹{coolingProduct.price}
              </div>
              <div>
                <p className="text-xs text-cyan-300 font-bold uppercase tracking-wider font-heading">Cooling 20L Can</p>
                <p className="text-base font-extrabold text-white">{formatCurrency(coolingProduct.price)} / Can</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Glassy Services Grid Section */}
      <section className="py-16 bg-[#06151F] relative border-b border-sky-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 relative z-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-transparent bg-clip-text bg-gradient-to-r from-white to-sky-200">
              Bulk Supply for Events & Daily Delivery
            </h2>
            <p className="text-xs sm:text-sm text-sky-200/70 max-w-xl mx-auto">
              We cater to all water requirement scales, from single-can daily doorstep drops to multi-hundred can wedding supplies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border border-sky-500/25 bg-sky-950/25 backdrop-blur-md rounded-2xl shadow-xl hover:border-sky-400/60 hover:bg-sky-900/35 transition-all">
              <CardContent className="p-6 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500/20 to-cyan-500/20 text-sky-300 flex items-center justify-center border border-sky-400/30 shadow-inner">
                  <HugeiconsIcon icon={TruckIcon} size={24} />
                </div>
                <h3 className="font-bold text-base text-white font-heading">Daily Can Supply</h3>
                <p className="text-xs text-sky-200/70 leading-relaxed">
                  Regular daily doorstep delivery of Normal (₹5) & Chilled Cooling (₹30) 20 Litre drinking water cans for homes, shops, and offices.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-cyan-500/25 bg-cyan-950/25 backdrop-blur-md rounded-2xl shadow-xl hover:border-cyan-400/60 hover:bg-cyan-900/35 transition-all">
              <CardContent className="p-6 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 text-cyan-300 flex items-center justify-center border border-cyan-400/30 shadow-inner">
                  <HugeiconsIcon icon={SparklesIcon} size={24} />
                </div>
                <h3 className="font-bold text-base text-white font-heading">Weddings & Parties</h3>
                <p className="text-xs text-sky-200/70 leading-relaxed">
                  Bulk drinking water arrangements for marriage halls, birthday parties, reception functions, and family gatherings with timely delivery.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-sky-500/25 bg-sky-950/25 backdrop-blur-md rounded-2xl shadow-xl hover:border-sky-400/60 hover:bg-sky-900/35 transition-all">
              <CardContent className="p-6 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500/20 to-cyan-500/20 text-sky-300 flex items-center justify-center border border-sky-400/30 shadow-inner">
                  <HugeiconsIcon icon={Building01Icon} size={24} />
                </div>
                <h3 className="font-bold text-base text-white font-heading">Corporate & Institutions</h3>
                <p className="text-xs text-sky-200/70 leading-relaxed">
                  Scheduled water supply for corporate offices, banks, schools, and business establishments with monthly ledger billing.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Glassy Event Inquiry Form Section */}
      <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <Card className="border border-sky-500/30 bg-sky-950/30 backdrop-blur-2xl rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 text-white">
          <div className="space-y-2 text-center sm:text-left border-b border-sky-800/40 pb-4">
            <Badge className="bg-sky-500/20 text-sky-300 border-sky-400/30 text-xs font-bold px-3 py-1 mb-1">
              <HugeiconsIcon icon={SparklesIcon} size={14} className="mr-1 text-sky-400" /> Event Booking
            </Badge>
            <h2 className="text-2xl font-bold font-heading text-white">
              Book Bulk Water Supply for Your Event
            </h2>
            <p className="text-xs text-sky-200/70">
              Planning a wedding, party, or corporate event? Fill out the inquiry form below and our team will get back to you with custom pricing and delivery slots.
            </p>
          </div>

          {submittedSuccess ? (
            <div className="p-8 text-center space-y-4 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-200 backdrop-blur-md">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-inner border border-emerald-400/30">
                <HugeiconsIcon icon={CheckmarkCircle02Icon} size={32} />
              </div>
              <h3 className="text-xl font-bold font-heading text-white">Inquiry Submitted Successfully!</h3>
              <p className="text-xs max-w-md mx-auto leading-relaxed text-emerald-100/80">
                Thank you for choosing RadhaWater. Our team will contact you shortly to confirm your event water delivery schedule.
              </p>
              <Button
                type="button"
                size="sm"
                onClick={() => setSubmittedSuccess(false)}
                className="bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-white font-bold text-xs h-9 px-4 rounded-lg shadow-lg shadow-sky-500/25"
              >
                Submit Another Request
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-lg bg-destructive/20 text-red-300 border border-destructive/30 text-xs font-medium">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Your Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="req-name" className="text-xs font-semibold flex items-center gap-1.5 text-sky-200">
                    <HugeiconsIcon icon={UserIcon} size={14} className="text-sky-400" />
                    <span>Your Name *</span>
                  </Label>
                  <Input
                    id="req-name"
                    placeholder="e.g. Ananya Rao"
                    {...register('customer_name')}
                    className="h-10 text-xs bg-sky-950/50 border-sky-500/30 text-white placeholder:text-sky-200/40 rounded-xl focus:border-sky-400"
                  />
                  {errors.customer_name && (
                    <p className="text-[11px] text-red-400 font-medium">{errors.customer_name.message}</p>
                  )}
                </div>

                {/* Phone Number */}
                <div className="space-y-1.5">
                  <Label htmlFor="req-phone" className="text-xs font-semibold flex items-center gap-1.5 text-sky-200">
                    <HugeiconsIcon icon={SmartPhoneIcon} size={14} className="text-sky-400" />
                    <span>Phone Number *</span>
                  </Label>
                  <Input
                    id="req-phone"
                    type="tel"
                    placeholder="e.g. 9876543210"
                    {...register('phone')}
                    className="h-10 text-xs bg-sky-950/50 border-sky-500/30 text-white placeholder:text-sky-200/40 rounded-xl focus:border-sky-400"
                  />
                  {errors.phone && (
                    <p className="text-[11px] text-red-400 font-medium">{errors.phone.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Event Type */}
                <div className="space-y-1.5">
                  <Label htmlFor="req-type" className="text-xs font-semibold text-sky-200">
                    Event Type *
                  </Label>
                  <Input
                    id="req-type"
                    placeholder="e.g. Wedding / Birthday"
                    {...register('event_type')}
                    className="h-10 text-xs bg-sky-950/50 border-sky-500/30 text-white placeholder:text-sky-200/40 rounded-xl focus:border-sky-400"
                  />
                  {errors.event_type && (
                    <p className="text-[11px] text-red-400 font-medium">{errors.event_type.message}</p>
                  )}
                </div>

                {/* Event Date */}
                <div className="space-y-1.5">
                  <Label htmlFor="req-date" className="text-xs font-semibold flex items-center gap-1.5 text-sky-200">
                    <HugeiconsIcon icon={Calendar01Icon} size={14} className="text-sky-400" />
                    <span>Event Date *</span>
                  </Label>
                  <Popover>
                    <PopoverTrigger
                      render={
                        <Button
                          variant="outline"
                          className="w-full h-10 justify-start text-xs bg-sky-950/50 border-sky-500/30 text-white rounded-xl gap-2 px-3 font-normal hover:bg-sky-900/40"
                        />
                      }
                    >
                      <HugeiconsIcon icon={Calendar01Icon} size={14} className="text-sky-400" />
                      <span>
                        {watch('event_date')
                          ? formatDate(watch('event_date'), 'dd MMM yyyy')
                          : 'Select Event Date from Calendar'}
                      </span>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-auto p-0 rounded-xl bg-[#0A202D] border border-sky-500/30 shadow-2xl z-50 text-white">
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
                  <Label htmlFor="req-qty" className="text-xs font-semibold text-sky-200">
                    Estimated 20L Cans *
                  </Label>
                  <Input
                    id="req-qty"
                    type="number"
                    min={1}
                    {...register('estimated_quantity', { valueAsNumber: true })}
                    className="h-10 text-xs bg-sky-950/50 border-sky-500/30 text-white rounded-xl font-bold"
                  />
                  {errors.estimated_quantity && (
                    <p className="text-[11px] text-red-400 font-medium">{errors.estimated_quantity.message}</p>
                  )}
                </div>
              </div>

              {/* Delivery Location */}
              <div className="space-y-1.5">
                <Label htmlFor="req-loc" className="text-xs font-semibold flex items-center gap-1.5 text-sky-200">
                  <HugeiconsIcon icon={Location01Icon} size={14} className="text-sky-400" />
                  <span>Delivery Location / Venue Address *</span>
                </Label>
                <Input
                  id="req-loc"
                  placeholder="e.g. Royal Function Hall, Main Road, Tallur"
                  {...register('location')}
                  className="h-10 text-xs bg-sky-950/50 border-sky-500/30 text-white placeholder:text-sky-200/40 rounded-xl focus:border-sky-400"
                />
                {errors.location && (
                  <p className="text-[11px] text-red-400 font-medium">{errors.location.message}</p>
                )}
              </div>

              {/* Additional Message */}
              <div className="space-y-1.5">
                <Label htmlFor="req-notes" className="text-xs font-semibold text-sky-200">
                  Additional Notes (Optional)
                </Label>
                <Textarea
                  id="req-notes"
                  placeholder="e.g. Prefer 30 Normal cans and 20 Cooling cans with dispensers"
                  rows={3}
                  {...register('notes')}
                  className="text-xs bg-sky-950/50 border-sky-500/30 text-white placeholder:text-sky-200/40 rounded-xl resize-none"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || createInquiryMutation.isPending}
                className="w-full bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-600 hover:from-sky-400 hover:via-cyan-400 hover:to-blue-500 text-white font-bold h-11 text-sm rounded-xl shadow-lg shadow-sky-500/25 transition-all"
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
