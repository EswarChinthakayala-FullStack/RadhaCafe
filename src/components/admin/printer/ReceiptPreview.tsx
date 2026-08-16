import type { ReceiptTemplateConfig, DividerStyleType, ReceiptWatermarkConfig } from '../../../types';
import { formatReceiptFromTemplate } from '../../../lib/printer/receiptFormatter';

interface ReceiptPreviewProps {
  order: any;
  templateConfig?: ReceiptTemplateConfig | null;
  cafeSettings?: any;
}

const alignmentClass = (alignment?: 'left' | 'center' | 'right') => {
  if (alignment === 'center') return 'text-center';
  if (alignment === 'right') return 'text-right';
  return 'text-left';
};

const emphasisClass = (emphasis?: 'normal' | 'bold' | 'double_size') => {
  if (emphasis === 'double_size') return 'text-base sm:text-lg leading-tight font-black tracking-tight';
  if (emphasis === 'bold') return 'font-black';
  return 'font-normal';
};

const formatMoney = (value: number | undefined | null) => {
  const num = Number(value || 0);
  return `Rs. ${num.toFixed(2)}`;
};

/**
 * Aesthetic thermal divider component that spans 100% width cleanly without wrapping glitches
 */
function ReceiptDivider({ style = 'dashed' }: { style?: DividerStyleType }) {
  if (style === 'none') return null;

  if (style === 'double') {
    return (
      <div aria-hidden="true" className="my-2 border-t-2 border-b border-black/40 h-1 w-full" />
    );
  }

  if (style === 'dotted') {
    return (
      <div aria-hidden="true" className="my-2 border-b border-dotted border-black/50 w-full" />
    );
  }

  if (style === 'solid') {
    return (
      <div aria-hidden="true" className="my-2 border-b border-solid border-black/50 w-full" />
    );
  }

  // Default dashed divider
  return (
    <div aria-hidden="true" className="my-2 border-b border-dashed border-black/45 w-full" />
  );
}

/**
 * Renders an inline thermal watermark block approximating monochrome output
 */
function WatermarkPreviewBlock({
  watermark,
  logoUrl,
  isRepeat = false,
}: {
  watermark?: ReceiptWatermarkConfig;
  logoUrl?: string | null;
  isRepeat?: boolean;
}) {
  if (!watermark?.enabled) return null;

  const wmText = (watermark.text || 'RADHACAFE • OFFICIAL').trim();
  const intensityOpacity =
    watermark.intensity === 'light'
      ? 'opacity-40'
      : watermark.intensity === 'strong'
      ? 'opacity-90'
      : 'opacity-65';

  if (watermark.type === 'authenticity_band' || isRepeat) {
    return (
      <div
        aria-hidden="true"
        className={`my-2 py-1 text-center font-mono text-[9.5px] font-bold tracking-widest text-black border-y border-dashed border-black/30 select-none ${intensityOpacity}`}
      >
        - - - {wmText} - - -
      </div>
    );
  }

  if (watermark.type === 'logo') {
    return (
      <div aria-hidden="true" className={`my-2 flex justify-center items-center py-1 select-none ${intensityOpacity}`}>
        {logoUrl ? (
          <img
            src={logoUrl}
            alt=""
            className="h-7 max-w-[100px] object-contain grayscale contrast-150"
          />
        ) : (
          <span className="text-[9.5px] font-bold tracking-wider uppercase border border-black/40 px-2 py-0.5 rounded">
            {wmText}
          </span>
        )}
      </div>
    );
  }

  if (watermark.type === 'logo_text') {
    return (
      <div aria-hidden="true" className={`my-2 text-center py-1 select-none ${intensityOpacity}`}>
        {logoUrl && (
          <div className="flex justify-center mb-1">
            <img
              src={logoUrl}
              alt=""
              className="h-6 max-w-[90px] object-contain grayscale contrast-150"
            />
          </div>
        )}
        <p className="text-[10px] font-black tracking-wider uppercase">{wmText}</p>
      </div>
    );
  }

  // Text watermark
  return (
    <div
      aria-hidden="true"
      className={`my-2 text-center py-1 select-none ${intensityOpacity}`}
    >
      <p className="text-[10px] font-black tracking-wider uppercase">{wmText}</p>
    </div>
  );
}

/**
 * Pixel-perfect, column-aligned, fully responsive DOM receipt slip preview.
 * Immune to character-padding overflow and font-size clipping.
 */
export function ReceiptPreview({ order, templateConfig, cafeSettings }: ReceiptPreviewProps) {
  if (!order) return null;

  const { data, config } = formatReceiptFromTemplate(order, templateConfig, cafeSettings);
  const width = config.paperWidth >= 42 ? 48 : 32;
  const isWide = width === 48;
  const sections = config.sectionOrder || [
    'header',
    'orderInfo',
    'customerInfo',
    'items',
    'summary',
    'payment',
    'footer',
  ];

  const logoUrl = cafeSettings?.receipt_logo_url || cafeSettings?.logo_url || (data as any)?.logoUrl || null;
  const branding = config.branding || {
    showLogo: true,
    logoAlignment: 'center',
    logoSize: 'medium',
    showAuthenticityMark: true,
    authenticityText: 'Official RadhaCafe Receipt',
    showReceiptReference: true,
    watermark: {
      enabled: true,
      type: 'logo_text',
      position: 'center',
      intensity: 'light',
      repeat: false,
      text: 'RADHACAFE • OFFICIAL',
    },
  };

  const wmPosition = branding.watermark?.position || 'center';
  const shouldRepeatWm = branding.watermark?.repeat && data.items.length > 5;

  return (
    <div className="flex w-full min-w-0 justify-center py-2 px-1">
      <article
        aria-label={`${isWide ? '80' : '58'} mm thermal receipt slip preview`}
        style={{ maxWidth: isWide ? '420px' : '320px' }}
        className="receipt-preview relative h-fit w-full min-w-0 overflow-hidden border border-black/15 bg-[#fffef9] px-4 sm:px-5.5 pt-5 pb-3.5 font-mono text-[11px] sm:text-[11.5px] leading-[1.45] text-[#141414] shadow-[0_20px_50px_-20px_rgba(46,34,24,0.35),0_3px_12px_rgba(46,34,24,0.08)] select-text"
      >
        {/* Top Paper Perforation Border */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-1.5 border-b border-black/5 bg-[repeating-linear-gradient(90deg,transparent_0_6px,rgba(0,0,0,0.09)_6px_7px)]"
        />

        <div className="space-y-2.5 w-full min-w-0">
          {sections.map((sectionKey, index) => {
            // -------------------------------------------------------------
            // SECTION: HEADER (Branding, Logo, Name, Address, Contact)
            // -------------------------------------------------------------
            if (sectionKey === 'header') {
              return (
                <section
                  key={`${sectionKey}-${index}`}
                  className={`space-y-0.5 w-full ${alignmentClass(config.header.alignment)}`}
                >
                  {/* Official RadhaCafe Brand Logo with Size & Alignment */}
                  {branding.showLogo && logoUrl && (
                    <div
                      className={`mb-2 flex ${
                        branding.logoAlignment === 'center'
                          ? 'justify-center'
                          : branding.logoAlignment === 'right'
                          ? 'justify-end'
                          : 'justify-start'
                      }`}
                    >
                      <img
                        src={logoUrl}
                        alt="RadhaCafe logo"
                        className={`object-contain grayscale contrast-125 transition-all ${
                          branding.logoSize === 'small'
                            ? 'h-8 max-w-[90px]'
                            : branding.logoSize === 'large'
                            ? 'h-14 max-w-[170px]'
                            : 'h-11 max-w-[130px]'
                        }`}
                      />
                    </div>
                  )}

                  {config.header.cafeNameVisible && config.header.cafeNameText && (
                    <h3 className={`uppercase tracking-tight ${emphasisClass(config.header.emphasis)}`}>
                      {config.header.cafeNameText}
                    </h3>
                  )}

                  {/* Official Receipt Authenticity Mark */}
                  {branding.showAuthenticityMark && (
                    <p className="text-[10px] font-bold uppercase tracking-wider text-black/80 pt-0.5">
                      {branding.authenticityText || 'Official RadhaCafe Receipt'}
                    </p>
                  )}

                  {config.header.taglineVisible && config.header.taglineText && (
                    <p className="text-[10.5px] sm:text-[11px] text-black/80">{config.header.taglineText}</p>
                  )}

                  {config.header.addressVisible && config.header.addressText && (
                    <p className="text-[10px] sm:text-[10.5px] text-black/80 whitespace-pre-line leading-tight pt-0.5">
                      {config.header.addressText}
                    </p>
                  )}

                  {config.header.phoneVisible && config.header.phoneText && (
                    <p className="text-[10.5px]">Tel: {config.header.phoneText}</p>
                  )}

                  {config.header.emailVisible && config.header.emailText && (
                    <p className="text-[10.5px]">Email: {config.header.emailText}</p>
                  )}

                  <ReceiptDivider style={config.dividerStyle} />

                  {/* Upper Position Watermark */}
                  {wmPosition === 'upper' && (
                    <>
                      <WatermarkPreviewBlock watermark={branding.watermark} logoUrl={logoUrl} />
                      <ReceiptDivider style={config.dividerStyle} />
                    </>
                  )}
                </section>
              );
            }

            // -------------------------------------------------------------
            // SECTION: ORDER INFO (Order #, Date, Cashier, Status)
            // -------------------------------------------------------------
            if (sectionKey === 'orderInfo') {
              return (
                <section
                  key={`${sectionKey}-${index}`}
                  className={`space-y-0.5 w-full ${alignmentClass(config.orderInfo.alignment)} ${emphasisClass(
                    config.orderInfo.emphasis
                  )}`}
                >
                  {config.orderInfo.orderNumberVisible && (
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-black/70">Order #:</span>
                      <span className="font-bold">{data.orderNumber}</span>
                    </div>
                  )}

                  {config.orderInfo.dateVisible && (
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-black/70">Date:</span>
                      <span>{data.dateTime}</span>
                    </div>
                  )}

                  {config.orderInfo.cashierVisible && data.cashierName && (
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-black/70">Cashier:</span>
                      <span>{data.cashierName}</span>
                    </div>
                  )}

                  {config.orderInfo.statusVisible && (
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-black/70">Status:</span>
                      <span className="font-bold uppercase">{data.status}</span>
                    </div>
                  )}

                  <ReceiptDivider style={config.dividerStyle} />
                </section>
              );
            }

            // -------------------------------------------------------------
            // SECTION: CUSTOMER INFO
            // -------------------------------------------------------------
            if (sectionKey === 'customerInfo') {
              const showCustomer =
                config.customerInfo.customerNameVisible &&
                data.customerName &&
                data.customerName !== 'Walk-in Customer';
              const showPhone = config.customerInfo.phoneVisible && data.customerPhone;
              const showStatus = config.customerInfo.paymentStatusVisible && data.isPayLater;

              if (!showCustomer && !showPhone && !showStatus) return null;

              return (
                <section
                  key={`${sectionKey}-${index}`}
                  className={`space-y-0.5 w-full ${alignmentClass(config.customerInfo.alignment)}`}
                >
                  {showCustomer && (
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-black/70">Customer:</span>
                      <span className="font-semibold truncate">{data.customerName}</span>
                    </div>
                  )}

                  {showPhone && (
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-black/70">Phone:</span>
                      <span>{data.customerPhone}</span>
                    </div>
                  )}

                  {showStatus && (
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-black/70">Account:</span>
                      <span className="font-bold text-black">CREDIT CUSTOMER</span>
                    </div>
                  )}

                  <ReceiptDivider style={config.dividerStyle} />
                </section>
              );
            }

            // -------------------------------------------------------------
            // SECTION: ITEMS TABLE (Clean column grid alignment)
            // -------------------------------------------------------------
            if (sectionKey === 'items') {
              const showUnitPrice = config.items.showUnitPrice;

              return (
                <section key={`${sectionKey}-${index}`} className="w-full space-y-1">
                  {/* Table Column Headers */}
                  {config.items.showHeaders && (
                    <div className="flex items-baseline justify-between gap-1 pb-0.5 text-[10.5px] font-black uppercase text-black border-b border-black/30">
                      <span className="flex-1 text-left">Item</span>
                      <span className="w-8 text-center shrink-0">Qty</span>
                      {showUnitPrice && isWide && (
                        <span className="w-14 text-right shrink-0">Price</span>
                      )}
                      <span className="w-18 text-right shrink-0">Amount</span>
                    </div>
                  )}

                  {config.items.dividerBefore && <ReceiptDivider style={config.dividerStyle} />}

                  {/* Item Rows */}
                  <div className="space-y-1.5 pt-0.5">
                    {data.items.map((item, itemIdx) => (
                      <div key={`item-${itemIdx}`} className="space-y-0.5">
                        <div className="flex items-baseline justify-between gap-1">
                          {/* Item Title & Optional inline unit price for compact 58mm */}
                          <div className="flex-1 min-w-0 text-left pr-1">
                            <span className="font-medium text-black leading-snug break-words">
                              {item.name}
                            </span>
                            {showUnitPrice && !isWide && item.unitPrice > 0 && (
                              <span className="text-[10px] text-black/60 block">
                                @ Rs. {item.unitPrice.toFixed(0)}
                              </span>
                            )}
                          </div>

                          {/* Quantity */}
                          <span className="w-8 text-center shrink-0 font-semibold text-black/80">
                            x{item.quantity}
                          </span>

                          {/* Unit Price (80mm only) */}
                          {showUnitPrice && isWide && (
                            <span className="w-14 text-right shrink-0 text-black/75">
                              Rs.{item.unitPrice.toFixed(0)}
                            </span>
                          )}

                          {/* Total Line Amount */}
                          <span className="w-18 text-right shrink-0 font-semibold text-black font-mono">
                            Rs. {item.amount.toFixed(2)}
                          </span>
                        </div>

                        {/* Controlled repeat watermark in long receipt items */}
                        {shouldRepeatWm && itemIdx === Math.floor(data.items.length / 2) && (
                          <WatermarkPreviewBlock
                            watermark={branding.watermark}
                            logoUrl={logoUrl}
                            isRepeat={true}
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  {config.items.dividerAfter && <ReceiptDivider style={config.dividerStyle} />}

                  {/* Center Position Watermark (Between Items and Totals) */}
                  {wmPosition === 'center' && (
                    <>
                      <WatermarkPreviewBlock watermark={branding.watermark} logoUrl={logoUrl} />
                      <ReceiptDivider style={config.dividerStyle} />
                    </>
                  )}
                </section>
              );
            }

            // -------------------------------------------------------------
            // SECTION: SUMMARY & TOTALS (Immune to clipping / misalignments)
            // -------------------------------------------------------------
            if (sectionKey === 'summary') {
              return (
                <section key={`${sectionKey}-${index}`} className="w-full space-y-1">
                  {config.summary.dividerBeforeTotal && <ReceiptDivider style={config.dividerStyle} />}

                  {/* Subtotal */}
                  {config.summary.subtotalVisible && (
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-black/80">Subtotal</span>
                      <span className="font-mono font-medium">{formatMoney(data.subtotal)}</span>
                    </div>
                  )}

                  {/* Tax */}
                  {config.summary.taxVisible && data.tax > 0 && (
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-black/80">GST Tax</span>
                      <span className="font-mono font-medium">{formatMoney(data.tax)}</span>
                    </div>
                  )}

                  {/* Discount */}
                  {config.summary.discountVisible && data.discount > 0 && (
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-black/80">Discount</span>
                      <span className="font-mono font-medium">-{formatMoney(data.discount)}</span>
                    </div>
                  )}

                  {/* Grand Total */}
                  <div
                    className={`flex items-baseline justify-between gap-2 border-t border-black/20 pt-1.5 mt-1 ${
                      config.summary.doubleSizeTotal
                        ? 'text-sm sm:text-[15px] font-black tracking-tight'
                        : config.summary.grandTotalBold
                        ? 'font-black text-xs sm:text-sm'
                        : 'font-bold'
                    }`}
                  >
                    <span className="uppercase">TOTAL</span>
                    <span className="font-mono text-right">{formatMoney(data.total)}</span>
                  </div>
                </section>
              );
            }

            // -------------------------------------------------------------
            // SECTION: PAYMENT DETAILS
            // -------------------------------------------------------------
            if (sectionKey === 'payment') {
              return (
                <section key={`${sectionKey}-${index}`} className="w-full space-y-1 pt-0.5">
                  {config.payment.paymentMethodVisible && (
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-black/75">Payment</span>
                      <span className="font-bold uppercase">{data.paymentMethod}</span>
                    </div>
                  )}

                  {config.payment.amountPaidVisible && (
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-black/75">Paid</span>
                      <span className="font-mono font-medium">{formatMoney(data.paidAmount)}</span>
                    </div>
                  )}

                  {config.payment.amountDueVisible && data.dueAmount > 0 && (
                    <div className="flex items-baseline justify-between gap-2 font-black text-black">
                      <span>Amount Due</span>
                      <span className="font-mono">{formatMoney(data.dueAmount)}</span>
                    </div>
                  )}

                  <ReceiptDivider style={config.dividerStyle} />

                  {/* Lower Position Watermark */}
                  {wmPosition === 'lower' && (
                    <>
                      <WatermarkPreviewBlock watermark={branding.watermark} logoUrl={logoUrl} />
                      <ReceiptDivider style={config.dividerStyle} />
                    </>
                  )}
                </section>
              );
            }

            // -------------------------------------------------------------
            // SECTION: FOOTER (Thank You Note, Contact Note)
            // -------------------------------------------------------------
            if (sectionKey === 'footer') {
              return (
                <section
                  key={`${sectionKey}-${index}`}
                  className={`space-y-1 pt-1 w-full ${alignmentClass(config.footer.alignment)}`}
                >
                  {config.footer.thankYouMessage && (
                    <p className={`text-[11.5px] ${emphasisClass(config.footer.emphasis)}`}>
                      {config.footer.thankYouMessage}
                    </p>
                  )}

                  {config.footer.secondaryMessage && (
                    <p className="text-[10px] sm:text-[10.5px] text-black/80 leading-tight">
                      {config.footer.secondaryMessage}
                    </p>
                  )}

                  {config.footer.contactMessage && (
                    <p className="text-[10px] sm:text-[10.5px] text-black/80 font-medium">
                      {config.footer.contactMessage}
                    </p>
                  )}
                </section>
              );
            }

            return null;
          })}
        </div>

        {/* Bottom Paper Serrated Edge */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-2 bg-[linear-gradient(135deg,transparent_50%,#f4eee3_50%)_0_0/8px_8px_repeat-x]"
        />
      </article>
    </div>
  );
}
