import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Coffee02Icon,
  Image01Icon,
  Comment01Icon,
  Restaurant01Icon,
} from '@hugeicons/core-free-icons';

export function CafeAtmosphere() {
  return (
    <section className="py-12 sm:py-16 border-y border-[#2C1810] bg-[#110704] relative overflow-hidden">
      {/* Ambient background glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[radial-gradient(circle,rgba(229,168,139,0.06)_0%,transparent_70%)] pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 space-y-10">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Image Showcase (6 cols) */}
          <div className="lg:col-span-6 relative group">
            <div className="relative rounded-2xl overflow-hidden border border-[#3E2519]/80 shadow-2xl aspect-[4/3]">
              <img
                src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=85"
                alt="RadhaCafe warm hospitality and dining atmosphere in Tallur"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#140A06] via-transparent to-transparent opacity-80" />

              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-[#140A06]/90 border border-[#3E2519]/80 backdrop-blur-md">
                <p className="font-serif italic text-sm text-[#E5A88B]">
                  &ldquo;Come for the coffee. Stay for the atmosphere.&rdquo;
                </p>
                <p className="text-[11px] text-cream/60 mt-0.5">
                  RadhaCafe &middot; Vellampalli Tallur Road
                </p>
              </div>
            </div>
          </div>

          {/* Editorial Content (6 cols) */}
          <div className="lg:col-span-6 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5A88B]/10 border border-[#E5A88B]/20 text-[#E5A88B] text-xs font-bold uppercase tracking-widest">
              <HugeiconsIcon icon={Coffee02Icon} size={14} />
              <span>AUTHENTIC HOSPITALITY</span>
            </div>

            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-cream leading-tight">
              A Warm Sanctuary in the{' '}
              <span className="font-serif italic font-normal text-[#E5A88B]">
                Heart of Tallur
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-[#EAD5C3]/80 leading-relaxed font-normal">
              Whether you are passing through Prakasam district or are a lifelong Tallur resident, RadhaCafe is designed as an inviting space to rest, recharge, and savor traditional filter brews crafted from roasted chicory blends.
            </p>

            {/* Feature Highlights */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-[#1D100A] border border-[#3E2519]/70 space-y-1">
                <span className="font-heading font-bold text-xs text-cream block">
                  Comfortable Seating
                </span>
                <span className="text-[11px] text-[#EAD5C3]/65 leading-tight block">
                  Clean indoor ambiance with natural lighting and relaxed seating.
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#1D100A] border border-[#3E2519]/70 space-y-1">
                <span className="font-heading font-bold text-xs text-cream block">
                  Artisanal Brews
                </span>
                <span className="text-[11px] text-[#EAD5C3]/65 leading-tight block">
                  Freshly decocted traditional filter coffee and comforting snacks.
                </span>
              </div>
            </div>

            {/* Navigation Cross-Links */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to={ROUTES.PUBLIC.MENU}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#B85C1E] hover:bg-[#C86624] text-white text-xs font-bold transition-all shadow-md"
              >
                <HugeiconsIcon icon={Restaurant01Icon} size={14} />
                <span>Explore Menu</span>
              </Link>

              <Link
                to={ROUTES.PUBLIC.GALLERY}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-cream hover:text-white border border-white/15 text-xs font-semibold transition-all"
              >
                <HugeiconsIcon icon={Image01Icon} size={14} className="text-[#E5A88B]" />
                <span>Photo Gallery</span>
              </Link>

              <Link
                to={ROUTES.PUBLIC.REVIEWS}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-cream hover:text-white border border-white/15 text-xs font-semibold transition-all"
              >
                <HugeiconsIcon icon={Comment01Icon} size={14} className="text-[#E5A88B]" />
                <span>Guest Reviews</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
