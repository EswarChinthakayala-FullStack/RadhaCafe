export function sanitizeCsvValue(val: any): string {
  if (val === null || val === undefined) return '""';
  let str = String(val);

  // Prevent CSV Formula Injection (=, +, -, @)
  if (str.length > 0 && ['=', '+', '-', '@'].includes(str.charAt(0))) {
    str = `'${str}`;
  }

  // Escape quotes
  str = str.replace(/"/g, '""');

  // Wrap in quotes if contains comma, quote, or newline
  if (/[",\n\r]/.test(str)) {
    return `"${str}"`;
  }
  return `"${str}"`;
}

export function exportToCsv(filename: string, headers: string[], rows: (string | number | boolean | null | undefined)[][]): void {
  const headerRow = headers.map(sanitizeCsvValue).join(',');
  const dataRows = rows.map((row) => row.map(sanitizeCsvValue).join(','));
  const csvContent = [headerRow, ...dataRows].join('\r\n');

  // UTF-8 BOM for Microsoft Excel compatibility
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
