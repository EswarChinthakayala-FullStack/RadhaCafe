/**
 * Formats a currency amount into Indian currency format (e.g. ₹1,500.00).
 */
export function formatCurrency(
  amount: number,
  symbol: string = '₹',
  options?: { compact?: boolean }
): string {
  if (options?.compact) {
    return formatCompactCurrency(amount, symbol);
  }
  return `${symbol}${Number(amount || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Compact currency formatter for Dashboard KPI cards, tables & badges.
 * Converts large amounts to K, L, Cr to prevent card overflowing:
 * - >= 10,000,000 (1 Crore) -> ₹1.25Cr
 * - >= 100,000 (1 Lakh) -> ₹1.5L / ₹25L
 * - >= 1,000 (1 Thousand) -> ₹1.5K / ₹99.5K
 * - < 1,000 -> Regular formatted currency (₹180.00)
 */
export function formatCompactCurrency(amount: number, symbol: string = '₹'): string {
  const abs = Math.abs(amount || 0);
  const sign = amount < 0 ? '-' : '';

  if (abs >= 10000000) {
    // 1 Crore = 10,000,000
    const crores = abs / 10000000;
    return `${sign}${symbol}${crores.toFixed(crores >= 10 ? 1 : 2).replace(/\.0+$/, '')}Cr`;
  }
  if (abs >= 100000) {
    // 1 Lakh = 100,000
    const lakhs = abs / 100000;
    return `${sign}${symbol}${lakhs.toFixed(lakhs >= 10 ? 1 : 2).replace(/\.0+$/, '')}L`;
  }
  if (abs >= 1000) {
    // 1 Thousand = 1,000
    const thousands = abs / 1000;
    return `${sign}${symbol}${thousands.toFixed(thousands >= 10 ? 0 : 1).replace(/\.0$/, '')}K`;
  }

  return formatCurrency(amount, symbol);
}
