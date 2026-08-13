import { useState } from 'react';
import { useWaterCart } from '../../../../store/waterCartStore';
import { useCreateWaterOrder } from '../../../../hooks/useWaterOrders';
import { useBluetoothPrinter } from '../../../../hooks/useBluetoothPrinter';
import { useWaterCustomerSearch } from '../../../../hooks/useWaterCustomers';
import { formatCurrency } from '../../../../lib/utils/formatCurrency';
import type { WaterCustomer, WaterPaymentMethod } from '../../../../types';
import { WaterCustomerFormModal } from '../customers/WaterCustomerFormModal';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Badge } from '../../../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../ui/alert-dialog';
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
  const { status: printerStatus, connect, printOrder, printBrowserFallback } = useBluetoothPrinter();

  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<WaterPaymentMethod>('cash');
  const [selectedCustomer, setSelectedCustomer] = useState<WaterCustomer | null>(null);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);

  const [createdOrder, setCreatedOrder] = useState<any | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showPopupBlockedAlert, setShowPopupBlockedAlert] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [printMessage, setPrintMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [autoPrint, setAutoPrint] = useState<boolean>(() => {
    return localStorage.getItem('radhacafe_autoprint_completion') === 'true';
  });

  const toggleAutoPrint = () => {
    const nextState = !autoPrint;
    setAutoPrint(nextState);
    localStorage.setItem('radhacafe_autoprint_completion', String(nextState));
  };

  const { data: searchResults, isLoading: isSearchLoading } = useWaterCustomerSearch(customerSearchQuery);

  const grandTotal = Math.max(0, subtotal - discount);

  const handlePlaceOrder = async (overrideMethod?: WaterPaymentMethod) => {
    setErrorMsg(null);
    setPrintMessage(null);

    const activeMethod = overrideMethod || paymentMethod;

    if (items.length === 0) {
      setErrorMsg('Cart is empty. Please select products before placing order.');
      return;
    }

    if (activeMethod === 'pay_later' && !selectedCustomer) {
      setErrorMsg('Please select a water credit customer for Pay Later orders.');
      return;
    }

    const payload = {
      customer_id: selectedCustomer ? selectedCustomer.id : null,
      customer_name: selectedCustomer ? selectedCustomer.name : customerName.trim() || 'Walk-in Customer',
      customer_phone: selectedCustomer ? selectedCustomer.phone : null,
      delivery_address: selectedCustomer ? selectedCustomer.address : null,
      payment_method: activeMethod,
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
      const fullOrder = {
        ...order,
        items: items.map((i) => ({
          item_name: i.product.name,
          name: i.product.name,
          unit_price: i.product.price,
          quantity: i.quantity,
        })),
      };
      setCreatedOrder(fullOrder);
      setShowSuccessModal(true);

      clearCart();
      setCustomerName('');
      setSelectedCustomer(null);
      setCustomerSearchQuery('');
      setPaymentMethod('cash');
      if (onCloseMobileCart) onCloseMobileCart();

      // Auto-Print Receipt if Auto-Print setting is enabled
      if (autoPrint) {
        await triggerSmartReceiptPrint(fullOrder);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to place water order. Please try again.');
    }
  };

  const handlePaymentMethodClick = (method: WaterPaymentMethod) => {
    setPaymentMethod(method);
    // If Auto-Print is ON and cart has items, 1-click checkout on CASH/UPI/CARD!
    if (autoPrint && items.length > 0 && method !== 'pay_later') {
      handlePlaceOrder(method);
    }
  };

  const triggerSmartReceiptPrint = async (targetOrder: any) => {
    if (!targetOrder) return;
    setIsPrinting(true);
    setPrintMessage(null);

    // 1. First check if Bluetooth thermal printer is connected
    if (printerStatus === 'connected') {
      try {
        const success = await printOrder(targetOrder as any);
        setIsPrinting(false);
        if (success) {
          setPrintMessage('Water receipt printed successfully via Bluetooth ESC/POS printer!');
          return; // Printed via Bluetooth, skip browser fallback
        }
      } catch {
        setIsPrinting(false);
      }
    }

    // 2. Fallback to browser thermal slip print if Bluetooth printer is NOT connected
    setIsPrinting(false);
    setPrintMessage('No Bluetooth printer connected. Opening browser print slip...');
    setTimeout(() => {
      const opened = printBrowserFallback(targetOrder as any);
      if (!opened) {
        setShowPopupBlockedAlert(true);
      }
    }, 150);
  };

  const handleBluetoothPrint = async () => {
    if (!createdOrder) return;
    if (printerStatus !== 'connected') {
      try {
        await connect();
      } catch (err: any) {
        setPrintMessage(err.message || 'Bluetooth connection failed.');
        return;
      }
    }
    await triggerSmartReceiptPrint(createdOrder);
  };

  const handleCustomerCreatedOnTheFly = (newCustomer: WaterCustomer) => {
    setSelectedCustomer(newCustomer);
    setCustomerSearchQuery('');
    setIsSearchingCustomer(false);
  };

  const existingOutstanding = Number(selectedCustomer?.total_due || 0);
  const projectedOutstanding = existingOutstanding + grandTotal;

  return (
    <div className="border border-border/80 rounded-md p-4 sm:p-5 bg-card flex flex-col space-y-4 shadow-sm max-h-[calc(100vh-6.5rem)] overflow-y-auto no-scrollbar">
      <div className="flex justify-between items-center border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={ShoppingCart01Icon} size={18} className="text-cinnamon" />
          <h3 className="font-bold text-sm sm:text-base text-foreground font-heading">Water Order Cart</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleAutoPrint}
            title={autoPrint ? 'Auto-Print is ON: Thermal slip generates automatically upon order creation' : 'Click to enable Auto-Print receipt'}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold border transition-all ${autoPrint
              ? 'bg-cinnamon/15 text-cinnamon border-cinnamon/30 shadow-2xs'
              : 'bg-secondary/40 text-muted-foreground border-border/50 hover:bg-secondary'
              }`}
          >
            <HugeiconsIcon icon={PrinterIcon} size={12} />
            <span>Auto-Print: {autoPrint ? 'ON' : 'OFF'}</span>
          </button>

          {items.length > 0 && (
            <Button
              size="xs"
              variant="ghost"
              className="text-xs text-muted-foreground hover:text-destructive transition-colors h-7"
              onClick={clearCart}
            >
              Clear All
            </Button>
          )}
        </div>
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
                onClick={() => handlePaymentMethodClick(method)}
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
        onClick={() => handlePlaceOrder()}
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

      {/* Responsive Side-by-Side Laptop / Stacked Mobile Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="max-w-md sm:max-w-2xl md:max-w-3xl max-h-[90vh] overflow-y-auto bg-card rounded-md border border-border/80 p-4 sm:p-6 shadow-2xl space-y-4 no-scrollbar">
          <DialogHeader className="text-center pb-2 border-b border-border/60 space-y-1">
            <div className="w-12 h-12 mx-auto rounded-full bg-success/15 border border-success/30 flex items-center justify-center text-success shadow-2xs">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={24} />
            </div>
            <DialogTitle className="text-xl font-bold font-heading text-foreground text-center">
              Water Order Placed Successfully!
            </DialogTitle>
            <DialogDescription className="text-xs text-center flex items-center justify-center gap-1.5 pt-0.5">
              <span className="text-muted-foreground">Order Number:</span>
              <span className="font-bold text-cinnamon font-mono text-xs px-2.5 py-0.5 rounded-md bg-cinnamon/10 border border-cinnamon/20">
                {createdOrder?.order_number}
              </span>
            </DialogDescription>
          </DialogHeader>

          {/* 2-Column Responsive Layout: Thermal Paper Slip (Left) & Actions (Right) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start pt-1">
            {/* Left Column: Authentic Thermal Receipt Paper Slip */}
            <div className="bg-[#fefdfa] dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-mono text-[11px] leading-relaxed p-4 rounded-md border border-stone-300/80 dark:border-stone-700 shadow-md space-y-2 select-text max-h-[380px] overflow-y-auto no-scrollbar relative">
              <div className="text-center space-y-0.5 pb-2 border-b border-dashed border-stone-400 dark:border-stone-700">
                <p className="font-bold text-sm tracking-widest text-cinnamon uppercase font-heading">RADHAWATER</p>
                <p className="text-[10px] text-stone-600 dark:text-stone-400">1A, Vellampalli Tallur Rd, opposite Pattu Office</p>
                <p className="text-[10px] text-stone-600 dark:text-stone-400">Tallur, Andhra Pradesh 523264 • Tel: 09966630913</p>
              </div>

              <div className="space-y-0.5 text-[10px] py-1 border-b border-dashed border-stone-400 dark:border-stone-700 text-stone-700 dark:text-stone-300">
                <div className="flex justify-between">
                  <span>Order #:</span>
                  <span className="font-bold">{createdOrder?.order_number}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span>{new Date(createdOrder?.created_at || Date.now()).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                </div>
                <div className="flex justify-between">
                  <span>Customer:</span>
                  <span className="font-bold">{createdOrder?.customer_name || 'Walk-in Customer'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment:</span>
                  <span className="uppercase font-bold text-cinnamon">{createdOrder?.payment_method}</span>
                </div>
              </div>

              {/* Itemized Order Table */}
              <div className="py-1 border-b border-dashed border-stone-400 dark:border-stone-700 space-y-1">
                <div className="flex justify-between font-bold text-[10px] text-stone-700 dark:text-stone-400 border-b border-stone-300 dark:border-stone-800 pb-1">
                  <span>Water Product (Qty)</span>
                  <span>Amount</span>
                </div>
                {createdOrder?.items && createdOrder.items.length > 0 ? (
                  createdOrder.items.map((item: any, idx: number) => {
                    const name = item.item_name || item.product_name || item.name || 'Water Can';
                    const qty = item.quantity || 1;
                    const price = item.unit_price || item.price || 0;
                    return (
                      <div key={idx} className="flex justify-between items-center text-[11px]">
                        <span className="truncate max-w-[170px]">
                          {name} ×{qty}
                        </span>
                        <span className="font-bold">
                          {formatCurrency(price * qty)}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-[10px] text-stone-500 italic text-center py-1">
                    Itemized water slip details
                  </div>
                )}
              </div>

              <div className="space-y-0.5 pt-1 text-[11px]">
                <div className="flex justify-between font-bold text-xs pt-0.5">
                  <span>TOTAL AMOUNT:</span>
                  <span className="text-cinnamon">{formatCurrency(createdOrder?.total_amount || 0)}</span>
                </div>
              </div>

              <div className="text-center pt-2 text-[9.5px] text-stone-500 italic">
                Thank You! Visit RadhaWater Again.
              </div>
            </div>

            {/* Right Column: Actions & Summary */}
            <div className="space-y-3.5 flex flex-col justify-between h-full">
              <div className="p-3.5 rounded-md bg-secondary/50 border border-border/60 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Customer Profile:</span>
                  <span className="font-bold text-foreground">{createdOrder?.customer_name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Payment Method:</span>
                  <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-cinnamon/10 text-cinnamon border border-cinnamon/20">
                    {createdOrder?.payment_method === 'pay_later' ? 'PAY LATER' : createdOrder?.payment_method}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-border/40">
                  <span className="text-muted-foreground font-semibold">Total Paid/Charged:</span>
                  <span className="font-bold text-cinnamon text-sm">{formatCurrency(createdOrder?.total_amount || 0)}</span>
                </div>
              </div>

              {printMessage && (
                <div className="p-2.5 rounded-lg bg-secondary text-xs text-center font-medium border border-border/60 text-foreground">
                  {printMessage}
                </div>
              )}

              <div className="space-y-2.5 pt-1">
                <Button
                  onClick={handleBluetoothPrint}
                  disabled={isPrinting}
                  className="w-full bg-cinnamon hover:bg-cinnamon/90 text-white font-bold h-11 text-xs rounded-md shadow-md gap-2 transition-all active:scale-[0.98]"
                >
                  <HugeiconsIcon icon={PrinterIcon} size={16} />
                  <span>
                    {isPrinting
                      ? 'Printing Thermal Receipt...'
                      : printerStatus === 'connected'
                        ? 'Print Thermal Receipt (Bluetooth Connected)'
                        : 'Connect & Print Thermal Receipt (Bluetooth)'}
                  </span>
                </Button>

                <Button
                  onClick={() => createdOrder && printBrowserFallback(createdOrder as any)}
                  variant="outline"
                  className="w-full h-10 text-xs font-bold gap-2 rounded-md border-border/80 hover:bg-secondary"
                >
                  <HugeiconsIcon icon={PrinterIcon} size={16} />
                  <span>Print Receipt via Browser / PDF</span>
                </Button>

                <Button
                  onClick={() => setShowSuccessModal(false)}
                  variant="ghost"
                  className="w-full h-9 text-xs font-semibold text-muted-foreground hover:text-foreground"
                >
                  Done & Start Next Water Order
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Popups Blocked Alert Dialog */}
      <AlertDialog open={showPopupBlockedAlert} onOpenChange={setShowPopupBlockedAlert}>
        <AlertDialogContent className="max-w-md bg-card border border-border/80 p-6 rounded-2xl shadow-2xl space-y-4">
          <AlertDialogHeader className="space-y-2">
            <div className="w-12 h-12 rounded-full bg-amber-500/15 text-amber-600 flex items-center justify-center mx-auto">
              <HugeiconsIcon icon={PrinterIcon} size={24} />
            </div>
            <AlertDialogTitle className="text-center text-lg font-bold font-heading text-foreground">
              Browser Popups Blocked
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-xs text-muted-foreground leading-relaxed">
              Your browser blocked the print receipt window. Please allow popups for this site in your browser address bar to automatically generate and print thermal receipts.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex justify-center pt-2">
            <AlertDialogAction
              onClick={() => setShowPopupBlockedAlert(false)}
              className="w-full sm:w-auto bg-cinnamon hover:bg-cinnamon/90 text-white font-bold text-xs h-10 px-6 rounded-md shadow-md"
            >
              Got It, I'll Enable Popups
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Quick Add Customer Modal */}
      <WaterCustomerFormModal
        open={showAddCustomerModal}
        onOpenChange={setShowAddCustomerModal}
        onSuccess={handleCustomerCreatedOnTheFly}
      />
    </div>
  );
}
