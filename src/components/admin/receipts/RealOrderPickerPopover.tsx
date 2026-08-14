import { useState, useMemo } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import { Skeleton } from '../../ui/skeleton';
import { useOrders } from '../../../hooks/useOrders';
import type { Order } from '../../../types';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Search01Icon,
  ShoppingBag01Icon,
  CheckmarkCircle02Icon,
  RefreshIcon,
  UserIcon,
} from '@hugeicons/core-free-icons';

interface RealOrderPickerPopoverProps {
  selectedOrder: Order | null;
  onSelectOrder: (order: Order | null) => void;
}

export function RealOrderPickerPopover({
  selectedOrder,
  onSelectOrder,
}: RealOrderPickerPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch recent orders with search limit
  const { data, isLoading } = useOrders({
    limit: 10,
    search: searchTerm.trim() || undefined,
  });

  const orders = useMemo(() => data?.orders || [], [data]);

  const handleSelect = (order: Order) => {
    onSelectOrder(order);
    setIsOpen(false);
  };

  const handleResetToSample = () => {
    onSelectOrder(null);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={`h-8 text-xs font-semibold rounded-xl border-border/80 gap-1.5 shadow-2xs transition-all ${
              selectedOrder
                ? 'bg-cinnamon/10 border-cinnamon/40 text-cinnamon font-bold'
                : 'bg-card hover:bg-secondary text-foreground'
            }`}
          >
            <HugeiconsIcon icon={ShoppingBag01Icon} size={13} className={selectedOrder ? 'text-cinnamon' : 'text-muted-foreground'} />
            <span className="truncate max-w-[140px]">
              {selectedOrder ? selectedOrder.order_number : 'Real Order'}
            </span>
          </Button>
        }
      />

      <PopoverContent align="end" className="w-80 sm:w-96 p-0 rounded-2xl border-border/90 bg-card shadow-xl overflow-hidden text-foreground">
        {/* Header Search Input */}
        <div className="p-3 border-b border-border/60 space-y-2 bg-secondary/20">
          <div className="flex items-center justify-between">
            <span className="font-bold font-heading text-xs text-foreground">
              Preview With Real Order
            </span>
            {selectedOrder && (
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={handleResetToSample}
                className="h-6 text-[10px] text-muted-foreground hover:text-foreground gap-1 px-2"
              >
                <HugeiconsIcon icon={RefreshIcon} size={11} />
                <span>Reset to Sample</span>
              </Button>
            )}
          </div>

          <div className="relative">
            <HugeiconsIcon
              icon={Search01Icon}
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by order # or customer..."
              className="h-8 pl-8 text-xs rounded-xl bg-background border-border/70 focus:border-cinnamon"
            />
          </div>
        </div>

        {/* Order Results List */}
        <div className="max-h-64 overflow-y-auto p-1.5 space-y-1 divide-y divide-border/30">
          {isLoading ? (
            <div className="p-3 space-y-2">
              <Skeleton className="h-10 w-full rounded-xl bg-secondary/50" />
              <Skeleton className="h-10 w-full rounded-xl bg-secondary/50" />
              <Skeleton className="h-10 w-full rounded-xl bg-secondary/50" />
            </div>
          ) : orders.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground space-y-1">
              <p className="font-medium">No cafe orders found.</p>
              <p className="text-[11px] text-muted-foreground/80">Try another search term or take an order first.</p>
            </div>
          ) : (
            orders.map((order) => {
              const isSelected = selectedOrder?.id === order.id;
              const itemCount = order.items?.reduce((sum, it) => sum + (it.quantity || 1), 0) || 0;

              return (
                <button
                  key={order.id}
                  type="button"
                  onClick={() => handleSelect(order)}
                  className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between gap-3 text-xs ${
                    isSelected
                      ? 'bg-cinnamon/10 border border-cinnamon/30 text-cinnamon'
                      : 'hover:bg-secondary/60 text-foreground'
                  }`}
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold font-mono text-foreground text-xs">
                        {order.order_number}
                      </span>
                      {order.payment_method && (
                        <Badge variant="outline" className="text-[9px] font-mono capitalize px-1 py-0 h-4">
                          {order.payment_method.replace('_', ' ')}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <HugeiconsIcon icon={UserIcon} size={11} className="shrink-0" />
                        <span className="truncate max-w-[100px]">{order.customer_name || 'Walk-in'}</span>
                      </span>
                      <span>•</span>
                      <span>{itemCount} items</span>
                      <span>•</span>
                      <span>{new Date(order.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-bold font-mono text-xs text-foreground">
                      ₹{Number(order.total_amount || 0).toFixed(2)}
                    </div>
                    {isSelected && (
                      <span className="text-[10px] text-cinnamon font-bold flex items-center gap-0.5 justify-end">
                        <HugeiconsIcon icon={CheckmarkCircle02Icon} size={11} />
                        <span>Selected</span>
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
