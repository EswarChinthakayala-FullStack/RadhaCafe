import { useState } from 'react';
import type { WaterOrder } from '../../../../types';
import { useBluetoothPrinter } from '../../../../hooks/useBluetoothPrinter';
import { useWaterCustomer } from '../../../../hooks/useWaterCustomers';
import { formatCurrency } from '../../../../lib/utils/formatCurrency';
import { formatDate } from '../../../../lib/utils/formatDate';
import { formatWaterOrderReceipt } from '../../../../lib/printer/waterReceiptFormatter';
import { ReceiveWaterPaymentDialog } from '../customers/ReceiveWaterPaymentDialog';
import { WaterReceiptPreview } from '../printer/WaterReceiptPreview';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../../ui/dialog';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Invoice01Icon,
  PrinterIcon,
  UserIcon,
  CreditCardIcon,
  DropletIcon,
  SquareLockCheckIcon,
} from '@hugeicons/core-free-icons';

interface WaterOrderDetailsModalProps {
  order: WaterOrder;
  open: boolean;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
}

export function WaterOrderDetailsModal({
  order,
  open,
  onClose,
  onOpenChange,
}: WaterOrderDetailsModalProps) {
  const handleClose = () => {
    if (onOpenChange) onOpenChange(false);
    if (onClose) onClose();
  };

  const { printOrder } = useBluetoothPrinter();
  const { data: customer } = useWaterCustomer(order.customer_id || undefined);

  const [isPrinting, setIsPrinting] = useState(false);
  const [printFeedback, setPrintFeedback] = useState<string | null>(null);
  const [showReceivePaymentDialog, setShowReceivePaymentDialog] = useState(false);

  const handleReprintBluetooth = async () => {
    setIsPrinting(true);
    setPrintFeedback(null);
    const receiptData = formatWaterOrderReceipt(order);
    const success = await printOrder(receiptData as any);
    setIsPrinting(false);
    if (success) {
      setPrintFeedback('Thermal water receipt printed successfully!');
    } else {
      setPrintFeedback('Bluetooth print failed. Ensure printer is connected.');
    }
  };

  const dueAmount = Number(order.amount_due || 0);
  const paidAmount = Number(order.amount_paid || (dueAmount === 0 ? order.total_amount : 0));
  const isPaid = order.payment_status === 'paid' || dueAmount === 0;
  const isPartial = order.payment_status === 'partial';

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
        <DialogContent className="sm:max-w-4xl max-w-4xl w-full max-h-[90vh] overflow-y-auto no-scrollbar bg-card rounded-md border border-border p-6 sm:p-8 shadow-2xl space-y-6">
          <DialogHeader className="border-b border-border/80 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="p-2 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 shrink-0 border border-sky-500/20">
                  <HugeiconsIcon icon={Invoice01Icon} size={22} />
                </div>
                <DialogTitle className="font-heading text-xl sm:text-2xl font-bold text-foreground">
                  Water Order Details
                </DialogTitle>
                <span className="font-mono text-xs sm:text-sm px-3 py-1 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 font-bold whitespace-nowrap">
                  {order.order_number}
                </span>
              </div>
              <DialogDescription className="text-xs text-muted-foreground">
                Placed on {formatDate(order.created_at)}
              </DialogDescription>
            </div>

            <div className="flex items-center gap-2">
              <Badge
                className={
                  isPaid
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-xs px-2.5 py-1 font-bold'
                    : isPartial
                    ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-xs px-2.5 py-1 font-bold'
                    : 'bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30 text-xs px-2.5 py-1 font-bold'
                }
              >
                {isPaid ? 'PAID' : isPartial ? 'PARTIAL' : 'OUTSTANDING'}
              </Badge>
              <Badge variant="outline" className="uppercase text-xs font-semibold">
                {order.order_status}
              </Badge>
            </div>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start text-xs">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="p-4 rounded-md bg-secondary/40 border border-border/60 space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                    <HugeiconsIcon icon={UserIcon} size={14} />
                    <span>Water Customer:</span>
                  </span>
                  <span className="font-bold text-foreground">{order.customer_name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                    <HugeiconsIcon icon={CreditCardIcon} size={14} />
                    <span>Payment Method:</span>
                  </span>
                  <Badge variant="outline" className="uppercase font-bold text-[10px] text-sky-600 border-sky-500/30 bg-sky-500/5 rounded-md px-2 py-0.5">
                    {order.payment_method === 'pay_later' ? 'PAY LATER' : order.payment_method}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-xs text-foreground flex items-center gap-1.5 font-heading">
                  <HugeiconsIcon icon={DropletIcon} size={14} className="text-sky-500" />
                  <span>Purchased Water Products ({order.items?.length || 0})</span>
                </h4>
                <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1 no-scrollbar">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 rounded-md bg-secondary/30 border border-border/40 text-xs">
                      <div>
                        <p className="font-bold text-foreground">{item.item_name}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {formatCurrency(item.unit_price)} × {item.quantity}
                        </p>
                      </div>
                      <span className="font-bold font-mono text-foreground">
                        {formatCurrency(item.total_price || item.unit_price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-md bg-secondary/40 border border-border/60 space-y-1.5 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-semibold text-foreground">{formatCurrency(order.subtotal)}</span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-sky-600 font-medium">
                    <span>Discount</span>
                    <span>-{formatCurrency(order.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm text-foreground pt-2 border-t border-border/60">
                  <span>Grand Total</span>
                  <span className="text-sky-600 dark:text-sky-400 font-mono">{formatCurrency(order.total_amount)}</span>
                </div>

                <div className="flex justify-between text-xs pt-2 border-t border-border/40 text-muted-foreground">
                  <span>Amount Paid:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(paidAmount)}</span>
                </div>

                {!isPaid && (
                  <div className="flex justify-between text-xs font-bold text-amber-700 dark:text-amber-400 pt-1">
                    <span>Outstanding Water Due:</span>
                    <span className="font-mono text-sm">{formatCurrency(dueAmount)}</span>
                  </div>
                )}
              </div>

              {!isPaid && (
                <Button
                  onClick={() => setShowReceivePaymentDialog(true)}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold h-10 text-xs rounded-md shadow-xs gap-2"
                >
                  <HugeiconsIcon icon={SquareLockCheckIcon} size={16} />
                  <span>Receive Water Payment ({formatCurrency(dueAmount)})</span>
                </Button>
              )}

              {printFeedback && (
                <div className="p-3 rounded-md text-xs font-medium border bg-sky-500/10 text-sky-700 border-sky-500/20">
                  {printFeedback}
                </div>
              )}
            </div>

            {/* Right Column: Thermal Receipt Preview */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-foreground flex items-center gap-1.5 font-heading">
                <HugeiconsIcon icon={PrinterIcon} size={14} className="text-sky-500" />
                <span>Thermal Water Receipt Preview</span>
              </h4>
              <div className="p-3 pb-8 rounded-md bg-secondary/20 border border-border/60 flex justify-center max-h-[420px] overflow-y-auto no-scrollbar">
                <div className="py-2 pb-8 w-full flex justify-center">
                  <WaterReceiptPreview order={order} />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-2.5 pt-3 border-t border-border/80">
            <Button variant="outline" size="sm" onClick={handleClose} className="h-10 rounded-md px-4 text-xs font-semibold">
              Close
            </Button>
            <Button
              size="sm"
              disabled={isPrinting}
              onClick={handleReprintBluetooth}
              className="bg-sky-600 hover:bg-sky-700 text-white font-bold h-10 rounded-md px-5 text-xs gap-1.5 shadow-md"
            >
              <HugeiconsIcon icon={PrinterIcon} size={15} />
              <span>{isPrinting ? 'Printing...' : 'Bluetooth Print Receipt'}</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {showReceivePaymentDialog && (customer || order.customer_id) && (
        <ReceiveWaterPaymentDialog
          open={showReceivePaymentDialog}
          onOpenChange={setShowReceivePaymentDialog}
          customer={
            customer || {
              id: order.customer_id!,
              name: order.customer_name,
              phone: '',
              created_at: '',
              updated_at: '',
              total_due: dueAmount,
            }
          }
          order={order}
        />
      )}
    </>
  );
}
