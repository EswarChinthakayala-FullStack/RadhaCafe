import { useState, useEffect } from 'react';
import { OrderItemSelector } from './OrderItemSelector';
import { OrderCart } from './OrderCart';
import { useCart } from '../../../hooks/useCart';
import { formatCurrency } from '../../../lib/utils/formatCurrency';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '../../ui/drawer';
import { Button } from '../../ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { ShoppingCart01Icon } from '@hugeicons/core-free-icons';

export function NewOrderForm() {
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const { items, total } = useCart();
  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Auto-close mobile cart drawer when screen is resized to desktop (>= 1024px)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileCartOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="space-y-4 min-w-0 w-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-start min-w-0 w-full">
        {/* Left Column: POS Item Selector */}
        <div className="lg:col-span-2 min-w-0 w-full">
          <OrderItemSelector />
        </div>

        {/* Right Column: Desktop Sticky Live Cart */}
        <div className="hidden lg:block lg:col-span-1 sticky top-4 self-start min-w-0 z-10">
          <OrderCart />
        </div>
      </div>

      {/* Floating Bottom Cart Bar for Mobile & Tablet (<1024px) */}
      <div className="lg:hidden fixed bottom-4 inset-x-4 z-40 max-w-lg mx-auto">
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

      {/* Native Mobile Bottom Cart Drawer */}
      <Drawer open={isMobileCartOpen} onOpenChange={setIsMobileCartOpen} showSwipeHandle>
        <DrawerContent className="p-4 bg-card max-h-[90vh] overflow-hidden rounded-t-2xl flex flex-col">
          <DrawerHeader className="pb-2 border-b border-border/60 flex items-center justify-between shrink-0">
            <DrawerTitle className="text-base font-bold font-heading text-foreground flex items-center gap-2">
              <HugeiconsIcon icon={ShoppingCart01Icon} size={18} className="text-cinnamon" />
              <span>Live Order Cart</span>
            </DrawerTitle>
          </DrawerHeader>
          <div className="pt-2 pb-6 overflow-y-auto max-h-[calc(90vh-70px)] no-scrollbar flex-1">
            <OrderCart onCloseMobileCart={() => setIsMobileCartOpen(false)} />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
