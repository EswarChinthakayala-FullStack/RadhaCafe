import { ScrollReveal } from '../../shared/ScrollReveal';
import { HugeiconsIcon } from '@hugeicons/react';
import { DropletIcon } from '@hugeicons/core-free-icons';

interface WaterCinematicBreakProps {
  imageSrc?: string;
  tagline?: string;
  subtext?: string;
}

export function WaterCinematicBreak({
  imageSrc = 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=2400&q=85',
  tagline = 'From daily doorstep needs to memorable celebrations.',
  subtext = 'Clean, refreshing hydration carefully purified and sealed to serve every household and gathering in Tallur.',
}: WaterCinematicBreakProps) {
  return (
    <section
      className="relative min-h-[55vh] sm:min-h-[70vh] flex items-center justify-center overflow-hidden border-y border-[#2C1810] bg-[#140A06] text-cream"
      aria-label="Water Purity Interlude"
    >
      {/* Atmospheric Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed transform scale-105 transition-transform duration-1000"
        style={{
          backgroundImage: `url("${imageSrc}")`,
        }}
      />

      {/* Deep Vignette Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#140A06] via-[#140A06]/75 to-[#140A06]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(20,10,6,0.85)_100%)]" />

      {/* Centered Editorial Statement */}
      <div className="relative z-10 container px-4 md:px-8 max-w-4xl mx-auto text-center space-y-5">
        <ScrollReveal direction="scale">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#B85C1E]/20 border border-[#E5A88B]/40 backdrop-blur-md text-[#E5A88B] text-[11px] font-bold tracking-[0.25em] uppercase">
              <HugeiconsIcon icon={DropletIcon} size={14} />
              <span>Crystal Clarity</span>
            </div>

            <h2 className="font-heading text-3xl sm:text-5xl md:text-6xl font-extrabold text-cream leading-tight drop-shadow-2xl">
              {tagline}
            </h2>

            <p className="text-xs sm:text-sm md:text-base text-[#EAD5C3]/85 leading-relaxed max-w-xl mx-auto font-normal">
              {subtext}
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
