import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { Button } from '../../ui/button';
import { Skeleton } from '../../ui/skeleton';
import { formatCurrency } from '../../../lib/utils/formatCurrency';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Calendar01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
} from '@hugeicons/core-free-icons';
import type { CafeDailyRecord } from '../../../types';

interface DailyPerformanceTableProps {
  records?: CafeDailyRecord[];
  isLoading: boolean;
}

export function DailyPerformanceTable({ records, isLoading }: DailyPerformanceTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  if (isLoading) {
    return (
      <Card className="border-border/80 bg-card rounded-2xl shadow-2xs overflow-hidden">
        <CardHeader className="pb-3 border-b border-border/60">
          <Skeleton className="h-5 w-44 bg-muted/60" />
          <Skeleton className="h-3 w-64 bg-muted/40" />
        </CardHeader>
        <CardContent className="p-6 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-10 w-full bg-muted/30 rounded-lg" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const items = records && records.length > 0 ? records : [];
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const pageItems = items.slice(startIndex, startIndex + pageSize);

  return (
    <Card className="border-border/80 bg-card rounded-2xl shadow-2xs overflow-hidden">
      <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cinnamon/10 text-cinnamon">
              <HugeiconsIcon icon={Calendar01Icon} size={16} />
            </div>
            <CardTitle className="text-base font-bold font-heading text-foreground">
              Daily Performance Breakdown
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-muted-foreground">
            Day-by-day sales revenue, payment collections, and operational volume
          </CardDescription>
        </div>

        <span className="text-xs text-muted-foreground font-medium">
          {items.length} {items.length === 1 ? 'day recorded' : 'days recorded'}
        </span>
      </CardHeader>

      <CardContent className="p-0">
        {items.length > 0 ? (
          <div>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-secondary/50 text-muted-foreground font-semibold uppercase tracking-wider text-[10px] border-b border-border/60">
                  <tr>
                    <th className="p-3.5 pl-5">Date</th>
                    <th className="p-3.5">Orders</th>
                    <th className="p-3.5">Items</th>
                    <th className="p-3.5">Sales Revenue</th>
                    <th className="p-3.5">Collected</th>
                    <th className="p-3.5">Avg Order</th>
                    <th className="p-3.5">Discounts</th>
                    <th className="p-3.5 pr-5 text-right">Dues Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {pageItems.map((row) => (
                    <tr key={row.date} className="hover:bg-secondary/30 transition-colors">
                      <td className="p-3.5 pl-5 font-bold font-mono text-foreground">
                        {row.formatted_date}
                      </td>
                      <td className="p-3.5 font-semibold text-foreground">{row.orders}</td>
                      <td className="p-3.5 text-muted-foreground">{row.items_sold}</td>
                      <td className="p-3.5 font-bold text-cinnamon font-mono">{formatCurrency(row.sales)}</td>
                      <td className="p-3.5 font-semibold text-emerald-600 font-mono">
                        {formatCurrency(row.collected)}
                      </td>
                      <td className="p-3.5 text-foreground font-medium">{formatCurrency(row.aov)}</td>
                      <td className="p-3.5 text-muted-foreground">
                        {row.discount_amount > 0 ? formatCurrency(row.discount_amount) : '—'}
                      </td>
                      <td className="p-3.5 pr-5 text-right font-mono">
                        {row.outstanding_created > 0 ? (
                          <span className="text-amber-600 font-semibold">
                            {formatCurrency(row.outstanding_created)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">₹0</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-border/60">
              {pageItems.map((row) => (
                <div key={row.date} className="p-4 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">{row.formatted_date}</span>
                    <span className="font-bold font-mono text-cinnamon text-sm">
                      {formatCurrency(row.sales)}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[11px] text-muted-foreground bg-secondary/30 p-2.5 rounded-lg border border-border/40">
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-muted-foreground/80">
                        Orders
                      </span>
                      <span className="font-semibold text-foreground">{row.orders} ({row.items_sold} items)</span>
                    </div>

                    <div>
                      <span className="block text-[10px] uppercase font-bold text-muted-foreground/80">
                        Collected
                      </span>
                      <span className="font-semibold text-emerald-600 font-mono">
                        {formatCurrency(row.collected)}
                      </span>
                    </div>

                    <div>
                      <span className="block text-[10px] uppercase font-bold text-muted-foreground/80">
                        Avg Ticket
                      </span>
                      <span className="font-semibold text-foreground">{formatCurrency(row.aov)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Bar */}
            {totalPages > 1 && (
              <div className="p-3 sm:p-4 border-t border-border/60 bg-secondary/20 flex items-center justify-between gap-2 text-xs">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="h-8 text-xs font-semibold rounded-lg gap-1 border-border/80"
                >
                  <HugeiconsIcon icon={ArrowLeft01Icon} size={13} />
                  <span className="hidden sm:inline">Previous</span>
                </Button>

                <span className="text-[11px] text-muted-foreground font-medium">
                  Page <strong className="text-foreground">{currentPage}</strong> of{' '}
                  <strong className="text-foreground">{totalPages}</strong>
                </span>

                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="h-8 text-xs font-semibold rounded-lg gap-1 border-border/80"
                >
                  <span className="hidden sm:inline">Next</span>
                  <HugeiconsIcon icon={ArrowRight01Icon} size={13} />
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground">No daily records for this period</p>
            <p className="text-[11px]">Daily performance logs will generate as sales are made.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
