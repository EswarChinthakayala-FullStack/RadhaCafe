import { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Location01Icon, MapsIcon } from '@hugeicons/core-free-icons';

export function ContactMap() {
  const [hasError, setHasError] = useState(false);

  const embedMapUrl =
    'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d1284.3586424239338!2d79.88240280763426!3d15.736034450513579!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a4aef0070bba351%3A0xe350adeebc955989!2sRadha%20cafe!5e0!3m2!1sen!2sin!4v1786560166554!5m2!1sen!2sin';
  const mapsUrl = 'https://maps.app.goo.gl/u6JadwVD4jGvgLnE9';

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="font-heading text-2xl sm:text-3xl font-bold text-cream">
          Interactive Location & Directions
        </h2>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E5A88B] hover:underline"
        >
          <HugeiconsIcon icon={MapsIcon} size={14} />
          <span>Open Full Map View</span>
        </a>
      </div>

      <div className="overflow-hidden rounded-md border border-[#2C1810] shadow-2xl bg-[#1D100A] relative">
        {hasError ? (
          <div className="h-80 sm:h-[420px] flex flex-col items-center justify-center text-center p-8 space-y-3 bg-[#1C100B]">
            <div className="w-12 h-12 rounded-full bg-[#E5A88B]/10 text-[#E5A88B] flex items-center justify-center mx-auto">
              <HugeiconsIcon icon={Location01Icon} size={24} />
            </div>
            <h3 className="font-heading font-bold text-lg text-cream">
              RadhaCafe, Tallur, AP
            </h3>
            <p className="text-xs text-cream/70 max-w-sm">
              1A, Vellampalli Tallur Rd, opposite Pattu Office, Tallur, Andhra Pradesh 523264
            </p>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#E5A88B] hover:bg-[#EEB89D] text-xs font-bold text-[#140A06] transition-all shadow-md mt-2"
            >
              <HugeiconsIcon icon={MapsIcon} size={14} />
              <span>Get Directions on Google Maps</span>
            </a>
          </div>
        ) : (
          <iframe
            src={embedMapUrl}
            className="w-full h-80 sm:h-[420px] border-0"
            allowFullScreen
            loading="lazy"
            onError={() => setHasError(true)}
            referrerPolicy="strict-origin-when-cross-origin"
            title="Radha Cafe Location Map"
          />
        )}
      </div>
    </div>
  );
}
