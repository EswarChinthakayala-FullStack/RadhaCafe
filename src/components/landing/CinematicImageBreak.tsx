import { ScrollReveal } from '../shared/ScrollReveal';
import { HugeiconsIcon } from '@hugeicons/react';
import { Coffee02Icon } from '@hugeicons/core-free-icons';

interface CinematicImageBreakProps {
  imageSrc?: string;
  tagline?: string;
  subtext?: string;
}

export function CinematicImageBreak({
  imageSrc = 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=2400&q=85',
  tagline = 'Made slowly. Enjoyed fully.',
  subtext = 'A sanctuary where every bean is honored and every guest is welcomed with timeless warmth.',
}: CinematicImageBreakProps) {
  return (
    <section
      className="relative min-h-[55vh] sm:min-h-[70vh] flex items-center justify-center overflow-hidden border-y border-[#2C1810] bg-[#0E0604] text-cream"
      aria-label="Cafe Atmosphere"
    >
      {/* Background Image with Atmospheric Depth */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed transform scale-105 transition-transform duration-1000"
        style={{
          backgroundImage: `url("${imageSrc}")`,
        }}
      />

      {/* Cinematic Vignette Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#140A06] via-[#140A06]/70 to-[#140A06]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(14,6,4,0.85)_100%)]" />

      {/* Centered Editorial Statement */}
      <div className="relative z-10 container px-4 md:px-8 max-w-4xl mx-auto text-center space-y-5">
        <ScrollReveal direction="scale">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E5A88B]/15 border border-[#E5A88B]/30 backdrop-blur-md text-[#E5A88B] text-[11px] font-bold tracking-[0.25em] uppercase">
              <HugeiconsIcon icon={Coffee02Icon} size={14} />
              <span>The Ritual</span>
            </div>

            <h2 className="font-heading text-3xl sm:text-5xl md:text-6xl font-extrabold text-cream leading-tight drop-shadow-2xl">
              {tagline}
            </h2>

            <p className="text-xs sm:text-sm md:text-base text-[#EAD5C3]/80 leading-relaxed max-w-xl mx-auto font-normal">
              {subtext}
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
