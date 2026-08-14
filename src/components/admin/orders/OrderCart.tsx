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
import { printOrderViaBrowser } from '../../../lib/printer/browserPrint';
import { toast } from '../../ui/toast';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
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
  Coins01Icon,
  QrCodeIcon,
  CreditCardIcon,
  Clock01Icon,
  ShoppingBag01Icon,
  Discount01Icon,
  Loading03Icon,
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
  const { status: printerStatus, connect, printOrder } = useBluetoothPrinter();

  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [showClearConfirmDialog, setShowClearConfirmDialog] = useState(false);
  const [showDiscountInput, setShowDiscountInput] = useState(false);

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

  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Tax set to 0 as configured
  const taxRate = 0;
  const taxableAmount = Math.max(0, subtotal - discount);
  const calculatedTax = 0;
  const grandTotal = taxableAmount;

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
      tax_amount: calculatedTax,
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

      // Clear runtime cart ONLY after atomic DB commit succeeds
      clearCart();
      setCustomerName('');
      setSelectedCustomer(null);
      setCustomerSearchQuery('');
      setPaymentMethod('cash');
      setShowDiscountInput(false);
      if (onCloseMobileCart) onCloseMobileCart();

      // Invalidate relevant queries in background
      queryClient.invalidateQueries({ queryKey: ['menu', 'best-sellers'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      if (selectedCustomer) {
        queryClient.invalidateQueries({ queryKey: ['customers'] });
      }

      // Auto-Print Receipt if Auto-Print setting is enabled or Bluetooth printer is connected
      if (autoPrint || printerStatus === 'connected') {
        await triggerSmartReceiptPrint(fullOrder);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to place order. Please try again.');
    }
  };

  const handlePaymentMethodClick = (method: PaymentMethod) => {
    if (method === 'cash' || method === 'pay_later') {
      setPaymentMethod(method);
      return;
    }

    const labelMap: Record<string, string> = {
      upi: 'UPI',
      card: 'Card',
      other: 'Other',
    };
    const methodName = labelMap[method] || method.toUpperCase();

    toast.add({
      title: `${methodName} Payment Coming Soon`,
      description: `${methodName} payment integration is coming soon. Please use Cash or Credit (Pay Later) for now.`,
      type: 'info',
    });
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setPrintMessage(null);
    setIsPrinting(false);
  };

  const triggerSmartReceiptPrint = async (targetOrder: any) => {
    if (!targetOrder) return;
    setIsPrinting(true);
    setPrintMessage(null);

    // 1. First check if Bluetooth thermal printer is connected -> print directly via BLE ESC/POS
    if (printerStatus === 'connected') {
      try {
        const success = await printOrder(targetOrder);
        setIsPrinting(false);
        if (success) {
          setPrintMessage('Receipt printed successfully via Bluetooth!');
          toast.add({
            title: 'Thermal Receipt Printed',
            description: `Order #${targetOrder.order_number} sent to Bluetooth printer.`,
            type: 'success',
          });
          setTimeout(() => {
            handleCloseSuccessModal();
          }, 1200);
          return;
        }
      } catch (err: any) {
        setIsPrinting(false);
        setPrintMessage(err.message || 'Bluetooth printing failed. Falling back to browser print...');
      }
    }

    // 2. Fallback to Browser / PDF print (when Bluetooth printer is not connected or failed)
    setIsPrinting(false);
    setPrintMessage('Opening browser print slip...');
    setTimeout(() => {
      const opened = printOrderViaBrowser(targetOrder, settings, activeTemplate?.template_config);
      if (opened) {
        setPrintMessage('Receipt generated for browser / PDF printing.');
      } else {
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

  const handleCustomerCreatedOnTheFly = (newCustomer: Customer) => {
    setSelectedCustomer(newCustomer);
    setCustomerSearchQuery('');
    setIsSearchingCustomer(false);
  };

  const existingOutstanding = Number(selectedCustomer?.total_due || 0);
  const projectedOutstanding = existingOutstanding + grandTotal;

  const paymentOptions: { id: PaymentMethod; label: string; icon: any }[] = [
    { id: 'cash', label: 'Cash', icon: Coins01Icon },
    { id: 'upi', label: 'UPI', icon: QrCodeIcon },
    { id: 'card', label: 'Card', icon: CreditCardIcon },
    { id: 'pay_later', label: 'Pay Later', icon: Clock01Icon },
    { id: 'other', label: 'Other', icon: ShoppingBag01Icon },
  ];

  return (
    <div className="border border-border/80 rounded-xl p-3 sm:p-4 bg-card flex flex-col space-y-3 shadow-2xs">
      {/* ── Cart Header ── */}
      <div className="flex justify-between items-center border-b border-border/70 pb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-lg bg-cinnamon/10 text-cinnamon shrink-0">
            <HugeiconsIcon icon={ShoppingCart01Icon} size={16} />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-sm font-heading text-foreground leading-tight">Current Order</h3>
            <span className="text-[10px] text-muted-foreground font-mono">
              {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Auto-Print Toggle — compact icon button */}
          <button
            type="button"
            onClick={toggleAutoPrint}
            title={autoPrint ? 'Auto-Print ON' : 'Auto-Print OFF'}
            aria-label={autoPrint ? 'Disable auto-print' : 'Enable auto-print'}
            className={`h-7 w-7 rounded-md flex items-center justify-center border transition-all ${
              autoPrint
                ? 'bg-cinnamon/15 text-cinnamon border-cinnamon/30'
                : 'bg-secondary/40 text-muted-foreground border-border/50 hover:bg-secondary'
            }`}
          >
            <HugeiconsIcon icon={PrinterIcon} size={13} />
          </button>

          {items.length > 0 && (
            <Button
              size="xs"
              variant="ghost"
              className="text-[11px] font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors h-7 px-2"
              onClick={() => setShowClearConfirmDialog(true)}
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* ── Error Banner ── */}
      {errorMsg && (
        <div className="p-2.5 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 text-xs font-medium flex items-center gap-2">
          <HugeiconsIcon icon={AlertCircleIcon} size={15} className="shrink-0 text-destructive" />
          <span className="flex-1">{errorMsg}</span>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="text-destructive/80 hover:text-destructive p-0.5"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={12} />
          </button>
        </div>
      )}

      {/* ── Cart Line Items List (Scrollable) ── */}
      <div className="overflow-y-auto space-y-1.5 max-h-[260px] sm:max-h-[300px] pr-0.5 scrollbar-thin">
        {items.length === 0 ? (
          <div className="text-center py-8 space-y-2 border border-dashed border-border/70 rounded-lg bg-secondary/20">
            <div className="w-9 h-9 mx-auto rounded-full bg-secondary flex items-center justify-center text-muted-foreground/40">
              <HugeiconsIcon icon={ShoppingCart01Icon} size={18} />
            </div>
            <p className="text-xs font-bold text-foreground">Your order is empty</p>
            <p className="text-[11px] text-muted-foreground max-w-[200px] mx-auto">
              Select menu items from the catalog to build this order.
            </p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.menuItem.id}
              className="flex justify-between items-center text-xs p-2.5 rounded-lg bg-secondary/35 border border-border/60 hover:bg-secondary/50 transition-colors"
            >
              <div className="flex-1 min-w-0 pr-2 space-y-0.5">
                <p className="font-bold text-foreground truncate">{item.menuItem.name}</p>
                <p className="text-[10px] text-muted-foreground font-mono">
                  {formatCurrency(item.menuItem.price)} × {item.quantity} ={' '}
                  <span className="font-bold text-cinnamon">
                    {formatCurrency(item.menuItem.price * item.quantity)}
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  className="h-6 w-6 rounded-md bg-card border border-border/70 text-foreground flex items-center justify-center hover:bg-secondary active:scale-95 transition-all text-xs"
                  onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                  aria-label={`Decrease ${item.menuItem.name}`}
                >
                  <HugeiconsIcon icon={MinusSignIcon} size={11} />
                </button>
                <span className="font-bold font-mono w-5 text-center text-xs text-foreground">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  className="h-6 w-6 rounded-md bg-card border border-border/70 text-foreground flex items-center justify-center hover:bg-secondary active:scale-95 transition-all text-xs"
                  onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                  aria-label={`Increase ${item.menuItem.name}`}
                >
                  <HugeiconsIcon icon={PlusSignIcon} size={11} />
                </button>
                <button
                  type="button"
                  className="h-6 w-6 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex items-center justify-center ml-1 transition-colors"
                  onClick={() => removeItem(item.menuItem.id)}
                  aria-label={`Remove ${item.menuItem.name}`}
                >
                  <HugeiconsIcon icon={Delete02Icon} size={13} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Totals & Financial Breakdown ── */}
      <div className="border-t border-border/70 pt-2.5 space-y-1.5 text-xs">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span className="font-semibold text-foreground font-mono">{formatCurrency(subtotal)}</span>
        </div>

        {taxRate > 0 && (
          <div className="flex justify-between text-muted-foreground">
            <span>Tax ({taxRate}%)</span>
            <span className="font-semibold text-foreground font-mono">{formatCurrency(calculatedTax)}</span>
          </div>
        )}

        {/* Discount Row */}
        <div className="flex justify-between items-center text-muted-foreground">
          <div className="flex items-center gap-1">
            <span>Discount</span>
            {!showDiscountInput && discount === 0 && (
              <button
                type="button"
                onClick={() => setShowDiscountInput(true)}
                className="text-[10px] text-cinnamon font-bold hover:underline inline-flex items-center gap-0.5 ml-1"
              >
                <HugeiconsIcon icon={Discount01Icon} size={10} />
                <span>+ Add</span>
              </button>
            )}
          </div>

          {showDiscountInput || discount > 0 ? (
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground text-xs">₹</span>
              <Input
                type="number"
                min={0}
                max={subtotal}
                value={discount || ''}
                onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
                placeholder="0"
                className="w-20 h-6 text-right text-xs bg-background rounded-md px-1.5 font-mono"
              />
            </div>
          ) : (
            <span className="font-semibold text-foreground font-mono">₹0.00</span>
          )}
        </div>

        {/* Grand Total */}
        <div className="flex justify-between items-center font-bold text-sm text-foreground pt-2 border-t border-border/80">
          <span className="font-heading">Grand Total</span>
          <span className="text-cinnamon font-heading text-base font-extrabold">
            {formatCurrency(grandTotal)}
          </span>
        </div>
      </div>

      {/* ── Segmented Payment Method Selector ── */}
      <div className="space-y-1.5 pt-1 border-t border-border/60">
        <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          Payment Method
        </Label>
        <div className="grid grid-cols-5 gap-1">
          {paymentOptions.map((opt) => {
            const isSelected = paymentMethod === opt.id;
            const isPayLater = opt.id === 'pay_later';
            const isAvailable = opt.id === 'cash' || opt.id === 'pay_later';
            const Icon = opt.icon;

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handlePaymentMethodClick(opt.id)}
                className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-lg border text-center transition-all active:scale-95 ${
                  isSelected
                    ? isPayLater
                      ? 'bg-amber-600 text-white border-amber-600 shadow-2xs font-bold'
                      : 'bg-cinnamon text-white border-cinnamon shadow-2xs font-bold'
                    : isAvailable
                    ? 'bg-card hover:bg-secondary/60 text-foreground border-border/80'
                    : 'bg-card/60 hover:bg-secondary/40 text-muted-foreground border-border/60'
                }`}
              >
                <HugeiconsIcon icon={Icon} size={14} className="mb-0.5 shrink-0" />
                <span className="text-[9px] uppercase font-bold leading-tight">
                  {opt.label === 'Pay Later' ? 'Credit' : opt.label}
                </span>
                {!isAvailable && (
                  <span className="text-[7px] font-bold text-muted-foreground/80 uppercase tracking-tight -mt-0.5">
                    Soon
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Optional Customer Name for Standard Orders ── */}
      {paymentMethod !== 'pay_later' && (
        <div className="space-y-1">
          <Label className="text-[11px] font-medium text-muted-foreground">
            Customer / Table (Optional)
          </Label>
          <Input
            placeholder="e.g. Walk-in / Table 3 / Rahul"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="h-8 text-xs bg-background rounded-lg border-border/80"
          />
        </div>
      )}

      {/* ── Mandatory Customer Selection for Pay Later Orders ── */}
      {paymentMethod === 'pay_later' && (
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
              <HugeiconsIcon icon={UserIcon} size={14} />
              <span>Credit Customer Required *</span>
            </span>
            <Button
              type="button"
              variant="outline"
              size="xs"
              className="h-6 text-[10px] px-2 gap-1 rounded-md border-amber-500/40 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold shrink-0"
              onClick={() => setShowAddCustomerModal(true)}
            >
              <HugeiconsIcon icon={UserAdd01Icon} size={11} />
              <span>New</span>
            </Button>
          </div>

          {selectedCustomer ? (
            <div className="p-2.5 rounded-lg bg-background border border-border/80 space-y-2 text-xs">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-foreground">{selectedCustomer.name}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">{selectedCustomer.phone}</p>
                </div>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground p-0.5"
                  onClick={() => setSelectedCustomer(null)}
                  aria-label="Remove selected customer"
                >
                  <HugeiconsIcon icon={Cancel01Icon} size={13} />
                </button>
              </div>

              <div className="pt-2 border-t border-border/50 space-y-1 text-[11px]">
                <div className="flex justify-between text-muted-foreground">
                  <span>Existing Outstanding:</span>
                  <span className="font-semibold text-foreground font-mono">{formatCurrency(existingOutstanding)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>This Order:</span>
                  <span className="font-semibold text-cinnamon font-mono">+{formatCurrency(grandTotal)}</span>
                </div>
                <div className="flex justify-between font-bold text-xs pt-1 border-t border-border/40 text-amber-700 dark:text-amber-400">
                  <span>Projected Due Balance:</span>
                  <span className="font-mono">{formatCurrency(projectedOutstanding)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2 relative">
              <div className="relative">
                <HugeiconsIcon
                  icon={Search01Icon}
                  size={13}
                  className="absolute left-2.5 top-2.5 text-muted-foreground"
                />
                <Input
                  placeholder="Search customer name or phone..."
                  value={customerSearchQuery}
                  onChange={(e) => {
                    setCustomerSearchQuery(e.target.value);
                    setIsSearchingCustomer(true);
                  }}
                  className="h-8 pl-8 text-xs bg-background rounded-lg"
                />
              </div>

              {isSearchingCustomer && customerSearchQuery.trim() && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 max-h-40 overflow-y-auto p-1 space-y-1">
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
                    <div className="p-2.5 text-center text-xs text-muted-foreground">
                      No customer found with &ldquo;{customerSearchQuery}&rdquo;.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Place Order Action Button ── */}
      <Button
        type="button"
        size="lg"
        onClick={() => handlePlaceOrder()}
        disabled={
          items.length === 0 ||
          createOrderMutation.isPending ||
          (paymentMethod === 'pay_later' && !selectedCustomer)
        }
        className="w-full bg-cinnamon hover:bg-cinnamon/90 text-white font-bold h-11 text-xs sm:text-sm rounded-xl shadow-md transition-all active:scale-[0.99] gap-2"
      >
        {createOrderMutation.isPending ? (
          <>
            <HugeiconsIcon icon={Loading03Icon} size={16} className="animate-spin" />
            <span>Processing Order...</span>
          </>
        ) : paymentMethod === 'pay_later' ? (
          <span>Place Pay Later Order &middot; {formatCurrency(grandTotal)}</span>
        ) : (
          <span>Place Order &middot; {formatCurrency(grandTotal)}</span>
        )}
      </Button>

      {/* ── Clear Cart Confirmation Dialog ── */}
      <AlertDialog open={showClearConfirmDialog} onOpenChange={setShowClearConfirmDialog}>
        <AlertDialogContent className="max-w-md bg-card border border-border/80 p-5 rounded-xl shadow-2xl space-y-3">
          <AlertDialogHeader className="space-y-1.5">
            <AlertDialogTitle className="text-base font-bold font-heading text-foreground">
              Clear current order?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              This will remove all {totalItemCount} items from the active cart. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex items-center justify-end gap-2 pt-2">
            <AlertDialogCancel className="h-8 text-xs font-semibold rounded-lg">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                clearCart();
                setShowClearConfirmDialog(false);
              }}
              className="h-8 text-xs font-bold bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-lg"
            >
              Clear Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Order Placement Success Modal ── */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-md sm:max-w-2xl md:max-w-3xl max-h-[90vh] overflow-y-auto bg-card rounded-xl border border-border/80 p-4 sm:p-6 shadow-2xl space-y-4 no-scrollbar">
          <DialogHeader className="text-center pb-2 border-b border-border/60 space-y-1">
            <div className="w-11 h-11 mx-auto rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 shadow-2xs">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={22} />
            </div>
            <DialogTitle className="text-lg sm:text-xl font-bold font-heading text-foreground text-center">
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
            <div className="max-h-[360px] overflow-y-auto rounded-lg border border-border/80 shadow-2xs">
              <ReceiptPreview
                order={createdOrder}
                templateConfig={activeTemplate?.template_config}
                cafeSettings={settings}
              />
            </div>

            {/* Right Column: Actions & Summary */}
            <div className="space-y-3.5 flex flex-col justify-between h-full">
              <div className="p-3.5 rounded-lg bg-secondary/50 border border-border/60 space-y-2 text-xs">
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
                  <span className="text-muted-foreground font-semibold">Total Charged:</span>
                  <span className="font-bold text-cinnamon text-sm font-mono font-heading">
                    {formatCurrency(createdOrder?.total_amount || 0)}
                  </span>
                </div>
              </div>

              {printMessage && (
                <div className="p-2.5 rounded-lg bg-secondary text-xs text-center font-medium border border-border/60 text-foreground">
                  {printMessage}
                </div>
              )}

              <div className="space-y-2 pt-1">
                <Button
                  onClick={handleCloseSuccessModal}
                  className="w-full bg-cinnamon hover:bg-cinnamon/90 text-white font-bold h-10 text-xs sm:text-sm rounded-lg shadow-md gap-1.5 transition-all active:scale-[0.98]"
                >
                  <span>Done & Start Next Order</span>
                </Button>

                <Button
                  onClick={() => {
                    if (createdOrder) {
                      const opened = printOrderViaBrowser(createdOrder, settings, activeTemplate?.template_config);
                      if (!opened) {
                        setShowPopupBlockedAlert(true);
                      }
                    }
                  }}
                  variant="outline"
                  className="w-full h-9 text-xs font-bold gap-2 rounded-lg border-border/80 hover:bg-secondary"
                >
                  <HugeiconsIcon icon={PrinterIcon} size={14} />
                  <span>Print via Browser / PDF</span>
                </Button>

                <Button
                  onClick={handleBluetoothPrint}
                  disabled={isPrinting}
                  variant="ghost"
                  className="w-full h-8 text-[11px] font-semibold text-muted-foreground hover:text-foreground gap-1.5"
                >
                  <HugeiconsIcon icon={PrinterIcon} size={13} />
                  <span>
                    {isPrinting
                      ? 'Printing Thermal Receipt...'
                      : printerStatus === 'connected'
                        ? 'Print via Bluetooth Thermal Printer'
                        : 'Connect Bluetooth Thermal Printer'}
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Popups Blocked Alert Dialog */}
      <AlertDialog open={showPopupBlockedAlert} onOpenChange={setShowPopupBlockedAlert}>
        <AlertDialogContent className="max-w-md bg-card border border-border/80 p-5 rounded-xl shadow-2xl space-y-3">
          <AlertDialogHeader className="space-y-1.5">
            <div className="w-11 h-11 rounded-full bg-amber-500/15 text-amber-600 flex items-center justify-center mx-auto">
              <HugeiconsIcon icon={PrinterIcon} size={22} />
            </div>
            <AlertDialogTitle className="text-center text-base font-bold font-heading text-foreground">
              Browser Popups Blocked
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-xs text-muted-foreground leading-relaxed">
              Your browser blocked the print receipt window. Please allow popups for this site in your browser address bar to automatically generate and print thermal receipts.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex justify-center pt-1">
            <AlertDialogAction
              onClick={() => setShowPopupBlockedAlert(false)}
              className="w-full sm:w-auto bg-cinnamon hover:bg-cinnamon/90 text-white font-bold text-xs h-9 px-5 rounded-lg shadow-md"
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
