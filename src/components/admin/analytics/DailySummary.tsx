import { useHistoricalDailySummaries } from '../../../hooks/useAnalytics';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { formatCurrency } from '../../../lib/utils/formatCurrency';
import { formatDate } from '../../../lib/utils/formatDate';
import { Loader } from '../../shared/Loader';

export function DailySummary() {
  const { data: summaries, isLoading } = useHistoricalDailySummaries(30);

  if (isLoading) {
    return (
      <Card className="border-border/80 bg-card shadow-sm p-6 text-center">
        <Loader label="Loading historical daily summaries..." />
      </Card>
    );
  }

  return (
    <Card className="border-border/80 bg-card shadow-sm overflow-hidden">
      <CardHeader>
        <CardTitle className="text-base font-bold font-heading text-foreground">Historical Daily Summaries</CardTitle>
        <CardDescription className="text-xs">
          Daily sales performance records sourced directly from the database daily summary view.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-secondary/60 text-muted-foreground font-semibold uppercase border-y border-border">
              <tr>
                <th className="p-3">Order Date</th>
                <th className="p-3">Completed Orders</th>
                <th className="p-3">Total Revenue</th>
                <th className="p-3">Avg Order Value</th>
                <th className="p-3">Items Sold</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {summaries && summaries.length > 0 ? (
                summaries.map((row) => (
                  <tr key={row.order_date || Math.random().toString()} className="hover:bg-secondary/20 transition-colors">
                    <td className="p-3 font-bold font-mono text-foreground">
                      {row.order_date ? formatDate(row.order_date) : 'N/A'}
                    </td>
                    <td className="p-3 font-semibold">{row.total_orders}</td>
                    <td className="p-3 font-bold text-primary">{formatCurrency(row.total_revenue)}</td>
                    <td className="p-3 text-cinnamon font-medium">{formatCurrency(row.avg_order_value)}</td>
                    <td className="p-3 text-muted-foreground font-medium">{row.total_items_sold}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground italic">
                    No historical daily summaries recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
