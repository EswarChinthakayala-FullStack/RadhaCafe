import { useState } from 'react';
import { useCart } from '../../../hooks/useCart';
import { useCreateOrder } from '../../../hooks/useOrders';
import { useCafeSettings } from '../../../hooks/useCafeSettings';
import { useBluetoothPrinter } from '../../../hooks/useBluetoothPrinter';
import { formatCurrency } from '../../../lib/utils/formatCurrency';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Badge } from '../../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../ui/dialog';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  PlusSignIcon,
  MinusSignIcon,
  Delete02Icon,
  PrinterIcon,
  CheckmarkCircle02Icon,
  ShoppingCart01Icon,
} from '@hugeicons/core-free-icons';

interface OrderCartProps {
  onCloseMobileCart?: () => void;
}

export function OrderCart({ onCloseMobileCart }: OrderCartProps) {
  const { items, updateQuantity, removeItem, clearCart, subtotal, discount, setDiscount } = useCart();
  const { data: settings } = useCafeSettings();
  const createOrderMutation = useCreateOrder();
  const { status: printerStatus, printOrder, printBrowserFallback } = useBluetoothPrinter();

  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'upi' | 'other'>('cash');
  const [createdOrder, setCreatedOrder] = useState<any | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [printMessage, setPrintMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const grandTotal = Math.max(0, subtotal - discount);

  const handleCheckout = async () => {
    if (items.length === 0 || createOrderMutation.isPending) return;

    setErrorMsg(null);
    setPrintMessage(null);

    const payload = {
      customer_name: customerName.trim() || 'Walk-in Customer',
      payment_method: paymentMethod,
      tax_amount: 0,
      discount_amount: discount,
      items: items.map((i) => ({
        menu_item_id: i.menuItem.id,
        item_name: i.menuItem.name,
        unit_price: i.menuItem.price,
        quantity: i.quantity,
      })),
    };

    try {
      // 1. Create order in Supabase via RPC
      const order = await createOrderMutation.mutateAsync(payload);
      setCreatedOrder(order);
      setShowSuccessModal(true);

      // Clear cart immediately upon successful order creation
      clearCart();
      setCustomerName('');
      if (onCloseMobileCart) onCloseMobileCart();

      // 2. Auto-trigger bluetooth printing if printer is connected
      if (printerStatus === 'connected') {
        setIsPrinting(true);
        const success = await printOrder(order);
        setIsPrinting(false);
        if (success) {
          setPrintMessage('Receipt printed successfully via Bluetooth!');
        } else {
          setPrintMessage('Automatic print failed. You can retry printing below.');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to place order. Please try again.');
    }
  };

  const handleManualPrint = async () => {
    if (!createdOrder) return;
    setIsPrinting(true);
    setPrintMessage(null);
    const success = await printOrder(createdOrder);
    setIsPrinting(false);
    if (success) {
      setPrintMessage('Receipt printed successfully via Bluetooth!');
    } else {
      setPrintMessage('Bluetooth print attempt failed. Check printer connection.');
    }
  };

  return (
    <div className="border border-border/80 rounded-md p-5 bg-card flex flex-col h-full space-y-4 shadow-sm">
      <div className="flex justify-between items-center border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={ShoppingCart01Icon} size={18} className="text-primary" />
          <h3 className="font-bold text-sm sm:text-base text-foreground font-heading">Live Order Cart</h3>
        </div>
        {items.length > 0 && (
          <button onClick={clearCart} className="text-xs text-destructive hover:underline font-semibold">
            Clear All
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 text-xs font-medium">
          {errorMsg}
        </div>
      )}

      {/* Customer Name */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold">Customer Name (Optional)</Label>
        <Input
          placeholder="e.g. Ananya / Table 4"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          className="h-9 text-xs bg-background rounded-md"
        />
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 min-h-[200px] max-h-[350px] pr-1">
        {items.length === 0 ? (
          <div className="text-center py-12 space-y-2 border border-dashed border-border/60 rounded-md bg-secondary/20">
            <HugeiconsIcon icon={ShoppingCart01Icon} className="mx-auto text-muted-foreground/40 w-8 h-8" />
            <p className="text-xs font-semibold text-foreground">Your order is empty</p>
            <p className="text-[11px] text-muted-foreground">Select items from the menu to start a new order.</p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.menuItem.id}
              className="flex justify-between items-center text-xs p-3 rounded-md bg-secondary/40 border border-border/40"
            >
              <div className="flex-1 min-w-0 pr-2 space-y-0.5">
                <p className="font-bold text-foreground truncate">{item.menuItem.name}</p>
                <p className="text-[11px] text-muted-foreground">
                  {formatCurrency(item.menuItem.price)} × {item.quantity} ={' '}
                  <span className="font-semibold text-cinnamon">{formatCurrency(item.menuItem.price * item.quantity)}</span>
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  size="xs"
                  variant="outline"
                  className="h-6 w-6 p-0 rounded-md"
                  onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                  aria-label="Decrease quantity"
                >
                  <HugeiconsIcon icon={MinusSignIcon} size={12} />
                </Button>
                <span className="font-bold w-5 text-center text-xs">{item.quantity}</span>
                <Button
                  size="xs"
                  variant="outline"
                  className="h-6 w-6 p-0 rounded-md"
                  onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                  aria-label="Increase quantity"
                >
                  <HugeiconsIcon icon={PlusSignIcon} size={12} />
                </Button>
                <Button
                  size="xs"
                  variant="ghost"
                  className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10 ml-1 rounded-md"
                  onClick={() => removeItem(item.menuItem.id)}
                  aria-label="Remove item"
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

      {/* Payment Method Segment */}
      <div className="space-y-1.5 pt-1">
        <Label className="text-xs font-semibold">Payment Method</Label>
        <div className="grid grid-cols-4 gap-1.5">
          {(['cash', 'upi', 'card', 'other'] as const).map((method) => (
            <Button
              key={method}
              type="button"
              variant={paymentMethod === method ? 'default' : 'outline'}
              size="xs"
              className={
                paymentMethod === method
                  ? 'bg-cinnamon text-white uppercase font-bold text-[10px] h-8 rounded-lg shadow-xs'
                  : 'uppercase text-[10px] h-8 text-foreground/80 rounded-lg'
              }
              onClick={() => setPaymentMethod(method)}
            >
              {method}
            </Button>
          ))}
        </div>
      </div>

      {/* Place Order CTA */}
      <Button
        onClick={handleCheckout}
        disabled={items.length === 0 || createOrderMutation.isPending}
        className="w-full bg-cinnamon hover:bg-cinnamon/90 text-white font-bold h-11 text-sm shadow-md rounded-md"
      >
        {createOrderMutation.isPending ? 'Processing Order...' : `Place Order (${formatCurrency(grandTotal)})`}
      </Button>

      {/* Success & Print Action Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="max-w-md bg-card rounded-md border border-border p-6 shadow-2xl space-y-4 no-scrollbar">
          <DialogHeader className="text-center pb-1 space-y-2">
            <div className="w-14 h-14 mx-auto rounded-md bg-success/15 border border-success/30 flex items-center justify-center text-success shadow-xs">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={28} />
            </div>
            <DialogTitle className="text-xl font-bold font-heading text-foreground text-center">
              Order Placed Successfully!
            </DialogTitle>
            <DialogDescription className="text-xs text-center flex items-center justify-center gap-1.5 pt-1">
              <span className="text-muted-foreground">Order Number:</span>
              <span className="font-bold text-cinnamon font-mono text-xs px-2.5 py-0.5 rounded-lg bg-cinnamon/10 border border-cinnamon/20">
                {createdOrder?.order_number}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-xs pt-1">
            <div className="p-4 rounded-md bg-secondary/40 border border-border/60 space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-medium">Customer:</span>
                <span className="font-bold text-foreground">{createdOrder?.customer_name || 'Walk-in Customer'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-medium">Total Paid:</span>
                <span className="font-bold text-cinnamon text-sm">{formatCurrency(createdOrder?.total_amount || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-medium">Printer Status:</span>
                <Badge
                  variant={printerStatus === 'connected' ? 'default' : 'outline'}
                  className={
                    printerStatus === 'connected'
                      ? 'bg-success text-white text-[10px] font-bold capitalize'
                      : 'text-muted-foreground text-[10px] capitalize'
                  }
                >
                  {printerStatus}
                </Badge>
              </div>
            </div>

            {printMessage && (
              <div
                className={`p-3 rounded-md text-xs font-medium border ${printMessage.includes('successfully')
                  ? 'bg-success/10 text-success border-success/20'
                  : 'bg-amber-500/10 text-amber-800 border-amber-500/20'
                  }`}
              >
                {printMessage}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2.5">
              <Button
                type="button"
                variant="outline"
                disabled={isPrinting}
                className="text-xs font-semibold h-10 rounded-md gap-1.5 border-border/80 hover:bg-secondary/40"
                onClick={handleManualPrint}
              >
                <HugeiconsIcon icon={PrinterIcon} size={15} />
                <span>{isPrinting ? 'Printing...' : 'Bluetooth Print'}</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="text-xs font-semibold h-10 rounded-md gap-1.5 border-border/80 hover:bg-secondary/40"
                onClick={() => createdOrder && printBrowserFallback(createdOrder, settings)}
              >
                <HugeiconsIcon icon={PrinterIcon} size={15} />
                <span>Browser Print</span>
              </Button>
            </div>

            <Button
              type="button"
              className="w-full bg-cinnamon hover:bg-cinnamon/90 text-white font-bold text-xs h-11 rounded-md shadow-md gap-1.5 transition-all"
              onClick={() => setShowSuccessModal(false)}
            >
              <HugeiconsIcon icon={PlusSignIcon} size={16} />
              <span>Start New Order</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
