import { useState } from 'react';
import { useCart } from '../../../hooks/useCart';
import { useCreateOrder } from '../../../hooks/useOrders';
import { useCafeSettings } from '../../../hooks/useCafeSettings';
import { useBluetoothPrinter } from '../../../hooks/useBluetoothPrinter';
import { useCustomerSearch } from '../../../hooks/useCustomers';
import { formatCurrency } from '../../../lib/utils/formatCurrency';
import type { Customer, PaymentMethod } from '../../../types';
import { CustomerFormModal } from '../customers/CustomerFormModal';
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
  UserIcon,
  UserAdd01Icon,
  Search01Icon,
  AlertCircleIcon,
  Cancel01Icon,
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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);

  const [createdOrder, setCreatedOrder] = useState<any | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [printMessage, setPrintMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: searchResults, isLoading: isSearchLoading } = useCustomerSearch(customerSearchQuery);

  const grandTotal = Math.max(0, subtotal - discount);

  const handleCheckout = async () => {
    if (items.length === 0 || createOrderMutation.isPending) return;

    setErrorMsg(null);
    setPrintMessage(null);

    // Validate Pay Later customer requirement
    if (paymentMethod === 'pay_later' && !selectedCustomer) {
      setErrorMsg('Please select or create a customer to place a Pay Later credit order.');
      return;
    }

    const payload = {
      customer_id: selectedCustomer?.id || null,
      customer_name: selectedCustomer
        ? selectedCustomer.name
        : customerName.trim() || 'Walk-in Customer',
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
      setSelectedCustomer(null);
      setCustomerSearchQuery('');
      setPaymentMethod('cash');
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

  const handleCustomerCreatedOnTheFly = (newCustomer: Customer) => {
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
                      : 'bg-cinnamon text-white uppercase font-bold text-[10px] sm:text-[11px] h-8.5 rounded-lg shadow-xs'
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
          <Label className="text-xs font-semibold">Customer Name (Optional)</Label>
          <Input
            placeholder="e.g. Ananya / Table 4"
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
              <span>Credit Customer Profile *</span>
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

          {/* If customer is selected */}
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
                  <span>Existing Outstanding:</span>
                  <span className="font-semibold text-foreground">{formatCurrency(existingOutstanding)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>New Order Total:</span>
                  <span className="font-semibold text-cinnamon">+{formatCurrency(grandTotal)}</span>
                </div>
                <div className="flex justify-between font-bold text-xs pt-1 border-t border-border/40 text-amber-700 dark:text-amber-400">
                  <span>Projected Total Due:</span>
                  <span>{formatCurrency(projectedOutstanding)}</span>
                </div>
              </div>
            </div>
          ) : (
            /* Search customer autocomplete */
            <div className="relative space-y-2">
              <div className="relative">
                <HugeiconsIcon
                  icon={Search01Icon}
                  size={14}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  placeholder="Search customer by name or phone..."
                  value={customerSearchQuery}
                  onChange={(e) => {
                    setCustomerSearchQuery(e.target.value);
                    setIsSearchingCustomer(true);
                  }}
                  onFocus={() => setIsSearchingCustomer(true)}
                  className="h-9 text-xs pl-8 bg-background rounded-md"
                />
              </div>

              {/* Search dropdown results */}
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
                          Outstanding: {formatCurrency(Number(cust.total_due || 0))}
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
          ? 'Processing Order...'
          : paymentMethod === 'pay_later'
          ? `Place Pay Later Order (${formatCurrency(grandTotal)})`
          : `Place Order (${formatCurrency(grandTotal)})`}
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

          {/* Payment & Credit details recap */}
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
                <span>Amount Due:</span>
                <span>{formatCurrency(createdOrder?.due_amount || createdOrder?.total_amount || 0)}</span>
              </div>
            )}
          </div>

          {printMessage && (
            <div className="p-3 rounded-lg bg-secondary text-xs text-center font-medium border border-border/60">
              {printMessage}
            </div>
          )}

          <div className="space-y-2 pt-2">
            {printerStatus === 'connected' ? (
              <Button
                onClick={handleManualPrint}
                disabled={isPrinting}
                className="w-full bg-cinnamon hover:bg-cinnamon/90 text-white font-bold h-10 text-xs rounded-md shadow-xs gap-2"
              >
                <HugeiconsIcon icon={PrinterIcon} size={16} />
                <span>{isPrinting ? 'Printing Receipt...' : 'Reprint Receipt via Bluetooth'}</span>
              </Button>
            ) : (
              <Button
                onClick={() => createdOrder && printBrowserFallback(createdOrder, settings)}
                variant="outline"
                className="w-full h-10 text-xs font-bold gap-2 rounded-md border-border/80"
              >
                <HugeiconsIcon icon={PrinterIcon} size={16} />
                <span>Print Receipt via Browser / PDF</span>
              </Button>
            )}

            <Button
              onClick={() => setShowSuccessModal(false)}
              variant="ghost"
              className="w-full h-9 text-xs font-semibold"
            >
              Done & Start Next Order
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quick Add Customer Modal */}
      <CustomerFormModal
        open={showAddCustomerModal}
        onOpenChange={setShowAddCustomerModal}
        onSuccess={handleCustomerCreatedOnTheFly}
      />
    </div>
  );
}
