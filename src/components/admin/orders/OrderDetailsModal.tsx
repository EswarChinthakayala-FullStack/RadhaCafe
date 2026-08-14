import { useState } from 'react';
import type { Order } from '../../../types';
import { useBluetoothPrinter } from '../../../hooks/useBluetoothPrinter';
import { useCafeSettings } from '../../../hooks/useCafeSettings';
import { useActiveReceiptTemplate } from '../../../hooks/useReceiptTemplates';
import { useCustomer } from '../../../hooks/useCustomers';
import { useOrderPayments } from '../../../hooks/usePayments';
import { useCancelOrder } from '../../../hooks/useOrders';
import { printOrderViaBrowser } from '../../../lib/printer/browserPrint';
import { formatCurrency } from '../../../lib/utils/formatCurrency';
import { formatDate } from '../../../lib/utils/formatDate';
import { ReceivePaymentDialog } from '../customers/ReceivePaymentDialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../ui/dialog';
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
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { OrderStatusBadge } from './OrderStatusBadge';
import { PaymentStatusBadge } from './PaymentStatusBadge';
import { ReceiptPreview } from '../printer/ReceiptPreview';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Invoice01Icon,
  PrinterIcon,
  UserIcon,
  CreditCardIcon,
  ShoppingBag01Icon,
  CheckmarkCircle02Icon,
  SquareLockCheckIcon,
  Copy01Icon,
  CancelCircleIcon,
  Coins01Icon,
  Clock01Icon,
} from '@hugeicons/core-free-icons';
import { toast } from '../../ui/toast';

interface OrderDetailsModalProps {
  order: Order;
  open: boolean;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
}

export function OrderDetailsModal({ order, open, onClose, onOpenChange }: OrderDetailsModalProps) {
  const handleClose = () => {
    if (onOpenChange) onOpenChange(false);
    if (onClose) onClose();
  };

  const { printOrder } = useBluetoothPrinter();
  const { data: cafeSettings } = useCafeSettings();
  const { data: activeTemplate } = useActiveReceiptTemplate();
  const { data: customer } = useCustomer(order.customer_id || undefined);
  const { data: payments = [], isLoading: isLoadingPayments } = useOrderPayments(order.id);
  const cancelOrderMutation = useCancelOrder();

  const [isPrinting, setIsPrinting] = useState(false);
  const [printFeedback, setPrintFeedback] = useState<string | null>(null);
  const [showReceivePaymentDialog, setShowReceivePaymentDialog] = useState(false);
  const [showCancelConfirmDialog, setShowCancelConfirmDialog] = useState(false);

  const dueAmount = Number(order.due_amount || 0);
  const paidAmount = Number(order.paid_amount || (dueAmount === 0 ? order.total_amount : 0));
  const isPaid = order.payment_status === 'paid' || dueAmount === 0;
  const isPartial = order.payment_status === 'partial';

  const totalItemsQuantity =
    order.items?.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0) ||
    order.items?.length ||
    0;

  const handleCopyOrderNumber = () => {
    navigator.clipboard.writeText(order.order_number);
    toast.add({
      title: 'Copied',
      description: `Order #${order.order_number} copied to clipboard.`,
      type: 'info',
    });
  };

  const handleReprintBluetooth = async () => {
    setIsPrinting(true);
    setPrintFeedback(null);
    try {
      const success = await printOrder(order, cafeSettings);
      if (success) {
        setPrintFeedback('Thermal receipt printed successfully!');
        toast.add({
          title: 'Printed',
          description: `Order #${order.order_number} sent to thermal printer.`,
          type: 'success',
        });
      } else {
        setPrintFeedback('Bluetooth print failed. You can use Browser/PDF print fallback below.');
      }
    } catch {
      setPrintFeedback('Bluetooth printer disconnected. Use browser print fallback.');
    } finally {
      setIsPrinting(false);
    }
  };

  const handleReprintBrowser = () => {
    const opened = printOrderViaBrowser(order, cafeSettings, activeTemplate?.template_config);
    if (!opened) {
      toast.add({
        title: 'Popup Blocked',
        description: 'Please enable popups in your browser to print receipts.',
        type: 'warning',
      });
    }
  };

  const handleConfirmCancel = async () => {
    try {
      await cancelOrderMutation.mutateAsync(order.id);
      toast.add({
        title: 'Order Cancelled',
        description: `Order #${order.order_number} was marked as cancelled.`,
        type: 'info',
      });
      setShowCancelConfirmDialog(false);
      handleClose();
    } catch (err: any) {
      toast.add({
        title: 'Cancellation Failed',
        description: err.message || 'Unable to cancel order.',
        type: 'error',
      });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
        <DialogContent className="w-[calc(100vw-1.5rem)] sm:max-w-4xl max-h-[90vh] overflow-y-auto no-scrollbar bg-card rounded-xl border border-border/80 p-4 sm:p-6 lg:p-8 shadow-2xl space-y-5">
          {/* Modal Header */}
          <DialogHeader className="border-b border-border/80 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <div className="p-2 rounded-lg bg-cinnamon/10 text-cinnamon shrink-0 border border-cinnamon/20 shadow-2xs">
                  <HugeiconsIcon icon={Invoice01Icon} size={20} />
                </div>
                <DialogTitle className="font-heading text-lg sm:text-2xl font-bold text-foreground">
                  Order Details
                </DialogTitle>
                <div className="flex items-center gap-1">
                  <span className="font-mono text-xs sm:text-sm px-2.5 py-1 rounded-lg bg-cinnamon/10 text-cinnamon border border-cinnamon/20 font-bold whitespace-nowrap">
                    #{order.order_number}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyOrderNumber}
                    className="p-1 text-muted-foreground hover:text-cinnamon transition-colors"
                    title="Copy order number"
                    aria-label="Copy order number"
                  >
                    <HugeiconsIcon icon={Copy01Icon} size={15} />
                  </button>
                </div>
              </div>
              <DialogDescription className="text-xs text-muted-foreground">
                Placed on {formatDate(order.created_at)}
              </DialogDescription>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <PaymentStatusBadge status={order.payment_status} dueAmount={dueAmount} />
              <OrderStatusBadge status={order.status} />
              {order.is_printed && (
                <Badge
                  variant="outline"
                  className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[10px] gap-1 rounded-md"
                >
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} size={12} /> Printed
                </Badge>
              )}
            </div>
          </DialogHeader>

          {/* Outstanding Notice Bar if Due > 0 */}
          {!isPaid && (
            <div className="p-3.5 sm:p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-start sm:items-center gap-2.5">
                <div className="p-1.5 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300 shrink-0 mt-0.5 sm:mt-0">
                  <HugeiconsIcon icon={Clock01Icon} size={16} />
                </div>
                <div>
                  <p className="font-bold text-amber-900 dark:text-amber-200">
                    {isPartial
                      ? `${formatCurrency(paidAmount)} received · ${formatCurrency(dueAmount)} remaining due`
                      : `${formatCurrency(dueAmount)} remains due for this order`}
                  </p>
                  <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80">
                    Customer payment pending for this transaction.
                  </p>
                </div>
              </div>

              <Button
                size="sm"
                onClick={() => setShowReceivePaymentDialog(true)}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold h-9 text-xs rounded-lg shadow-2xs gap-1.5 shrink-0"
              >
                <HugeiconsIcon icon={SquareLockCheckIcon} size={15} />
                <span>Receive Payment ({formatCurrency(dueAmount)})</span>
              </Button>
            </div>
          )}

          {/* Responsive Side-by-Side Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start text-xs">
            {/* Left Column (Items, Totals, Customer, Payments Ledger): Spans 7 cols */}
            <div className="lg:col-span-7 space-y-4">
              {/* Customer & Order Metadata Overview */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-secondary/40 border border-border/60 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                    <HugeiconsIcon icon={UserIcon} size={14} className="text-cinnamon" />
                    <span>Customer:</span>
                  </span>
                  <div className="text-right">
                    <span className="font-bold text-foreground block">
                      {order.customer_name || 'Walk-in Customer'}
                    </span>
                    {customer?.phone && (
                      <span className="text-[11px] text-muted-foreground block font-mono">
                        {customer.phone}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-1.5 border-t border-border/40">
                  <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                    <HugeiconsIcon icon={CreditCardIcon} size={14} className="text-cinnamon" />
                    <span>Payment Method:</span>
                  </span>
                  <Badge
                    variant="outline"
                    className="uppercase font-bold text-[10px] text-cinnamon border-cinnamon/30 bg-cinnamon/5 rounded-md px-2 py-0.5"
                  >
                    {order.payment_method === 'pay_later' ? 'PAY LATER' : order.payment_method}
                  </Badge>
                </div>
              </div>

              {/* Purchased Items List */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-xs text-foreground flex items-center gap-1.5 font-heading">
                    <HugeiconsIcon icon={ShoppingBag01Icon} size={14} className="text-cinnamon" />
                    <span>Purchased Items ({totalItemsQuantity})</span>
                  </h4>
                  <span className="text-[11px] text-muted-foreground">
                    {order.items?.length || 0} line {order.items?.length === 1 ? 'item' : 'items'}
                  </span>
                </div>

                <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1 no-scrollbar">
                  {order.items?.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center p-3 rounded-lg bg-secondary/30 border border-border/40 text-xs"
                    >
                      <div className="pr-2">
                        <p className="font-bold text-foreground">{item.item_name}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {formatCurrency(item.unit_price)} × {item.quantity}
                        </p>
                      </div>
                      <span className="font-bold font-mono text-foreground shrink-0">
                        {formatCurrency(item.total_price || item.unit_price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals Breakdown */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-secondary/40 border border-border/60 space-y-1.5 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-semibold text-foreground font-mono">
                    {formatCurrency(order.subtotal)}
                  </span>
                </div>

                {order.tax_amount > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>GST Tax</span>
                    <span className="font-semibold text-foreground font-mono">
                      {formatCurrency(order.tax_amount)}
                    </span>
                  </div>
                )}

                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-cinnamon font-medium">
                    <span>Discount</span>
                    <span className="font-mono">-{formatCurrency(order.discount_amount)}</span>
                  </div>
                )}

                <div className="flex justify-between font-bold text-sm text-foreground pt-2 border-t border-border/60">
                  <span>Grand Total</span>
                  <span className="text-primary font-mono text-base font-extrabold">
                    {formatCurrency(order.total_amount)}
                  </span>
                </div>

                <div className="flex justify-between text-xs pt-2 border-t border-border/40 text-muted-foreground">
                  <span>Amount Paid:</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                    {formatCurrency(paidAmount)}
                  </span>
                </div>

                {!isPaid && (
                  <div className="flex justify-between text-xs font-bold text-amber-700 dark:text-amber-400 pt-1">
                    <span>Outstanding Due:</span>
                    <span className="font-mono text-sm">{formatCurrency(dueAmount)}</span>
                  </div>
                )}
              </div>

              {/* Payment History Ledger */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs text-foreground flex items-center gap-1.5 font-heading">
                  <HugeiconsIcon icon={Coins01Icon} size={14} className="text-cinnamon" />
                  <span>Payment Ledger Records ({payments.length})</span>
                </h4>

                {isLoadingPayments ? (
                  <div className="p-3 rounded-lg bg-secondary/20 border border-border/40 text-muted-foreground text-center text-[11px]">
                    Loading payment records...
                  </div>
                ) : payments.length === 0 ? (
                  <div className="p-3 rounded-lg bg-secondary/20 border border-border/40 text-muted-foreground text-[11px]">
                    {isPaid
                      ? `Paid in full via ${order.payment_method.toUpperCase()} at order creation.`
                      : 'No additional payments recorded yet.'}
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-[160px] overflow-y-auto no-scrollbar">
                    {payments.map((p) => (
                      <div
                        key={p.id}
                        className="flex justify-between items-center p-2.5 rounded-lg bg-secondary/30 border border-border/40 text-xs"
                      >
                        <div>
                          <p className="font-semibold text-foreground">
                            {formatDate(p.created_at)}
                          </p>
                          <p className="text-[10px] text-muted-foreground uppercase">
                            Method: {p.payment_method} {p.notes ? `· ${p.notes}` : ''}
                          </p>
                        </div>
                        <span className="font-bold font-mono text-emerald-700 dark:text-emerald-400">
                          +{formatCurrency(p.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {printFeedback && (
                <div
                  className={`p-3 rounded-lg text-xs font-medium border ${
                    printFeedback.includes('successfully')
                      ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/30'
                  }`}
                >
                  {printFeedback}
                </div>
              )}
            </div>

            {/* Right Column: Thermal Receipt Preview (Spans 5 cols) */}
            <div className="lg:col-span-5 space-y-2">
              <h4 className="font-bold text-xs text-foreground flex items-center gap-1.5 font-heading">
                <HugeiconsIcon icon={PrinterIcon} size={14} className="text-cinnamon" />
                <span>Thermal Slip Preview</span>
              </h4>
              <div className="p-3 pb-8 rounded-xl bg-secondary/20 border border-border/60 flex justify-center max-h-[460px] overflow-y-auto no-scrollbar">
                <div className="py-2 pb-8 w-full flex justify-center">
                  <ReceiptPreview
                    order={order}
                    templateConfig={activeTemplate?.template_config}
                    cafeSettings={cafeSettings}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-border/80">
            <div>
              {order.status !== 'cancelled' && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCancelConfirmDialog(true)}
                  className="h-9 px-3 text-xs text-destructive hover:bg-destructive/10 rounded-lg gap-1.5"
                >
                  <HugeiconsIcon icon={CancelCircleIcon} size={14} />
                  <span>Cancel Order</span>
                </Button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClose}
                className="h-9 rounded-lg px-4 text-xs font-semibold"
              >
                Close
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleReprintBrowser}
                className="h-9 rounded-lg px-3 sm:px-4 text-xs font-semibold gap-1.5 border-border/80"
              >
                <HugeiconsIcon icon={PrinterIcon} size={14} />
                <span>Browser Print</span>
              </Button>

              <Button
                size="sm"
                disabled={isPrinting}
                onClick={handleReprintBluetooth}
                className="bg-cinnamon hover:bg-cinnamon/90 text-white font-bold h-9 rounded-lg px-4 text-xs gap-1.5 shadow-2xs"
              >
                <HugeiconsIcon icon={PrinterIcon} size={14} />
                <span>{isPrinting ? 'Printing Slip...' : 'Bluetooth Print'}</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Receive Payment Modal */}
      {showReceivePaymentDialog && (
        <ReceivePaymentDialog
          open={showReceivePaymentDialog}
          onOpenChange={setShowReceivePaymentDialog}
          customer={
            customer || {
              id: order.customer_id || 'walk-in',
              name: order.customer_name || 'Walk-in Customer',
              phone: '',
              is_active: true,
              created_at: '',
              updated_at: '',
              total_due: dueAmount,
            }
          }
          order={order}
        />
      )}

      {/* Cancel Order Confirmation Dialog */}
      <AlertDialog open={showCancelConfirmDialog} onOpenChange={setShowCancelConfirmDialog}>
        <AlertDialogContent className="max-w-md bg-card border border-border rounded-xl p-6 shadow-2xl">
          <AlertDialogHeader className="space-y-2 text-left">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 flex items-center justify-center mb-1">
              <HugeiconsIcon icon={CancelCircleIcon} size={20} />
            </div>
            <AlertDialogTitle className="font-heading text-lg font-bold text-foreground">
              Cancel Order #{order.order_number}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              This will mark this order as cancelled in reports and history. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-3 border-t border-border/60">
            <AlertDialogCancel className="h-9 text-xs rounded-lg">Keep Order</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancel}
              disabled={cancelOrderMutation.isPending}
              className="h-9 text-xs bg-destructive text-white hover:bg-destructive/90 font-bold rounded-lg"
            >
              {cancelOrderMutation.isPending ? 'Cancelling...' : 'Yes, Cancel Order'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
