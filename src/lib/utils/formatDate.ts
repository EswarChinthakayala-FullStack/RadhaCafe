import { format, parseISO } from 'date-fns';

export function formatDate(dateString?: string | Date | null, formatStr: string = 'dd MMM yyyy, hh:mm a'): string {
  if (!dateString) return '';
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return format(date, formatStr);
  } catch {
    return String(dateString);
  }
}
