import type { ReceiptTemplateConfig } from '../../../types';
import { formatReceiptFromTemplate } from '../../../lib/printer/receiptFormatter';
import { formatCurrency } from '../../../lib/utils/formatCurrency';
import { HugeiconsIcon } from '@hugeicons/react';
import { Coffee02Icon } from '@hugeicons/core-free-icons';

interface ReceiptPreviewProps {
  order: any;
  templateConfig?: ReceiptTemplateConfig | null;
  cafeSettings?: any;
}

export function ReceiptPreview({ order, templateConfig, cafeSettings }: ReceiptPreviewProps) {
  if (!order) {
    return null;
  }

  const { data, config } = formatReceiptFromTemplate(order, templateConfig, cafeSettings);

  const paperCols = config.paperWidth || 32;
  const isWide = paperCols >= 48;

  const fontClass =
    config.previewFont === 'Consolas'
      ? 'font-mono'
      : config.previewFont === 'Inter'
      ? 'font-sans'
      : 'font-mono';

  const alignClass = (align?: 'left' | 'center' | 'right') => {
    if (align === 'center') return 'text-center';
    if (align === 'right') return 'text-right';
    return 'text-left';
  };

  const dividerStyleClass =
    config.dividerStyle === 'double'
      ? 'border-b-2 border-double border-foreground/40'
      : config.dividerStyle === 'solid'
      ? 'border-b border-solid border-foreground/40'
      : config.dividerStyle === 'dotted'
      ? 'border-b border-dotted border-foreground/40'
      : config.dividerStyle === 'none'
      ? 'hidden'
      : 'border-b border-dashed border-border/80';

  const renderDivider = () => <div className={`my-2 ${dividerStyleClass}`} />;

  const sections = config.sectionOrder || ['header', 'orderInfo', 'customerInfo', 'items', 'summary', 'payment', 'footer'];

  return (
    <div className="receipt-preview-container flex justify-center py-2">
      <div
        style={{
          width: isWide ? '380px' : '300px',
        }}
        className={`receipt-preview bg-white dark:bg-card text-foreground p-5 pb-8 rounded-lg border border-border/80 shadow-2xl ${fontClass} text-xs leading-relaxed select-none space-y-2 relative transition-all duration-300`}
      >
        {/* Paper Header Cut Indicator */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500/20 via-cinnamon/30 to-amber-500/20 rounded-t-lg" />

        {sections.map((sectionKey, index) => {
          if (sectionKey === 'header') {
            return (
              <div key={index} className={`space-y-0.5 ${alignClass(config.header.alignment)}`}>
                {config.header.logoVisible && (
                  <div className="flex justify-center my-1.5">
                    <div className="w-10 h-10 rounded-full bg-cinnamon/10 text-cinnamon flex items-center justify-center border border-cinnamon/20 shadow-2xs">
                      <HugeiconsIcon icon={Coffee02Icon} size={22} />
                    </div>
                  </div>
                )}

                {config.header.cafeNameVisible && config.header.cafeNameText && (
                  <h3
                    className={`font-bold text-sm tracking-tight uppercase ${
                      config.header.emphasis === 'double_size'
                        ? 'text-base font-extrabold text-cinnamon'
                        : config.header.emphasis === 'bold'
                        ? 'font-bold text-foreground'
                        : 'font-normal text-foreground'
                    }`}
                  >
                    {config.header.cafeNameText}
                  </h3>
                )}

                {config.header.taglineVisible && config.header.taglineText && (
                  <p className="text-[10px] text-muted-foreground font-medium italic">{config.header.taglineText}</p>
                )}

                {config.header.addressVisible && config.header.addressText && (
                  <p className="text-[10px] text-muted-foreground leading-tight max-w-[260px] mx-auto">
                    {config.header.addressText}
                  </p>
                )}

                {config.header.phoneVisible && config.header.phoneText && (
                  <p className="text-[10px] text-muted-foreground font-semibold">Tel: {config.header.phoneText}</p>
                )}

                {config.header.emailVisible && config.header.emailText && (
                  <p className="text-[10px] text-muted-foreground">{config.header.emailText}</p>
                )}

                {renderDivider()}
              </div>
            );
          }

          if (sectionKey === 'orderInfo') {
            return (
              <div key={index} className={`text-[11px] space-y-0.5 text-muted-foreground ${alignClass(config.orderInfo.alignment)}`}>
                {config.orderInfo.orderNumberVisible && (
                  <div className="flex justify-between">
                    <span>Order #:</span>
                    <span className="font-bold text-foreground font-mono">{data.orderNumber}</span>
                  </div>
                )}
                {config.orderInfo.dateVisible && (
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span className="font-semibold text-foreground">{data.dateTime}</span>
                  </div>
                )}
                {config.orderInfo.cashierVisible && data.cashierName && (
                  <div className="flex justify-between">
                    <span>Cashier:</span>
                    <span className="font-medium text-foreground">{data.cashierName}</span>
                  </div>
                )}
                {config.orderInfo.statusVisible && (
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="font-bold text-foreground">{data.status}</span>
                  </div>
                )}

                {renderDivider()}
              </div>
            );
          }

          if (sectionKey === 'customerInfo') {
            const hasCustomerInfo =
              (config.customerInfo.customerNameVisible && data.customerName && data.customerName !== 'Walk-in Customer') ||
              (config.customerInfo.phoneVisible && data.customerPhone) ||
              (config.customerInfo.paymentStatusVisible && data.isPayLater);

            if (!hasCustomerInfo) return null;

            return (
              <div key={index} className={`text-[11px] space-y-0.5 text-muted-foreground ${alignClass(config.customerInfo.alignment)}`}>
                {config.customerInfo.customerNameVisible && data.customerName && (
                  <div className="flex justify-between">
                    <span>Customer:</span>
                    <span className="font-bold text-foreground truncate max-w-[160px]">{data.customerName}</span>
                  </div>
                )}
                {config.customerInfo.phoneVisible && data.customerPhone && (
                  <div className="flex justify-between">
                    <span>Phone:</span>
                    <span className="font-semibold text-foreground">{data.customerPhone}</span>
                  </div>
                )}
                {config.customerInfo.paymentStatusVisible && data.isPayLater && (
                  <div className="flex justify-between text-amber-600 font-bold text-[10px]">
                    <span>Account:</span>
                    <span>CREDIT CUSTOMER</span>
                  </div>
                )}

                {renderDivider()}
              </div>
            );
          }

          if (sectionKey === 'items') {
            return (
              <div key={index} className="space-y-1 py-0.5">
                {config.items.showHeaders && (
                  <div className="grid grid-cols-12 gap-1 font-bold text-[10px] text-muted-foreground uppercase border-b border-dashed border-border/80 pb-1.5">
                    <span className={isWide ? 'col-span-5' : 'col-span-6'}>Item</span>
                    <span className="col-span-2 text-center">Qty</span>
                    {isWide && config.items.showUnitPrice && <span className="col-span-2 text-right">Price</span>}
                    <span className={isWide && config.items.showUnitPrice ? 'col-span-3 text-right' : 'col-span-4 text-right'}>
                      Amount
                    </span>
                  </div>
                )}

                {config.items.dividerBefore && renderDivider()}

                {data.items.map((item, i) => (
                  <div key={i} className="grid grid-cols-12 gap-1 text-[11px] items-start leading-snug">
                    <span className={`${isWide ? 'col-span-5' : 'col-span-6'} break-words font-medium text-foreground pr-1`}>
                      {item.name}
                    </span>
                    <span className="col-span-2 text-center text-muted-foreground font-mono">x{item.quantity}</span>
                    {isWide && config.items.showUnitPrice && (
                      <span className="col-span-2 text-right text-muted-foreground font-mono text-[10px]">
                        ₹{item.unitPrice}
                      </span>
                    )}
                    <span
                      className={`${
                        isWide && config.items.showUnitPrice ? 'col-span-3' : 'col-span-4'
                      } text-right font-bold font-mono text-foreground`}
                    >
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                ))}

                {config.items.dividerAfter && renderDivider()}
              </div>
            );
          }

          if (sectionKey === 'summary') {
            return (
              <div key={index} className="space-y-1 text-[11px]">
                {config.summary.dividerBeforeTotal && renderDivider()}

                {config.summary.subtotalVisible && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="font-mono text-foreground">{formatCurrency(data.subtotal)}</span>
                  </div>
                )}

                {config.summary.taxVisible && data.tax > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>GST Tax</span>
                    <span className="font-mono text-foreground">{formatCurrency(data.tax)}</span>
                  </div>
                )}

                {config.summary.discountVisible && data.discount > 0 && (
                  <div className="flex justify-between text-cinnamon font-medium">
                    <span>Discount</span>
                    <span className="font-mono">-{formatCurrency(data.discount)}</span>
                  </div>
                )}

                <div
                  className={`flex justify-between pt-1.5 text-cinnamon ${
                    config.summary.doubleSizeTotal ? 'text-base font-extrabold' : config.summary.grandTotalBold ? 'font-bold text-sm' : 'font-normal'
                  }`}
                >
                  <span>TOTAL</span>
                  <span className="font-mono">{formatCurrency(data.total)}</span>
                </div>
              </div>
            );
          }

          if (sectionKey === 'payment') {
            return (
              <div key={index} className="space-y-1 text-[11px] text-muted-foreground pt-1">
                {config.payment.paymentMethodVisible && (
                  <div className="flex justify-between text-[10px]">
                    <span>Payment:</span>
                    <span className="uppercase font-bold text-foreground">{data.paymentMethod}</span>
                  </div>
                )}

                {config.payment.amountPaidVisible && (
                  <div className="flex justify-between text-[10px]">
                    <span>Paid:</span>
                    <span className="font-mono font-semibold text-foreground">{formatCurrency(data.paidAmount)}</span>
                  </div>
                )}

                {config.payment.amountDueVisible && data.dueAmount > 0 && (
                  <div className="flex justify-between text-[11px] font-bold text-amber-700 dark:text-amber-400 pt-0.5">
                    <span>Amount Due:</span>
                    <span className="font-mono">{formatCurrency(data.dueAmount)}</span>
                  </div>
                )}

                {renderDivider()}
              </div>
            );
          }

          if (sectionKey === 'footer') {
            return (
              <div key={index} className={`space-y-1 text-[10px] text-muted-foreground pt-2 ${alignClass(config.footer.alignment)}`}>
                {config.footer.thankYouMessage && (
                  <p className="font-bold text-foreground">{config.footer.thankYouMessage}</p>
                )}
                {config.footer.secondaryMessage && <p>{config.footer.secondaryMessage}</p>}
                {config.footer.contactMessage && <p className="font-medium">{config.footer.contactMessage}</p>}
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}
