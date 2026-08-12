import { useState } from 'react';
import { OrderItemSelector } from './OrderItemSelector';
import { OrderCart } from './OrderCart';
import { useCart } from '../../../hooks/useCart';
import { formatCurrency } from '../../../lib/utils/formatCurrency';
import { Sheet, SheetContent } from '../../ui/sheet';
import { Button } from '../../ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { ShoppingCart01Icon } from '@hugeicons/core-free-icons';

export function NewOrderForm() {
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const { items, total } = useCart();
  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="space-y-4">
      <div className="grid lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: POS Item Selector */}
        <div className="lg:col-span-2">
          <OrderItemSelector />
        </div>

        {/* Right Column: Desktop Sticky Live Cart */}
        <div className="hidden lg:block lg:col-span-1 sticky top-20">
          <OrderCart />
        </div>
      </div>

      {/* Floating Bottom Cart Bar for Mobile & Tablet (<1024px) */}
      <div className="lg:hidden fixed bottom-4 left-4 right-4 z-40">
        <Button
          type="button"
          onClick={() => setIsMobileCartOpen(true)}
          className="w-full bg-cinnamon hover:bg-cinnamon/90 text-white font-bold h-12 rounded-md shadow-2xl flex items-center justify-between px-5 transition-all"
        >
          <div className="flex items-center gap-2 text-xs">
            <div className="p-1 rounded-lg bg-white/20">
              <HugeiconsIcon icon={ShoppingCart01Icon} size={18} />
            </div>
            <span>View Live Cart</span>
            {totalItemCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-[11px] font-mono">
                {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}
              </span>
            )}
          </div>

          <span className="font-bold text-sm">{formatCurrency(total)}</span>
        </Button>
      </div>

      {/* Mobile Cart Sheet Drawer */}
      <Sheet open={isMobileCartOpen} onOpenChange={setIsMobileCartOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md p-4 bg-card overflow-y-auto no-scrollbar">
          <OrderCart onCloseMobileCart={() => setIsMobileCartOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
