import { useState } from 'react';
import { useCafeSettings } from '../../hooks/useCafeSettings';
import { LiveCafeTime } from './LiveCafeTime';
import { Card, CardContent } from '../ui/card';
import { toast } from '../ui/toast';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Location01Icon,
  MapsIcon,
  Clock01Icon,
  Copy01Icon,
  Share01Icon,
  Coffee02Icon,
  ArrowUpRight01Icon,
} from '@hugeicons/core-free-icons';

export function VisitSection() {
  const { data: settings } = useCafeSettings();
  const [mapError, setMapError] = useState(false);

  const rawAddress = settings?.address;
  const address =
    !rawAddress || rawAddress.includes('Main Market')
      ? '1A, Vellampalli Tallur Rd, opposite Pattu Office, Tallur, Andhra Pradesh 523264'
      : rawAddress;

  const openingHours = settings?.opening_hours || 'Mon - Sun: 4:30 AM - 10:00 PM';
  const mapsUrl = 'https://maps.app.goo.gl/u6JadwVD4jGvgLnE9';
  const embedMapUrl =
    'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d1284.3586424239338!2d79.88240280763426!3d15.736034450513579!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a4aef0070bba351%3A0xe350adeebc955989!2sRadha%20cafe!5e0!3m2!1sen!2sin!4v1786560166554!5m2!1sen!2sin';

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address);
      toast.add({
        title: 'Address Copied!',
        description: 'Cafe address copied to your clipboard.',
        type: 'success',
      });
    } catch {
      toast.add({
        title: 'RadhaCafe Address',
        description: address,
      });
    }
  };

  const handleShareLocation = async () => {
    const shareData = {
      title: 'RadhaCafe Location in Tallur',
      text: `Visit RadhaCafe: ${address}`,
      url: mapsUrl,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    handleCopyAddress();
  };

  return (
    <section id="visit-details" className="space-y-8 pt-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#2C1810]">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5A88B]/10 border border-[#E5A88B]/25 text-[#E5A88B] text-[11px] font-bold tracking-[0.2em] uppercase">
            <HugeiconsIcon icon={Location01Icon} size={13} className="text-[#E5A88B]" />
            <span>LOCATION & SCHEDULE</span>
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-cream leading-tight">
            Plan Your Visit to{' '}
            <span className="font-serif italic font-normal text-[#E5A88B]">RadhaCafe</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#EAD5C3]/75 leading-relaxed">
            Conveniently located on Vellampalli Tallur Road with easy road access and welcoming seating.
          </p>
        </div>

        <div className="shrink-0">
          <LiveCafeTime />
        </div>
      </div>

      {/* Asymmetric Editorial Grid: Left Details (5 cols), Right Map (7 cols) */}
      <div className="grid lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Column: Detailed Address & Schedule */}
        <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
          {/* Address Card */}
          <Card className="border border-[#3E2519]/70 bg-[#1D100A]/95 rounded-2xl shadow-xl p-6 space-y-4">
            <CardContent className="p-0 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#E5A88B]/10 text-[#E5A88B] flex items-center justify-center border border-[#E5A88B]/20">
                    <HugeiconsIcon icon={Location01Icon} size={18} />
                  </div>
                  <h3 className="font-heading font-bold text-base text-cream">
                    Cafe Address
                  </h3>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleCopyAddress}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-cream/70 hover:text-white transition-colors cursor-pointer"
                    title="Copy Address"
                    aria-label="Copy Address"
                  >
                    <HugeiconsIcon icon={Copy01Icon} size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={handleShareLocation}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-cream/70 hover:text-white transition-colors cursor-pointer"
                    title="Share Location"
                    aria-label="Share Location"
                  >
                    <HugeiconsIcon icon={Share01Icon} size={15} />
                  </button>
                </div>
              </div>

              <p className="text-sm sm:text-base text-cream font-medium leading-relaxed">
                {address}
              </p>

              <div className="pt-3 border-t border-[#3E2519]/70 flex items-center justify-between">
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E5A88B] hover:text-[#EEB89D] transition-colors group"
                >
                  <span>Open in Google Maps</span>
                  <HugeiconsIcon icon={ArrowUpRight01Icon} size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </a>
                <span className="text-[11px] text-cream/40 font-mono">Opposite Pattu Office</span>
              </div>
            </CardContent>
          </Card>

          {/* Opening Hours & Atmosphere Note */}
          <Card className="border border-[#3E2519]/70 bg-[#1D100A]/95 rounded-2xl shadow-xl p-6 space-y-4">
            <CardContent className="p-0 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#E5A88B]/10 text-[#E5A88B] flex items-center justify-center border border-[#E5A88B]/20">
                  <HugeiconsIcon icon={Clock01Icon} size={18} />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-cream">
                    Opening Hours
                  </h3>
                  <p className="text-[11px] text-[#E5A88B] font-semibold">Open Every Day</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#140A06] border border-[#3E2519]/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-cream/50 uppercase tracking-wider block">
                    Daily Schedule
                  </span>
                  <span className="text-sm font-bold text-cream font-mono">
                    {openingHours}
                  </span>
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" title="Active Service" />
              </div>

              <div className="flex items-center gap-2 text-xs text-[#EAD5C3]/75 pt-1">
                <HugeiconsIcon icon={Coffee02Icon} size={14} className="text-[#E5A88B] shrink-0" />
                <span>Filter coffee, snacks, tea, and beverages served continuously.</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Responsive Interactive Map View */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="overflow-hidden rounded-2xl border border-[#3E2519]/80 shadow-2xl bg-[#1D100A] h-full min-h-[380px] lg:min-h-[440px] relative flex flex-col justify-between">
            {mapError ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4 bg-[#1C100B]">
                <div className="w-14 h-14 rounded-2xl bg-[#E5A88B]/10 text-[#E5A88B] flex items-center justify-center mx-auto border border-[#E5A88B]/20">
                  <HugeiconsIcon icon={Location01Icon} size={28} />
                </div>
                <div className="space-y-1 max-w-sm">
                  <h3 className="font-heading font-bold text-lg text-cream">
                    RadhaCafe &middot; Tallur
                  </h3>
                  <p className="text-xs text-[#EAD5C3]/75 leading-relaxed">
                    {address}
                  </p>
                </div>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#B85C1E] to-[#D97026] text-white font-bold text-xs shadow-xl shadow-[#B85C1E]/25 transition-all hover:scale-105 active:scale-95"
                >
                  <HugeiconsIcon icon={MapsIcon} size={15} />
                  <span>Get Directions on Google Maps</span>
                </a>
              </div>
            ) : (
              <iframe
                src={embedMapUrl}
                className="w-full h-full min-h-[380px] lg:min-h-[440px] border-0"
                allowFullScreen
                loading="lazy"
                onError={() => setMapError(true)}
                referrerPolicy="strict-origin-when-cross-origin"
                title="RadhaCafe Tallur Location Map"
              />
            )}

            {/* Bottom Map Bar */}
            <div className="p-3.5 bg-[#140A06]/95 border-t border-[#3E2519]/80 backdrop-blur-md flex items-center justify-between text-xs">
              <span className="text-cream/70 text-[11px] truncate mr-2">
                Coordinates: Tallur, Andhra Pradesh 523264
              </span>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-bold text-[#E5A88B] hover:underline shrink-0"
              >
                <HugeiconsIcon icon={MapsIcon} size={13} />
                <span>Open Full Map</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
