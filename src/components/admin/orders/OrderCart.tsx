import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCart } from '../../../hooks/useCart';
import { useCreateOrder } from '../../../hooks/useOrders';
import { useCafeSettings } from '../../../hooks/useCafeSettings';
import { useBluetoothPrinter } from '../../../hooks/useBluetoothPrinter';
import { useActiveReceiptTemplate } from '../../../hooks/useReceiptTemplates';
import { useCustomerSearch } from '../../../hooks/useCustomers';
import { formatCurrency } from '../../../lib/utils/formatCurrency';
import type { Customer, PaymentMethod } from '../../../types';
import { CustomerFormModal } from '../customers/CustomerFormModal';
import { ReceiptPreview } from '../printer/ReceiptPreview';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../ui/alert-dialog';
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
  const queryClient = useQueryClient();
  const { items, updateQuantity, removeItem, clearCart, subtotal, discount, setDiscount } = useCart();
  const { data: settings } = useCafeSettings();
  const { data: activeTemplate } = useActiveReceiptTemplate();
  const createOrderMutation = useCreateOrder();
  const { status: printerStatus, connect, printOrder, printBrowserFallback } = useBluetoothPrinter();

  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
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

  const { data: customerSearchResults } = useCustomerSearch(customerSearchQuery);

  const grandTotal = Math.max(0, subtotal - discount);

  const toggleAutoPrint = () => {
    const nextState = !autoPrint;
    setAutoPrint(nextState);
    localStorage.setItem('radhacafe_autoprint_completion', String(nextState));
  };

  const handlePlaceOrder = async (overrideMethod?: PaymentMethod) => {
    setErrorMsg(null);
    setPrintMessage(null);

    const activeMethod = overrideMethod || paymentMethod;

    if (items.length === 0) {
      setErrorMsg('Cart is empty. Please add items before placing order.');
      return;
    }

    if (activeMethod === 'pay_later' && !selectedCustomer) {
      setErrorMsg('Please select a credit customer for Pay Later orders.');
      return;
    }

    const payload = {
      customer_id: selectedCustomer ? selectedCustomer.id : null,
      customer_name: selectedCustomer ? selectedCustomer.name : customerName.trim() || 'Walk-in Customer',
      customer_phone: selectedCustomer ? selectedCustomer.phone : null,
      payment_method: activeMethod,
      discount_amount: discount,
      tax_amount: 0,
      notes: null,
      items: items.map((i) => ({
        menu_item_id: i.menuItem.id,
        item_name: i.menuItem.name,
        unit_price: i.menuItem.price,
        quantity: i.quantity,
      })),
    };

    try {
      const order = await createOrderMutation.mutateAsync(payload);
      const fullOrder = {
        ...order,
        items: items.map((i) => ({
          item_name: i.menuItem.name,
          name: i.menuItem.name,
          unit_price: i.menuItem.price,
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

      // Invalidate best-sellers analytics in background
      queryClient.invalidateQueries({ queryKey: ['menu', 'best-sellers'] });

      // Auto-Print Receipt if Auto-Print setting is enabled
      if (autoPrint) {
        await triggerSmartReceiptPrint(fullOrder);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to place order. Please try again.');
    }
  };

  const handlePaymentMethodClick = (method: PaymentMethod) => {
    setPaymentMethod(method);
    // If Auto-Print is ON and cart has items, 1-click checkout on CASH/UPI/CARD!
    if (autoPrint && items.length > 0 && method !== 'pay_later') {
      handlePlaceOrder(method);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setCreatedOrder(null);
    setPrintMessage(null);
  };

  const triggerSmartReceiptPrint = async (targetOrder: any) => {
    if (!targetOrder) return;
    setIsPrinting(true);
    setPrintMessage(null);

    // 1. First check if Bluetooth thermal printer is connected
    if (printerStatus === 'connected') {
      try {
        const success = await printOrder(targetOrder);
        setIsPrinting(false);
        if (success) {
          setPrintMessage('Receipt printed successfully via Bluetooth ESC/POS printer!');
          setTimeout(() => {
            handleCloseSuccessModal();
          }, 800);
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
      const opened = printBrowserFallback(targetOrder, settings);
      if (!opened) {
        setShowPopupBlockedAlert(true);
      }
      setTimeout(() => {
        handleCloseSuccessModal();
      }, 1000);
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

  const handleCustomerCreatedOnTheFly = (newCustomer: Customer) => {
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
          <HugeiconsIcon icon={ShoppingCart01Icon} className="text-cinnamon" size={20} />
          <h3 className="font-bold text-base font-heading text-foreground">Live Order Cart</h3>
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
                  <span className="font-semibold text-cinnamon">
                    {formatCurrency(item.menuItem.price * item.quantity)}
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  size="xs"
                  variant="outline"
                  className="h-6 w-6 p-0 rounded-md"
                  onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                >
                  <HugeiconsIcon icon={MinusSignIcon} size={12} />
                </Button>
                <span className="font-bold w-5 text-center text-xs">{item.quantity}</span>
                <Button
                  size="xs"
                  variant="outline"
                  className="h-6 w-6 p-0 rounded-md"
                  onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                >
                  <HugeiconsIcon icon={PlusSignIcon} size={12} />
                </Button>
                <Button
                  size="xs"
                  variant="ghost"
                  className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10 ml-1 rounded-md"
                  onClick={() => removeItem(item.menuItem.id)}
                >
                  <HugeiconsIcon icon={Delete02Icon} size={14} />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

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
                onClick={() => handlePaymentMethodClick(method)}
              >
                {isPayLater ? 'Pay Later' : method}
              </Button>
            );
          })}
        </div>
      </div>

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
                  <span>Projected Due Balance:</span>
                  <span>{formatCurrency(projectedOutstanding)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2 relative">
              <div className="relative">
                <HugeiconsIcon icon={Search01Icon} size={14} className="absolute left-2.5 top-2.5 text-muted-foreground" />
                <Input
                  placeholder="Search customer by name or phone..."
                  value={customerSearchQuery}
                  onChange={(e) => {
                    setCustomerSearchQuery(e.target.value);
                    setIsSearchingCustomer(true);
                  }}
                  className="h-8.5 pl-8 text-xs bg-background rounded-md"
                />
              </div>

              {isSearchingCustomer && customerSearchQuery.trim() && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-popover border border-border rounded-md shadow-lg z-50 max-h-40 overflow-y-auto p-1 space-y-1">
                  {customerSearchResults && customerSearchResults.length > 0 ? (
                    customerSearchResults.map((cust) => (
                      <button
                        key={cust.id}
                        type="button"
                        className="w-full text-left p-2 rounded-md hover:bg-secondary flex justify-between items-center text-xs transition-colors"
                        onClick={() => {
                          setSelectedCustomer(cust);
                          setIsSearchingCustomer(false);
                        }}
                      >
                        <div>
                          <p className="font-bold text-foreground">{cust.name}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">{cust.phone}</p>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-amber-600">
                          {formatCurrency(cust.total_due || 0)} due
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="p-3 text-center text-xs text-muted-foreground">
                      No customer found with "{customerSearchQuery}".
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <Button
        type="button"
        size="lg"
        onClick={() => handlePlaceOrder()}
        disabled={items.length === 0 || createOrderMutation.isPending}
        className="w-full bg-cinnamon hover:bg-cinnamon/90 text-white font-bold h-11 text-sm rounded-md shadow-md transition-all active:scale-[0.99] mt-2"
      >
        {createOrderMutation.isPending
          ? 'Processing Order...'
          : paymentMethod === 'pay_later'
            ? `Place Pay Later Order (${formatCurrency(grandTotal)})`
            : `Place Order (${formatCurrency(grandTotal)})`}
      </Button>

      {/* Responsive Side-by-Side Laptop / Stacked Mobile Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="max-w-md sm:max-w-2xl md:max-w-3xl max-h-[90vh] overflow-y-auto bg-card rounded-md border border-border/80 p-4 sm:p-6 shadow-2xl space-y-4 no-scrollbar">
          <DialogHeader className="text-center pb-2 border-b border-border/60 space-y-1">
            <div className="w-12 h-12 mx-auto rounded-full bg-success/15 border border-success/30 flex items-center justify-center text-success shadow-2xs">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={24} />
            </div>
            <DialogTitle className="text-xl font-bold font-heading text-foreground text-center">
              Order Placed Successfully!
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
            {/* Left Column: Authentic Template-Based Thermal Receipt Paper Slip */}
            <div className="max-h-[380px] overflow-y-auto rounded-md border border-border/80 shadow-xs">
              <ReceiptPreview
                order={createdOrder}
                templateConfig={activeTemplate?.template_config}
                cafeSettings={settings}
              />
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
                  onClick={() => {
                    if (createdOrder) {
                      printBrowserFallback(createdOrder, settings);
                      setTimeout(() => {
                        handleCloseSuccessModal();
                      }, 1000);
                    }
                  }}
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
                  Done & Start Next Order
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Popups Blocked Alert Dialog */}
      <AlertDialog open={showPopupBlockedAlert} onOpenChange={setShowPopupBlockedAlert}>
        <AlertDialogContent className="max-w-md bg-card border border-border/80 p-6 rounded-md shadow-2xl space-y-4">
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

      <CustomerFormModal
        open={showAddCustomerModal}
        onOpenChange={setShowAddCustomerModal}
        onSuccess={handleCustomerCreatedOnTheFly}
      />
    </div>
  );
}
