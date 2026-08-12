import { ScrollReveal } from '../shared/ScrollReveal';
import { ContactInfoCards } from '../contact/ContactInfoCards';
import { ContactMap } from '../contact/ContactMap';
import { HugeiconsIcon } from '@hugeicons/react';
import { Location01Icon } from '@hugeicons/core-free-icons';

export function ContactSection() {
  return (
    <section id="contact" className="py-20 bg-[#140A06] text-cream border-b border-[#2C1810]">
      <div className="container px-4 md:px-8 max-w-5xl mx-auto space-y-12">
        <ScrollReveal>
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold text-[#E5A88B] tracking-widest uppercase">
              Visit & Contact
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-cream flex items-center justify-center gap-3">
              Location &{' '}
              <span className="font-serif italic font-normal text-[#E5A88B]">Directions</span>
              <HugeiconsIcon icon={Location01Icon} size={28} className="text-[#E5A88B]" />
            </h2>
            <p className="text-xs sm:text-sm text-cream/70">
              We look forward to serving you fresh coffee. Find our exact location & hours below.
            </p>
          </div>
        </ScrollReveal>

        {/* Info Cards Grid */}
        <ScrollReveal delay={0.1}>
          <ContactInfoCards />
        </ScrollReveal>

        {/* Embedded Interactive Google Map */}
        <ScrollReveal delay={0.2}>
          <ContactMap />
        </ScrollReveal>
      </div>
    </section>
  );
}
