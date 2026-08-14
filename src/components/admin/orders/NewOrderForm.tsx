import { useState, useEffect } from 'react';
import { OrderItemSelector } from './OrderItemSelector';
import { OrderCart } from './OrderCart';
import { useCart } from '../../../hooks/useCart';
import { formatCurrency } from '../../../lib/utils/formatCurrency';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '../../ui/drawer';
import { Button } from '../../ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { ShoppingCart01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons';

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
    <div className={`space-y-4 min-w-0 w-full ${totalItemCount > 0 ? 'pb-24 lg:pb-0' : ''}`}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 xl:gap-6 items-start min-w-0 w-full">
        {/* Left Column: POS Item Selector (approx 67% on desktop) */}
        <div className="lg:col-span-8 min-w-0 w-full">
          <OrderItemSelector />
        </div>

        {/* Right Column: Desktop Sticky Live Cart (approx 33% on desktop) */}
        <div className="hidden lg:block lg:col-span-4 sticky top-0 self-start min-w-0 z-10 max-h-[calc(100vh-5.5rem)] overflow-y-auto scrollbar-thin">
          <OrderCart />
        </div>
      </div>

      {/* Floating Bottom Cart Bar for Mobile & Tablet (<1024px) — Only shown when items exist */}
      {totalItemCount > 0 && (
        <div className="lg:hidden fixed bottom-3 inset-x-3 sm:inset-x-6 z-40 max-w-lg mx-auto pb-[env(safe-area-inset-bottom)]">
          <Button
            type="button"
            onClick={() => setIsMobileCartOpen(true)}
            className="w-full bg-cinnamon hover:bg-cinnamon/90 text-white font-bold h-12 sm:h-13 rounded-xl shadow-2xl flex items-center justify-between px-3.5 sm:px-5 transition-all active:scale-[0.99] border border-white/20"
          >
            <div className="flex items-center gap-2 sm:gap-2.5 text-xs sm:text-sm">
              <div className="p-1.5 rounded-lg bg-white/20 shrink-0">
                <HugeiconsIcon icon={ShoppingCart01Icon} size={17} />
              </div>
              <div className="text-left leading-tight">
                <span className="font-bold block">View Cart</span>
                <span className="text-[10px] sm:text-[11px] font-mono text-white/80">
                  {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-extrabold text-xs sm:text-sm md:text-base font-mono font-heading">
                {formatCurrency(total)}
              </span>
              <HugeiconsIcon icon={ArrowRight01Icon} size={15} />
            </div>
          </Button>
        </div>
      )}

      {/* Native Mobile Bottom Cart Drawer */}
      <Drawer open={isMobileCartOpen} onOpenChange={setIsMobileCartOpen} showSwipeHandle>
        <DrawerContent className="p-3.5 sm:p-4 bg-card max-h-[92vh] overflow-hidden rounded-t-2xl flex flex-col">
          <DrawerHeader className="pb-2 border-b border-border/60 flex items-center justify-between shrink-0">
            <DrawerTitle className="text-base font-bold font-heading text-foreground flex items-center gap-2">
              <HugeiconsIcon icon={ShoppingCart01Icon} size={18} className="text-cinnamon" />
              <span>Live Order Cart</span>
            </DrawerTitle>
          </DrawerHeader>
          <div className="pt-2 pb-6 overflow-y-auto max-h-[calc(92vh-70px)] no-scrollbar flex-1">
            <OrderCart onCloseMobileCart={() => setIsMobileCartOpen(false)} />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
