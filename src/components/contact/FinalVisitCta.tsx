import { useCafeSettings } from '../../hooks/useCafeSettings';
import { HugeiconsIcon } from '@hugeicons/react';
import { CallIcon, MapsIcon, Coffee02Icon } from '@hugeicons/core-free-icons';

export function FinalVisitCta() {
  const { data: settings } = useCafeSettings();

  const phone = settings?.phone || '09966630913';
  const mapsUrl = 'https://maps.app.goo.gl/u6JadwVD4jGvgLnE9';

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6">
      <div className="bg-gradient-to-b from-[#1D100A] to-[#140A06] border border-[#3E2519]/70 rounded-2xl p-8 sm:p-12 text-center space-y-6 shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-[radial-gradient(circle,rgba(229,168,139,0.1)_0%,transparent_70%)] pointer-events-none"
          aria-hidden="true"
        />

        <div className="w-12 h-12 rounded-2xl bg-[#E5A88B]/10 text-[#E5A88B] flex items-center justify-center mx-auto border border-[#E5A88B]/20 relative z-10">
          <HugeiconsIcon icon={Coffee02Icon} size={24} />
        </div>

        <div className="max-w-xl mx-auto space-y-2 relative z-10">
          <h3 className="font-heading font-extrabold text-2xl sm:text-4xl text-cream leading-tight">
            We&apos;ll save you a seat.
          </h3>
          <p className="text-xs sm:text-sm text-[#EAD5C3]/75 leading-relaxed font-normal">
            Step into RadhaCafe today for freshly brewed South Indian filter coffee, savory snacks, and genuine hospitality in Tallur.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2 relative z-10">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-[#B85C1E] to-[#D97026] hover:from-[#C86624] hover:to-[#E87E34] text-white font-bold text-xs sm:text-sm shadow-xl shadow-[#B85C1E]/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <HugeiconsIcon icon={MapsIcon} size={16} />
            <span>Get Directions on Maps</span>
          </a>

          {phone && (
            <a
              href={`tel:${phone.replace(/\s+/g, '')}`}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/20 text-cream font-semibold text-xs sm:text-sm backdrop-blur-sm transition-all hover:border-[#E5A88B]/50 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <HugeiconsIcon icon={CallIcon} size={16} className="text-[#E5A88B]" />
              <span>Call Us: {phone}</span>
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
