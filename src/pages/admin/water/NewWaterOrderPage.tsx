import { useState } from 'react';
import { useWaterProducts } from '../../../hooks/useWaterProducts';
import { useWaterCart } from '../../../store/waterCartStore';
import { formatCurrency } from '../../../lib/utils/formatCurrency';
import { WaterOrderCart } from '../../../components/admin/water/orders/WaterOrderCart';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../../../components/ui/sheet';
import { Skeleton } from '../../../components/ui/skeleton';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  DropletIcon,
  PlusSignIcon,
  ShoppingCart01Icon,
  SnowIcon,
} from '@hugeicons/core-free-icons';

export function NewWaterOrderPage() {
  const { data: products, isLoading, isError } = useWaterProducts(true);
  const { addItem, items, subtotal } = useWaterCart();
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

  const cartItemsCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4 sm:pb-5">
        <div>
          <h2 className="text-2xl font-bold font-heading text-foreground flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cinnamon/10 text-cinnamon shrink-0 border border-cinnamon/20 shadow-2xs">
              <HugeiconsIcon icon={DropletIcon} size={22} />
            </div>
            <span>New Water Order (POS)</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Select 20L drinking water products and complete counter orders or Pay-Later deliveries.
          </p>
        </div>

        {/* Mobile View Cart Drawer Button */}
        <div className="lg:hidden">
          <Sheet open={isMobileCartOpen} onOpenChange={setIsMobileCartOpen}>
            <SheetTrigger
              render={
                <Button
                  className="bg-cinnamon hover:bg-cinnamon/90 text-white font-bold h-10 px-4 text-xs gap-2 rounded-md shadow-sm w-full sm:w-auto"
                />
              }
            >
              <HugeiconsIcon icon={ShoppingCart01Icon} size={16} />
              <span>View Water Cart ({cartItemsCount})</span>
              {cartItemsCount > 0 && (
                <Badge className="bg-white text-cinnamon font-bold ml-1 font-mono text-[10px]">
                  {formatCurrency(subtotal)}
                </Badge>
              )}
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md p-0 bg-card">
              <SheetHeader className="p-4 border-b border-border">
                <SheetTitle className="text-base font-bold font-heading text-foreground flex items-center gap-2">
                  <HugeiconsIcon icon={ShoppingCart01Icon} size={18} className="text-cinnamon" />
                  <span>RadhaWater Order Cart</span>
                </SheetTitle>
              </SheetHeader>
              <div className="p-4 h-[calc(100vh-80px)] overflow-y-auto">
                <WaterOrderCart onCloseMobileCart={() => setIsMobileCartOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Main Grid: Products (Left 7 cols) & Cart (Right 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Products Selection */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="font-bold text-sm text-foreground uppercase tracking-wider font-heading flex items-center gap-2">
            <HugeiconsIcon icon={DropletIcon} size={16} className="text-cinnamon" />
            <span>Available Water Cans & Products</span>
          </h3>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Skeleton className="h-40 rounded-md" />
              <Skeleton className="h-40 rounded-md" />
            </div>
          ) : isError ? (
            <div className="p-8 text-center bg-card rounded-md border border-destructive/20 text-destructive text-xs">
              Failed to load water products.
            </div>
          ) : !products || products.length === 0 ? (
            <div className="p-8 text-center bg-card rounded-md border border-dashed border-border text-xs text-muted-foreground">
              No water products available. Please add products in Water Products menu.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {products.map((prod) => {
                const isCooling = prod.water_type === 'cooling';
                return (
                  <Card
                    key={prod.id}
                    className="border border-border/80 bg-card hover:border-cinnamon/50 transition-all rounded-md shadow-2xs"
                  >
                    <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-bold text-base text-foreground font-heading">{prod.name}</h4>
                          <Badge
                            className={
                              isCooling
                                ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px] uppercase font-bold gap-1'
                                : 'bg-cinnamon/15 text-cinnamon border-cinnamon/30 text-[10px] uppercase font-bold gap-1'
                            }
                          >
                            {isCooling && <HugeiconsIcon icon={SnowIcon} size={11} />}
                            {prod.water_type}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{prod.description || '20 Litre drinking water can'}</p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-border/40">
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase font-semibold">Unit Price</p>
                          <p className="text-xl font-bold font-heading text-cinnamon">
                            {formatCurrency(prod.price)}
                          </p>
                        </div>

                        <Button
                          size="sm"
                          onClick={() => addItem(prod, 1)}
                          className="bg-cinnamon hover:bg-cinnamon/90 text-white font-bold text-xs gap-1.5 h-9 rounded-md shadow-xs"
                        >
                          <HugeiconsIcon icon={PlusSignIcon} size={14} />
                          <span>Add Can</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Desktop Order Cart (Right 5 cols) */}
        <div className="hidden lg:block lg:col-span-5 sticky top-24">
          <WaterOrderCart />
        </div>
      </div>
    </div>
  );
}
