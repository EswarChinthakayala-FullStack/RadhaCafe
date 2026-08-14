import { useCafeSettings } from '../../hooks/useCafeSettings';
import { Card, CardContent } from '../ui/card';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Location01Icon,
  Clock01Icon,
  CallIcon,
  Mail01Icon,
  MapsIcon,
} from '@hugeicons/core-free-icons';

export function ContactInfoCards() {
  const { data: settings } = useCafeSettings();

  const rawAddress = settings?.address;
  const address =
    !rawAddress || rawAddress.includes('Main Market')
      ? '1A, Vellampalli Tallur Rd, opposite Pattu Office, Tallur, Talluru, Andhra Pradesh 523264'
      : rawAddress;

  const phone = settings?.phone || '09966630913';
  const email = settings?.email || 'radhacafe.tallur@gmail.com';
  const openingHours = settings?.opening_hours || 'Mon - Sun: 4:30 AM - 10:00 PM';
  const mapsUrl = 'https://maps.app.goo.gl/u6JadwVD4jGvgLnE9';

  return (
    <div className="grid sm:grid-cols-3 gap-6 text-left">
      {/* Address Card */}
      {address && (
        <Card className="border border-[#3E2519]/70 bg-[#1D100A]/90 rounded-2xl shadow-lg hover:border-[#E5A88B]/50 transition-all duration-300 flex flex-col justify-between group">
          <CardContent className="p-6 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#E5A88B]/15 text-[#E5A88B] flex items-center justify-center group-hover:scale-110 transition-transform shrink-0 border border-[#E5A88B]/20">
              <HugeiconsIcon icon={Location01Icon} size={22} />
            </div>

            <div className="space-y-1">
              <h3 className="font-heading font-bold text-base text-cream">
                Address & Location
              </h3>
              <p className="text-xs text-[#EAD5C3]/75 leading-relaxed">{address}</p>
            </div>

            <div className="pt-3 border-t border-[#3E2519]/70">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E5A88B] hover:underline"
              >
                <HugeiconsIcon icon={MapsIcon} size={14} />
                <span>Get Directions</span>
              </a>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Opening Hours Card */}
      {openingHours && (
        <Card className="border border-[#3E2519]/70 bg-[#1D100A]/90 rounded-2xl shadow-lg hover:border-[#E5A88B]/50 transition-all duration-300 flex flex-col justify-between group">
          <CardContent className="p-6 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#E5A88B]/15 text-[#E5A88B] flex items-center justify-center group-hover:scale-110 transition-transform shrink-0 border border-[#E5A88B]/20">
              <HugeiconsIcon icon={Clock01Icon} size={22} />
            </div>

            <div className="space-y-1">
              <h3 className="font-heading font-bold text-base text-cream">
                Opening Hours
              </h3>
              <p className="text-xs text-[#EAD5C3]/75 leading-relaxed">{openingHours}</p>
            </div>

            <div className="pt-3 border-t border-[#3E2519]/70">
              <span className="text-[11px] font-bold text-[#E5A88B] uppercase tracking-wider">
                Fresh Brews Served All Day
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Phone & Email Card */}
      {(phone || email) && (
        <Card className="border border-[#3E2519]/70 bg-[#1D100A]/90 rounded-2xl shadow-lg hover:border-[#E5A88B]/50 transition-all duration-300 flex flex-col justify-between group">
          <CardContent className="p-6 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#E5A88B]/15 text-[#E5A88B] flex items-center justify-center group-hover:scale-110 transition-transform shrink-0 border border-[#E5A88B]/20">
              <HugeiconsIcon icon={CallIcon} size={22} />
            </div>

            <div className="space-y-2">
              <h3 className="font-heading font-bold text-base text-cream">
                Direct Contact
              </h3>

              <div className="space-y-2 text-xs text-[#EAD5C3]/80">
                {phone && (
                  <a
                    href={`tel:${phone.replace(/\s+/g, '')}`}
                    className="flex items-center gap-2 hover:text-[#E5A88B] transition-colors font-medium"
                  >
                    <HugeiconsIcon icon={CallIcon} size={14} className="text-[#E5A88B] shrink-0" />
                    <span>{phone}</span>
                  </a>
                )}
                {email && (
                  <a
                    href={`mailto:${email}`}
                    className="flex items-center gap-2 hover:text-[#E5A88B] transition-colors font-medium break-all"
                  >
                    <HugeiconsIcon icon={Mail01Icon} size={14} className="text-[#E5A88B] shrink-0" />
                    <span>{email}</span>
                  </a>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-[#3E2519]/70 flex items-center gap-3">
              {phone && (
                <a
                  href={`tel:${phone.replace(/\s+/g, '')}`}
                  className="text-xs font-bold text-[#E5A88B] hover:underline"
                >
                  Call Us
                </a>
              )}
              {phone && email && <span className="text-cream/30 text-xs">&middot;</span>}
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="text-xs font-bold text-[#E5A88B] hover:underline"
                >
                  Send Email
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
