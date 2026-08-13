import { useState } from 'react';
import { useWaterCart } from '../../../../store/waterCartStore';
import { useCreateWaterOrder } from '../../../../hooks/useWaterOrders';
import { useBluetoothPrinter } from '../../../../hooks/useBluetoothPrinter';
import { useWaterCustomerSearch } from '../../../../hooks/useWaterCustomers';
import { formatCurrency } from '../../../../lib/utils/formatCurrency';
import { formatWaterOrderReceipt } from '../../../../lib/printer/waterReceiptFormatter';
import type { WaterCustomer, WaterPaymentMethod } from '../../../../types';
import { WaterCustomerFormModal } from '../customers/WaterCustomerFormModal';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Badge } from '../../../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../ui/dialog';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  PlusSignIcon,
  MinusSignIcon,
  Delete02Icon,
  PrinterIcon,
  CheckmarkCircle02Icon,
  ShoppingCart01Icon,
  UserIcon,
  UserAdd01Icon,
  Search01Icon,
  AlertCircleIcon,
  Cancel01Icon,
} from '@hugeicons/core-free-icons';

interface WaterOrderCartProps {
  onCloseMobileCart?: () => void;
}

export function WaterOrderCart({ onCloseMobileCart }: WaterOrderCartProps) {
  const { items, updateQuantity, removeItem, clearCart, subtotal, discount, setDiscount } = useWaterCart();
  const createOrderMutation = useCreateWaterOrder();
  const { status: printerStatus, printOrder } = useBluetoothPrinter();

  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<WaterPaymentMethod>('cash');
  const [selectedCustomer, setSelectedCustomer] = useState<WaterCustomer | null>(null);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);

  const [createdOrder, setCreatedOrder] = useState<any | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [printMessage, setPrintMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: searchResults, isLoading: isSearchLoading } = useWaterCustomerSearch(customerSearchQuery);

  const grandTotal = Math.max(0, subtotal - discount);

  const handleCheckout = async () => {
    if (items.length === 0 || createOrderMutation.isPending) return;

    setErrorMsg(null);
    setPrintMessage(null);

    if (paymentMethod === 'pay_later' && !selectedCustomer) {
      setErrorMsg('Please select or create a water customer to place a Pay Later credit order.');
      return;
    }

    const payload = {
      customer_id: selectedCustomer?.id || null,
      customer_name: selectedCustomer
        ? selectedCustomer.name
        : customerName.trim() || 'Walk-in Customer',
      payment_method: paymentMethod,
      discount_amount: discount,
      order_source: 'pos' as const,
      items: items.map((i) => ({
        water_product_id: i.product.id,
        item_name: i.product.name,
        unit_price: i.product.price,
        quantity: i.quantity,
      })),
    };

    try {
      const order = await createOrderMutation.mutateAsync(payload);
      setCreatedOrder(order);
      setShowSuccessModal(true);

      clearCart();
      setCustomerName('');
      setSelectedCustomer(null);
      setCustomerSearchQuery('');
      setPaymentMethod('cash');
      if (onCloseMobileCart) onCloseMobileCart();

      // Auto-trigger bluetooth print if connected
      if (printerStatus === 'connected') {
        setIsPrinting(true);
        const receiptData = formatWaterOrderReceipt(order);
        const success = await printOrder(receiptData as any);
        setIsPrinting(false);
        if (success) {
          setPrintMessage('Water receipt printed successfully via Bluetooth!');
        } else {
          setPrintMessage('Automatic print failed. You can retry printing below.');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to place water order. Please try again.');
    }
  };

  const handleManualPrint = async () => {
    if (!createdOrder) return;
    setIsPrinting(true);
    setPrintMessage(null);
    const receiptData = formatWaterOrderReceipt(createdOrder);
    const success = await printOrder(receiptData as any);
    setIsPrinting(false);
    if (success) {
      setPrintMessage('Water receipt printed successfully via Bluetooth!');
    } else {
      setPrintMessage('Bluetooth print attempt failed. Check printer connection.');
    }
  };

  const handleCustomerCreatedOnTheFly = (newCustomer: WaterCustomer) => {
    setSelectedCustomer(newCustomer);
    setCustomerSearchQuery('');
    setIsSearchingCustomer(false);
  };

  const existingOutstanding = Number(selectedCustomer?.total_due || 0);
  const projectedOutstanding = existingOutstanding + grandTotal;

  return (
    <div className="border border-border/80 rounded-md p-5 bg-card flex flex-col h-full space-y-4 shadow-sm">
      <div className="flex justify-between items-center border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={ShoppingCart01Icon} size={18} className="text-cinnamon" />
          <h3 className="font-bold text-sm sm:text-base text-foreground font-heading">Water Order Cart</h3>
        </div>
        {items.length > 0 && (
          <button onClick={clearCart} className="text-xs text-destructive hover:underline font-semibold">
            Clear All
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 text-xs font-medium flex items-center gap-2">
          <HugeiconsIcon icon={AlertCircleIcon} size={16} className="shrink-0 text-destructive" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 min-h-[160px] max-h-[300px] pr-1">
        {items.length === 0 ? (
          <div className="text-center py-10 space-y-2 border border-dashed border-border/60 rounded-md bg-secondary/20">
            <HugeiconsIcon icon={ShoppingCart01Icon} className="mx-auto text-muted-foreground/40 w-8 h-8" />
            <p className="text-xs font-semibold text-foreground">Your water cart is empty</p>
            <p className="text-[11px] text-muted-foreground">Select 20L cans or products on the left to start a new order.</p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.product.id}
              className="flex justify-between items-center text-xs p-3 rounded-md bg-secondary/40 border border-border/40"
            >
              <div className="flex-1 min-w-0 pr-2 space-y-0.5">
                <p className="font-bold text-foreground truncate">{item.product.name}</p>
                <p className="text-[11px] text-muted-foreground">
                  {formatCurrency(item.product.price)} × {item.quantity} ={' '}
                  <span className="font-semibold text-cinnamon">
                    {formatCurrency(item.product.price * item.quantity)}
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  size="xs"
                  variant="outline"
                  className="h-6 w-6 p-0 rounded-md"
                  onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                >
                  <HugeiconsIcon icon={MinusSignIcon} size={12} />
                </Button>
                <span className="font-bold w-5 text-center text-xs">{item.quantity}</span>
                <Button
                  size="xs"
                  variant="outline"
                  className="h-6 w-6 p-0 rounded-md"
                  onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                >
                  <HugeiconsIcon icon={PlusSignIcon} size={12} />
                </Button>
                <Button
                  size="xs"
                  variant="ghost"
                  className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10 ml-1 rounded-md"
                  onClick={() => removeItem(item.product.id)}
                >
                  <HugeiconsIcon icon={Delete02Icon} size={14} />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Calculations Breakdown */}
      <div className="border-t border-border pt-3 space-y-2 text-xs">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span className="font-semibold text-foreground">{formatCurrency(subtotal)}</span>
        </div>

        <div className="flex justify-between items-center text-muted-foreground">
          <span>Discount (₹)</span>
          <Input
            type="number"
            min={0}
            max={subtotal}
            value={discount}
            onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
            className="w-24 h-7 text-right text-xs bg-background rounded-lg"
          />
        </div>

        <div className="flex justify-between font-bold text-base text-foreground pt-2 border-t border-border">
          <span>Grand Total</span>
          <span className="text-cinnamon">{formatCurrency(grandTotal)}</span>
        </div>
      </div>

      {/* Payment Method Selector */}
      <div className="space-y-1.5 pt-1">
        <Label className="text-xs font-semibold">Payment Method</Label>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 sm:gap-1">
          {(['cash', 'upi', 'card', 'other', 'pay_later'] as const).map((method) => {
            const isPayLater = method === 'pay_later';
            const isSelected = paymentMethod === method;
            return (
              <Button
                key={method}
                type="button"
                variant={isSelected ? 'default' : 'outline'}
                size="xs"
                className={
                  isSelected
                    ? isPayLater
                      ? 'bg-amber-600 hover:bg-amber-700 text-white uppercase font-bold text-[10px] sm:text-[11px] h-8.5 rounded-lg shadow-xs'
                      : 'bg-cinnamon hover:bg-cinnamon/90 text-white uppercase font-bold text-[10px] sm:text-[11px] h-8.5 rounded-lg shadow-xs'
                    : 'uppercase text-[10px] sm:text-[11px] h-8.5 text-foreground/80 rounded-lg'
                }
                onClick={() => setPaymentMethod(method)}
              >
                {isPayLater ? 'Pay Later' : method}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Customer Name input for Normal paid orders */}
      {paymentMethod !== 'pay_later' && (
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Water Customer Name (Optional)</Label>
          <Input
            placeholder="e.g. Ramesh / House 12"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="h-9 text-xs bg-background rounded-md"
          />
        </div>
      )}

      {/* Pay Later Customer Credit Workflow Section */}
      {paymentMethod === 'pay_later' && (
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2">
            <span className="text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5 shrink-0">
              <HugeiconsIcon icon={UserIcon} size={15} />
              <span>Water Customer Profile *</span>
            </span>
            <Button
              type="button"
              variant="outline"
              size="xs"
              className="h-7 text-[11px] px-2.5 gap-1 rounded-md border-amber-500/40 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold shrink-0"
              onClick={() => setShowAddCustomerModal(true)}
            >
              <HugeiconsIcon icon={UserAdd01Icon} size={13} />
              <span>New Customer</span>
            </Button>
          </div>

          {selectedCustomer ? (
            <div className="p-2.5 rounded-md bg-background border border-border/80 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-foreground">{selectedCustomer.name}</p>
                  <p className="text-[11px] text-muted-foreground font-mono">{selectedCustomer.phone}</p>
                </div>
                <Button
                  size="xs"
                  variant="ghost"
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                  onClick={() => setSelectedCustomer(null)}
                >
                  <HugeiconsIcon icon={Cancel01Icon} size={14} />
                </Button>
              </div>

              {/* Outstanding Balance Projections */}
              <div className="pt-2 border-t border-border/50 space-y-1 text-[11px]">
                <div className="flex justify-between text-muted-foreground">
                  <span>Existing Water Due:</span>
                  <span className="font-semibold text-foreground">{formatCurrency(existingOutstanding)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>New Water Order Total:</span>
                  <span className="font-semibold text-cinnamon">+{formatCurrency(grandTotal)}</span>
                </div>
                <div className="flex justify-between font-bold text-xs pt-1 border-t border-border/40 text-amber-700 dark:text-amber-400">
                  <span>Projected Water Total Due:</span>
                  <span>{formatCurrency(projectedOutstanding)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative space-y-2">
              <div className="relative">
                <HugeiconsIcon
                  icon={Search01Icon}
                  size={14}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  placeholder="Search water customer by name or phone..."
                  value={customerSearchQuery}
                  onChange={(e) => {
                    setCustomerSearchQuery(e.target.value);
                    setIsSearchingCustomer(true);
                  }}
                  onFocus={() => setIsSearchingCustomer(true)}
                  className="h-9 text-xs pl-8 bg-background rounded-md"
                />
              </div>

              {isSearchingCustomer && customerSearchQuery.trim() !== '' && (
                <div className="absolute top-full left-0 w-full z-20 mt-1 bg-card border border-border rounded-md shadow-xl max-h-48 overflow-y-auto p-1">
                  {isSearchLoading ? (
                    <div className="p-3 text-center text-xs text-muted-foreground">Searching customers...</div>
                  ) : !searchResults || searchResults.length === 0 ? (
                    <div className="p-3 text-center space-y-2">
                      <p className="text-xs text-muted-foreground">No customer found for "{customerSearchQuery}"</p>
                      <Button
                        type="button"
                        size="xs"
                        onClick={() => {
                          setShowAddCustomerModal(true);
                          setIsSearchingCustomer(false);
                        }}
                        className="h-7 text-xs bg-cinnamon hover:bg-cinnamon/90 text-white font-bold gap-1 rounded-md"
                      >
                        <HugeiconsIcon icon={UserAdd01Icon} size={13} />
                        <span>Create Customer Profile</span>
                      </Button>
                    </div>
                  ) : (
                    searchResults.map((cust) => (
                      <button
                        key={cust.id}
                        type="button"
                        onClick={() => {
                          setSelectedCustomer(cust);
                          setIsSearchingCustomer(false);
                          setCustomerSearchQuery('');
                        }}
                        className="w-full text-left p-2 hover:bg-secondary/60 rounded-md transition-all flex justify-between items-center text-xs"
                      >
                        <div>
                          <p className="font-bold text-foreground">{cust.name}</p>
                          <p className="text-[11px] text-muted-foreground font-mono">{cust.phone}</p>
                        </div>
                        <Badge
                          variant={Number(cust.total_due || 0) > 0 ? 'secondary' : 'outline'}
                          className="text-[10px] font-semibold"
                        >
                          Due: {formatCurrency(Number(cust.total_due || 0))}
                        </Badge>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Place Order CTA */}
      <Button
        onClick={handleCheckout}
        disabled={items.length === 0 || createOrderMutation.isPending}
        className={
          paymentMethod === 'pay_later'
            ? 'w-full bg-amber-600 hover:bg-amber-700 text-white font-bold h-11 text-sm shadow-md rounded-md'
            : 'w-full bg-cinnamon hover:bg-cinnamon/90 text-white font-bold h-11 text-sm shadow-md rounded-md'
        }
      >
        {createOrderMutation.isPending
          ? 'Placing Water Order...'
          : paymentMethod === 'pay_later'
          ? `Place Pay Later Water Order (${formatCurrency(grandTotal)})`
          : `Place Water Order (${formatCurrency(grandTotal)})`}
      </Button>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="max-w-md bg-card rounded-md border border-border p-6 shadow-2xl space-y-4 no-scrollbar">
          <DialogHeader className="text-center pb-1 space-y-2">
            <div className="w-14 h-14 mx-auto rounded-md bg-success/15 border border-success/30 flex items-center justify-center text-success shadow-xs">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={28} />
            </div>
            <DialogTitle className="text-xl font-bold font-heading text-foreground text-center">
              Water Order Placed Successfully!
            </DialogTitle>
            <DialogDescription className="text-xs text-center flex items-center justify-center gap-1.5 pt-1">
              <span className="text-muted-foreground">Order Number:</span>
              <span className="font-bold text-cinnamon font-mono text-xs px-2.5 py-0.5 rounded-lg bg-cinnamon/10 border border-cinnamon/20">
                {createdOrder?.order_number}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="p-3.5 rounded-lg bg-secondary/50 border border-border/60 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Customer:</span>
              <span className="font-bold text-foreground">{createdOrder?.customer_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment Method:</span>
              <Badge variant="outline" className="uppercase text-[10px] font-bold">
                {createdOrder?.payment_method === 'pay_later' ? 'PAY LATER' : createdOrder?.payment_method}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Amount:</span>
              <span className="font-bold text-cinnamon">{formatCurrency(createdOrder?.total_amount || 0)}</span>
            </div>
            {createdOrder?.payment_method === 'pay_later' && (
              <div className="flex justify-between pt-1 border-t border-border/40 text-amber-700 dark:text-amber-400 font-bold">
                <span>Water Amount Due:</span>
                <span>{formatCurrency(createdOrder?.amount_due || createdOrder?.total_amount || 0)}</span>
              </div>
            )}
          </div>

          {printMessage && (
            <div className="p-3 rounded-lg bg-secondary text-xs text-center font-medium border border-border/60">
              {printMessage}
            </div>
          )}

          <div className="space-y-2 pt-2">
            {printerStatus === 'connected' && (
              <Button
                onClick={handleManualPrint}
                disabled={isPrinting}
                className="w-full bg-cinnamon hover:bg-cinnamon/90 text-white font-bold h-10 text-xs rounded-md shadow-xs gap-2"
              >
                <HugeiconsIcon icon={PrinterIcon} size={16} />
                <span>{isPrinting ? 'Printing Receipt...' : 'Print Water Receipt via Bluetooth'}</span>
              </Button>
            )}

            <Button
              onClick={() => setShowSuccessModal(false)}
              variant="ghost"
              className="w-full h-9 text-xs font-semibold"
            >
              Done & Start Next Water Order
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quick Add Customer Modal */}
      <WaterCustomerFormModal
        open={showAddCustomerModal}
        onOpenChange={setShowAddCustomerModal}
        onSuccess={handleCustomerCreatedOnTheFly}
      />
    </div>
  );
}
