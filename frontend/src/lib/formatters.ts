export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatWeight(grams: number): string {
  if (grams >= 1000) {
    const kg = grams / 1000;
    return `${Number.isInteger(kg) ? kg : kg.toFixed(1)} kg (${grams.toLocaleString('id-ID')} gr)`;
  }
  return `${grams.toLocaleString('id-ID')} gram`;
}

export function formatDate(dateString: string | null): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function getOrderStatusBadge(status: string): { label: string; bg: string; text: string } {
  switch (status) {
    case 'paid':
      return { label: 'Lunas / Dibayar', bg: 'bg-emerald-100', text: 'text-emerald-800' };
    case 'processing':
      return { label: 'Diproses Kitchen', bg: 'bg-blue-100', text: 'text-blue-800' };
    case 'shipped':
      return { label: 'Sedang Dikirim', bg: 'bg-amber-100', text: 'text-amber-800' };
    case 'completed':
      return { label: 'Selesai', bg: 'bg-purple-100', text: 'text-purple-800' };
    case 'cancelled':
      return { label: 'Dibatalkan', bg: 'bg-rose-100', text: 'text-rose-800' };
    case 'pending':
    default:
      return { label: 'Menunggu Pembayaran', bg: 'bg-yellow-100', text: 'text-yellow-800' };
  }
}
