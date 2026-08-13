import type { WaterOrder } from '../../../../types';
import { formatWaterOrderReceipt } from '../../../../lib/printer/waterReceiptFormatter';
import { formatCurrency } from '../../../../lib/utils/formatCurrency';

interface WaterReceiptPreviewProps {
  order: WaterOrder;
}

export function WaterReceiptPreview({ order }: WaterReceiptPreviewProps) {
  const receipt = formatWaterOrderReceipt(order);

  return (
    <div className="receipt-preview w-full max-w-[340px] mx-auto bg-card text-foreground p-5 pb-8 my-2 rounded-md border border-border/80 shadow-md font-mono text-xs leading-relaxed select-none space-y-2.5">
      {/* Header Info */}
      <div className="text-center space-y-0.5">
        <h3 className="font-bold text-sm text-cinnamon tracking-tight uppercase font-heading">
          {receipt.cafeName}
        </h3>
        <p className="text-[10px] text-muted-foreground max-w-[260px] mx-auto leading-tight">{receipt.address}</p>
        <p className="text-[10px] text-muted-foreground font-semibold">Tel: {receipt.phone}</p>
      </div>

      <div className="border-b border-dashed border-border/80 my-2" />

      {/* Order Meta */}
      <div className="text-[11px] space-y-0.5 text-muted-foreground">
        <div className="flex justify-between">
          <span>Water Order #:</span>
          <span className="font-bold text-foreground font-mono">{receipt.orderNumber}</span>
        </div>
        <div className="flex justify-between">
          <span>Date:</span>
          <span className="font-semibold text-foreground">{receipt.dateTime}</span>
        </div>
        {receipt.customerName && receipt.customerName !== 'Walk-in Customer' && (
          <div className="flex justify-between">
            <span>Customer:</span>
            <span className="font-semibold text-foreground truncate max-w-[150px]">{receipt.customerName}</span>
          </div>
        )}
      </div>

      <div className="border-b border-dashed border-border/80 my-2" />

      {/* Item Line Headers */}
      <div className="grid grid-cols-12 gap-1 font-bold text-[10px] text-muted-foreground uppercase border-b border-dashed border-border/80 pb-1.5">
        <span className="col-span-6">Product</span>
        <span className="col-span-2 text-center">Qty</span>
        <span className="col-span-4 text-right">Amount</span>
      </div>

      {/* Item Lines */}
      <div className="space-y-1.5 py-0.5">
        {receipt.items.map((item, i) => (
          <div key={i} className="grid grid-cols-12 gap-1 text-[11px] items-start">
            <span className="col-span-6 break-words font-medium text-foreground pr-1" title={item.name}>
              {item.name}
            </span>
            <span className="col-span-2 text-center text-muted-foreground font-mono">
              x{item.quantity}
            </span>
            <span className="col-span-4 text-right font-bold font-mono text-foreground">
              {formatCurrency(item.amount)}
            </span>
          </div>
        ))}
      </div>

      <div className="border-b border-dashed border-border/80 my-2" />

      {/* Totals Breakdown */}
      <div className="space-y-1 text-[11px]">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span className="font-mono text-foreground">{formatCurrency(receipt.subtotal)}</span>
        </div>
        {receipt.discount > 0 && (
          <div className="flex justify-between text-cinnamon font-medium">
            <span>Discount</span>
            <span className="font-mono">-{formatCurrency(receipt.discount)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-xs pt-1.5 border-t border-dashed border-border/80 text-cinnamon">
          <span>TOTAL</span>
          <span className="font-mono text-sm">{formatCurrency(receipt.total)}</span>
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground pt-0.5">
          <span>Payment Method</span>
          <span className="uppercase font-bold">{receipt.paymentMethod}</span>
        </div>
        {Boolean(receipt.dueAmount && receipt.dueAmount > 0) && (
          <div className="flex justify-between text-[11px] font-bold text-amber-600 dark:text-amber-400 pt-1 border-t border-dashed border-border/60">
            <span>Amount Due</span>
            <span className="font-mono">{formatCurrency(receipt.dueAmount || 0)}</span>
          </div>
        )}
      </div>

      <div className="border-b border-dashed border-border/80 my-2" />

      {/* Footer Message */}
      <p className="text-center text-[10px] font-bold text-muted-foreground pt-2 pb-4 mb-2">
        {receipt.footerMessage}
      </p>
    </div>
  );
}
