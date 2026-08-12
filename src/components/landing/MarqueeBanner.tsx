import { HugeiconsIcon } from '@hugeicons/react';
import { Coffee02Icon } from '@hugeicons/core-free-icons';

export function MarqueeBanner() {
  const items = [
    'Specialty Coffee',
    'Fresh Pastries',
    'Filter Coffee',
    'Vegan Options',
    'Pet Friendly',
    'Free Wi-Fi',
    'Delivery Available',
    'Traditional Roast',
  ];

  return (
    <div className="bg-[#1D0F0A] border-y border-[#2C1810] py-3.5 overflow-hidden select-none">
      <div className="animate-marquee whitespace-nowrap flex items-center gap-8 text-xs font-bold tracking-widest text-cream/90 uppercase">
        {items.concat(items).concat(items).map((item, idx) => (
          <div key={idx} className="flex items-center gap-8">
            <span>{item}</span>
            <HugeiconsIcon icon={Coffee02Icon} size={12} className="text-cinnamon shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
