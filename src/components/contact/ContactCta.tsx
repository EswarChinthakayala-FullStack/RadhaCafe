import { useCafeSettings } from '../../hooks/useCafeSettings';
import { HugeiconsIcon } from '@hugeicons/react';
import { CallIcon, MapsIcon, Mail01Icon } from '@hugeicons/core-free-icons';

export function ContactCta() {
  const { data: settings } = useCafeSettings();

  const phone = settings?.phone || '09966630913';
  const email = settings?.email || 'radhacafe.tallur@gmail.com';
  const mapsUrl = 'https://maps.app.goo.gl/u6JadwVD4jGvgLnE9';

  return (
    <div className="bg-[#1D100A] border border-[#2C1810] rounded-md p-8 sm:p-12 text-center space-y-6 shadow-xl">
      <div className="max-w-xl mx-auto space-y-2">
        <h3 className="font-heading font-bold text-2xl sm:text-3xl text-cream">
          Have a Question or Special Request?
        </h3>
        <p className="text-xs sm:text-sm text-cream/70 leading-relaxed font-normal">
          We are always happy to hear from our guests. Call us, get directions, or send an email anytime.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        {phone && (
          <a
            href={`tel:${phone.replace(/\s+/g, '')}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#E5A88B] hover:bg-[#EEB89D] text-xs font-bold text-[#140A06] transition-all shadow-md hover:scale-105 active:scale-95"
          >
            <HugeiconsIcon icon={CallIcon} size={14} />
            <span>Call Us Now</span>
          </a>
        )}

        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 backdrop-blur-sm text-xs font-bold text-cream transition-all shadow-md hover:scale-105 active:scale-95"
        >
          <HugeiconsIcon icon={MapsIcon} size={14} />
          <span>Get Directions</span>
        </a>

        {email && (
          <a
            href={`mailto:${email}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 backdrop-blur-sm text-xs font-bold text-cream transition-all shadow-md hover:scale-105 active:scale-95"
          >
            <HugeiconsIcon icon={Mail01Icon} size={14} />
            <span>Send Email</span>
          </a>
        )}
      </div>
    </div>
  );
}
