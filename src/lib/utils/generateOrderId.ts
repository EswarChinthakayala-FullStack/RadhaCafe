// Fallback client-side generator for temporary IDs / offline previews.
// Authoritative order numbers (RC-YYYYMMDD-XXXX) are generated database-side.
export function generateTempOrderId(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `RC-${dateStr}-${randomNum}`;
}
