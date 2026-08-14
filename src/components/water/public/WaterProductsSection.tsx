import { useWaterProducts } from '../../../hooks/useWaterProducts';
import { formatCurrency } from '../../../lib/utils/formatCurrency';
import { ScrollReveal } from '../../shared/ScrollReveal';
import water1 from '../../../assets/water/water1.png';
import water2 from '../../../assets/water/water2.png';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  DropletIcon,
  SparklesIcon,
  CheckmarkCircle02Icon,
  ArrowRight01Icon,
  CallIcon,
} from '@hugeicons/core-free-icons';

export function WaterProductsSection() {
  const { data: products, isLoading } = useWaterProducts(true);

  // Fallback defaults with local high-res project assets
  const fallbackProducts = [
    {
      id: 'prod-normal',
      name: 'Normal 20L Can',
      water_type: 'normal',
      price: 5,
      unit_name: '20L Can',
      description: 'Hygienically purified, crystal-clear drinking water for everyday household and commercial hydration.',
      image_url: water1,
    },
    {
      id: 'prod-cooling',
      name: 'Chilled Cooling Water',
      water_type: 'cooling',
      price: 30,
      unit_name: '1 Can (20L)',
      description: 'Instant refreshingly cold drinking water can, perfect for summer events, office meetings, and celebrations.',
      image_url: water2,
    },
  ];

  const displayProducts = products && products.length > 0 ? products : fallbackProducts;

  const handleScrollToEvents = () => {
    const el = document.getElementById('events');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="products"
      className="py-20 sm:py-28 bg-[#140A06] text-cream border-b border-[#2C1810] relative overflow-hidden"
      aria-label="Water Products and Pricing"
    >
      <div className="container px-4 md:px-8 max-w-7xl mx-auto space-y-12 relative z-10">
        {/* Header */}
        <ScrollReveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#2C1810]">
            <div className="space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B85C1E]/15 border border-[#B85C1E]/30 text-[#E5A88B] text-[11px] font-bold tracking-[0.2em] uppercase">
                <HugeiconsIcon icon={DropletIcon} size={13} />
                <span>Our Products & Transparent Pricing</span>
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-cream leading-tight">
                Pure Hydration,{' '}
                <span className="font-serif italic font-normal text-[#E5A88B]">
                  Fairly Priced.
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-[#EAD5C3]/75 leading-relaxed">
                Enjoy uncompromised purity and reliable supply with direct doorstep delivery across Tallur.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="tel:09966630913"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#B85C1E] to-[#D97026] hover:from-[#C86624] hover:to-[#E87E34] text-xs font-bold text-white transition-all shadow-md shadow-[#B85C1E]/20 hover:scale-105 active:scale-95 shrink-0"
              >
                <HugeiconsIcon icon={CallIcon} size={14} />
                <span>Call to Order (09966630913)</span>
              </a>
            </div>
          </div>
        </ScrollReveal>

        {/* Product Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
          {isLoading ? (
            [1, 2].map((i) => (
              <div
                key={i}
                className="p-8 rounded-2xl bg-[#1C100B] border border-[#3E2519] animate-pulse space-y-6"
              >
                <div className="h-44 bg-[#2C1810] rounded-xl" />
                <div className="space-y-3">
                  <div className="h-5 bg-[#2C1810] rounded w-1/2" />
                  <div className="h-3 bg-[#2C1810] rounded w-3/4" />
                </div>
              </div>
            ))
          ) : (
            displayProducts.map((prod, idx) => {
              const isCooling = prod.water_type === 'cooling';
              const defaultAsset = isCooling ? water2 : water1;
              const imageUrl = (prod as any).image_url || defaultAsset;

              return (
                <ScrollReveal key={prod.id || idx} direction="up" delay={0.1 * idx} className="h-full">
                  <div className="h-full w-full rounded-2xl bg-[#1C100B]/90 border border-[#3E2519]/70 hover:border-[#E5A88B]/50 transition-all duration-300 shadow-xl flex flex-col justify-between overflow-hidden group">
                    {/* Visual Banner — Exact Full Uncropped Image */}
                    <div className="relative w-full h-64 sm:h-72 bg-[#0E0704] flex items-center justify-center p-2 sm:p-3 overflow-hidden">
                      <img
                        src={imageUrl}
                        alt={prod.name}
                        className="w-full h-full object-contain"
                        loading="lazy"
                      />
                      
                      {/* Badge */}
                      <div className="absolute top-3 left-3 z-10">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider shadow-lg ${
                            isCooling
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30 backdrop-blur-md'
                              : 'bg-[#B85C1E]/25 text-[#E5A88B] border border-[#E5A88B]/40 backdrop-blur-md'
                          }`}
                        >
                          <HugeiconsIcon icon={isCooling ? SparklesIcon : DropletIcon} size={12} />
                          <span>{isCooling ? 'Chilled Cooling' : 'Daily Normal 20L'}</span>
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-6 sm:p-7 space-y-5 flex-1 flex flex-col justify-between">
                      <div className="space-y-2.5">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-heading font-bold text-xl text-cream group-hover:text-[#E5A88B] transition-colors">
                            {prod.name}
                          </h3>
                          <div className="text-right shrink-0">
                            <span className="font-heading font-extrabold text-2xl text-[#E5A88B]">
                              {formatCurrency(prod.price)}
                            </span>
                            <span className="text-[11px] text-[#EAD5C3]/60 block">
                              / {prod.unit_name || '20L Can'}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-[#EAD5C3]/75 leading-relaxed">
                          {prod.description ||
                            'Pure, sterilized 20 Litre drinking water can for home, retail shop, or commercial office.'}
                        </p>
                      </div>

                      {/* Benefits Checklist */}
                      <div className="space-y-2 pt-2 border-t border-[#3E2519]/70 text-xs text-[#EAD5C3]/80">
                        <div className="flex items-center gap-2">
                          <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} className="text-[#E5A88B] shrink-0" />
                          <span>Sterilized, sealed food-grade containers</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} className="text-[#E5A88B] shrink-0" />
                          <span>Doorstep drop-off on scheduled timings</span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        type="button"
                        onClick={handleScrollToEvents}
                        className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#B85C1E]/20 hover:bg-[#B85C1E] text-[#E5A88B] hover:text-white border border-[#B85C1E]/30 hover:border-[#B85C1E] font-bold text-xs transition-all duration-300 shadow-sm cursor-pointer"
                      >
                        <span>Order or Inquire for Bulk</span>
                        <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
                      </button>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
