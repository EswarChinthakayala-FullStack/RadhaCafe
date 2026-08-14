import { useCafeSettings } from '../../hooks/useCafeSettings';
import { Card, CardContent } from '../ui/card';
import { toast } from '../ui/toast';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  CallIcon,
  MapsIcon,
  Mail01Icon,
  Clock01Icon,
  Copy01Icon,
  ArrowUpRight01Icon,
} from '@hugeicons/core-free-icons';

export function ContactQuickActions() {
  const { data: settings } = useCafeSettings();

  const phone = settings?.phone || '09966630913';
  const email = settings?.email || 'radhacafe.tallur@gmail.com';
  const openingHours = settings?.opening_hours || 'Mon - Sun: 4:30 AM - 10:00 PM';
  const mapsUrl = 'https://maps.app.goo.gl/u6JadwVD4jGvgLnE9';

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.add({
        title: `${label} Copied!`,
        description: `${text} copied to your clipboard.`,
        type: 'success',
      });
    } catch {
      toast.add({
        title: label,
        description: text,
      });
    }
  };

  return (
    <section className="relative z-20 -mt-8 sm:-mt-10 max-w-6xl mx-auto px-4 sm:px-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Phone Action */}
        {phone && (
          <Card className="border border-[#3E2519]/70 bg-[#1D100A]/95 backdrop-blur-md rounded-2xl shadow-xl hover:border-[#E5A88B]/50 transition-all duration-300 group">
            <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#E5A88B]/10 text-[#E5A88B] flex items-center justify-center border border-[#E5A88B]/20 group-hover:scale-105 transition-transform">
                  <HugeiconsIcon icon={CallIcon} size={18} />
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(phone, 'Phone Number')}
                  className="p-1.5 rounded-lg text-cream/40 hover:text-cream hover:bg-white/5 transition-colors cursor-pointer"
                  title="Copy Phone Number"
                  aria-label="Copy Phone Number"
                >
                  <HugeiconsIcon icon={Copy01Icon} size={14} />
                </button>
              </div>

              <div>
                <p className="text-[10px] font-bold text-[#E5A88B] uppercase tracking-wider">
                  Call Cafe
                </p>
                <a
                  href={`tel:${phone.replace(/\s+/g, '')}`}
                  className="text-xs sm:text-sm font-bold text-cream hover:text-[#E5A88B] transition-colors line-clamp-1 mt-0.5"
                >
                  {phone}
                </a>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Directions Action */}
        <Card className="border border-[#3E2519]/70 bg-[#1D100A]/95 backdrop-blur-md rounded-2xl shadow-xl hover:border-[#E5A88B]/50 transition-all duration-300 group">
          <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#E5A88B]/10 text-[#E5A88B] flex items-center justify-center border border-[#E5A88B]/20 group-hover:scale-105 transition-transform">
                <HugeiconsIcon icon={MapsIcon} size={18} />
              </div>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg text-cream/40 hover:text-cream hover:bg-white/5 transition-colors cursor-pointer"
                title="Open Directions in Google Maps"
                aria-label="Open Directions in Google Maps"
              >
                <HugeiconsIcon icon={ArrowUpRight01Icon} size={14} />
              </a>
            </div>

            <div>
              <p className="text-[10px] font-bold text-[#E5A88B] uppercase tracking-wider">
                Directions
              </p>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs sm:text-sm font-bold text-cream hover:text-[#E5A88B] transition-colors line-clamp-1 mt-0.5 flex items-center gap-1"
              >
                <span>Google Maps</span>
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Email Action */}
        {email && (
          <Card className="border border-[#3E2519]/70 bg-[#1D100A]/95 backdrop-blur-md rounded-2xl shadow-xl hover:border-[#E5A88B]/50 transition-all duration-300 group">
            <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#E5A88B]/10 text-[#E5A88B] flex items-center justify-center border border-[#E5A88B]/20 group-hover:scale-105 transition-transform">
                  <HugeiconsIcon icon={Mail01Icon} size={18} />
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(email, 'Email Address')}
                  className="p-1.5 rounded-lg text-cream/40 hover:text-cream hover:bg-white/5 transition-colors cursor-pointer"
                  title="Copy Email Address"
                  aria-label="Copy Email Address"
                >
                  <HugeiconsIcon icon={Copy01Icon} size={14} />
                </button>
              </div>

              <div>
                <p className="text-[10px] font-bold text-[#E5A88B] uppercase tracking-wider">
                  Email
                </p>
                <a
                  href={`mailto:${email}`}
                  className="text-xs sm:text-sm font-bold text-cream hover:text-[#E5A88B] transition-colors line-clamp-1 mt-0.5"
                >
                  {email}
                </a>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Opening Hours Action */}
        {openingHours && (
          <Card className="border border-[#3E2519]/70 bg-[#1D100A]/95 backdrop-blur-md rounded-2xl shadow-xl hover:border-[#E5A88B]/50 transition-all duration-300 group">
            <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#E5A88B]/10 text-[#E5A88B] flex items-center justify-center border border-[#E5A88B]/20 group-hover:scale-105 transition-transform">
                  <HugeiconsIcon icon={Clock01Icon} size={18} />
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-[#E5A88B] uppercase tracking-wider">
                  Today's Hours
                </p>
                <p className="text-xs sm:text-sm font-bold text-cream line-clamp-1 mt-0.5">
                  {openingHours}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}
