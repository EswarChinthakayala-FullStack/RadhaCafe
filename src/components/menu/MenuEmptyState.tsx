import { HugeiconsIcon } from '@hugeicons/react';
import { Coffee02Icon } from '@hugeicons/core-free-icons';

interface MenuEmptyStateProps {
  searchQuery?: string;
  onClearSearch?: () => void;
}

export function MenuEmptyState({ searchQuery, onClearSearch }: MenuEmptyStateProps) {
  return (
    <div className="p-14 text-center bg-[#1D100A] rounded-md border border-dashed border-[#2C1810] max-w-md mx-auto space-y-3 shadow-lg">
      <div className="w-14 h-14 rounded-full bg-[#E5A88B]/10 text-[#E5A88B] flex items-center justify-center mx-auto">
        <HugeiconsIcon icon={Coffee02Icon} size={28} />
      </div>
      <div className="space-y-1">
        <h3 className="font-heading font-bold text-lg text-cream">
          {searchQuery ? 'No menu items found' : 'Our menu is being prepared'}
        </h3>
        <p className="text-xs text-cream/65 leading-relaxed">
          {searchQuery
            ? `No items matched "${searchQuery}". Try searching for another item or clear your search.`
            : 'Check back shortly as our team adds fresh offerings.'}
        </p>
      </div>

      {searchQuery && onClearSearch && (
        <button
          onClick={onClearSearch}
          className="mt-2 text-xs font-bold text-[#E5A88B] hover:underline"
        >
          Clear Search Filter
        </button>
      )}
    </div>
  );
}
