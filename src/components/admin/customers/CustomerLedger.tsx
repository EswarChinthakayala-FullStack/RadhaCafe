import { formatCurrency } from '../../../lib/utils/formatCurrency';
import { formatDate } from '../../../lib/utils/formatDate';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table';
import { Badge } from '../../ui/badge';
import { Card } from '../../ui/card';
import { Skeleton } from '../../ui/skeleton';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  InvoiceIcon,
  SquareLockCheckIcon,
  ShoppingBag01Icon,
} from '@hugeicons/core-free-icons';
import type { CustomerLedgerEntry } from '../../../types';

interface CustomerLedgerProps {
  ledger: CustomerLedgerEntry[];
  isLoading: boolean;
  onSelectOrder?: (orderId: string) => void;
}

export function CustomerLedger({
  ledger,
  isLoading,
  onSelectOrder,
}: CustomerLedgerProps) {
  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (!ledger || ledger.length === 0) {
    return (
      <div className="p-10 text-center bg-card rounded-xl border border-border/80 text-muted-foreground space-y-2">
        <HugeiconsIcon icon={InvoiceIcon} className="mx-auto w-8 h-8 text-muted-foreground/60" />
        <p className="font-bold text-sm text-foreground">No Ledger Transactions</p>
        <p className="text-xs max-w-sm mx-auto">
          Customer orders and payments will be recorded chronologically in this double-entry credit ledger.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop Ledger Table */}
      <div className="hidden sm:block rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="border-border/80 hover:bg-transparent">
              <TableHead className="font-bold text-xs text-foreground min-w-[140px]">Date & Time</TableHead>
              <TableHead className="font-bold text-xs text-foreground min-w-[110px]">Type</TableHead>
              <TableHead className="font-bold text-xs text-foreground min-w-[140px]">Reference</TableHead>
              <TableHead className="font-bold text-xs text-foreground">Description</TableHead>
              <TableHead className="font-bold text-xs text-foreground text-right min-w-[110px]">
                Added to Due (Dr)
              </TableHead>
              <TableHead className="font-bold text-xs text-foreground text-right min-w-[110px]">
                Payment (Cr)
              </TableHead>
              <TableHead className="font-bold text-xs text-foreground text-right min-w-[120px]">
                Running Due
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ledger.map((entry) => {
              const isOrder = entry.type === 'order';
              return (
                <TableRow
                  key={entry.id}
                  className="border-border/60 hover:bg-secondary/30 transition-colors"
                >
                  {/* Date */}
                  <TableCell className="py-3 font-mono text-xs text-muted-foreground">
                    {formatDate(entry.date, 'dd MMM yyyy, hh:mm a')}
                  </TableCell>

                  {/* Type Badge */}
                  <TableCell className="py-3">
                    {isOrder ? (
                      <Badge
                        variant="outline"
                        className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold uppercase gap-1"
                      >
                        <HugeiconsIcon icon={ShoppingBag01Icon} size={11} />
                        <span>Order</span>
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-bold uppercase gap-1"
                      >
                        <HugeiconsIcon icon={SquareLockCheckIcon} size={11} />
                        <span>Payment</span>
                      </Badge>
                    )}
                  </TableCell>

                  {/* Reference */}
                  <TableCell className="py-3 font-mono text-xs font-semibold">
                    {entry.orderId && onSelectOrder ? (
                      <button
                        type="button"
                        onClick={() => onSelectOrder(entry.orderId!)}
                        className="text-cinnamon hover:underline font-bold"
                      >
                        {entry.reference}
                      </button>
                    ) : (
                      <span className="text-foreground">{entry.reference}</span>
                    )}
                  </TableCell>

                  {/* Description */}
                  <TableCell className="py-3 text-xs text-muted-foreground">
                    {entry.description}
                  </TableCell>

                  {/* Debit / Added to Due */}
                  <TableCell className="py-3 text-right font-mono text-xs font-bold text-amber-700 dark:text-amber-300">
                    {entry.debit > 0 ? `+${formatCurrency(entry.debit)}` : '—'}
                  </TableCell>

                  {/* Credit / Payment Received */}
                  <TableCell className="py-3 text-right font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {entry.credit > 0 ? `-${formatCurrency(entry.credit)}` : '—'}
                  </TableCell>

                  {/* Running Balance */}
                  <TableCell className="py-3 text-right font-mono text-xs font-extrabold text-foreground">
                    <span
                      className={
                        entry.runningBalance > 0
                          ? 'text-cinnamon'
                          : 'text-emerald-600 dark:text-emerald-400'
                      }
                    >
                      {formatCurrency(entry.runningBalance)}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Ledger Cards (< sm) */}
      <div className="sm:hidden space-y-2.5">
        {ledger.map((entry) => {
          const isOrder = entry.type === 'order';
          return (
            <Card
              key={entry.id}
              className="border border-border/80 bg-card rounded-xl shadow-2xs p-3.5 space-y-2"
            >
              <div className="flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 font-semibold">
                  {isOrder ? (
                    <Badge
                      variant="outline"
                      className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold uppercase px-1.5"
                    >
                      Order
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-bold uppercase px-1.5"
                    >
                      Payment
                    </Badge>
                  )}
                  <span className="font-mono text-foreground">{entry.reference}</span>
                </div>

                <span className="text-[11px] text-muted-foreground font-mono">
                  {formatDate(entry.date, 'dd MMM, hh:mm a')}
                </span>
              </div>

              <p className="text-xs text-muted-foreground">{entry.description}</p>

              <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
                <div>
                  {entry.debit > 0 && (
                    <span className="font-mono font-bold text-amber-700 dark:text-amber-300">
                      +{formatCurrency(entry.debit)}
                    </span>
                  )}
                  {entry.credit > 0 && (
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      -{formatCurrency(entry.credit)}
                    </span>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-muted-foreground mr-1.5">Running Due:</span>
                  <span
                    className={`font-mono font-extrabold ${
                      entry.runningBalance > 0
                        ? 'text-cinnamon'
                        : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {formatCurrency(entry.runningBalance)}
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
