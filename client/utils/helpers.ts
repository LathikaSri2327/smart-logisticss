export const formatDate = (date: string | Date | undefined): string => {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(date));
};

export const formatDateTime = (date: string | Date | undefined): string => {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-IN', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(date));
};

export const formatPhone = (phone: string | undefined): string => {
  if (!phone) return '—';
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('91') && digits.length === 12)
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  if (digits.length === 10)
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  return phone;
};

export const formatDistanceToNow = (date: string | Date): string => {
  const now = Date.now();
  const diff = now - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
};

export const formatCurrency = (amount: number | undefined): string => {
  if (amount === undefined || amount === null) return '₹0';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
};

export const getStatusColor = (status: string): string => {
  const map: Record<string, string> = {
    Pending: 'text-yellow-600', Packed: 'text-blue-600', InTransit: 'text-purple-600',
    CustomsClearance: 'text-orange-600', OutForDelivery: 'text-cyan-600',
    Delivered: 'text-green-600', Cancelled: 'text-red-600',
  };
  return map[status] || 'text-gray-600';
};

export const generateCSV = (data: Record<string, any>[], filename: string): void => {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const rows = data.map((row) => headers.map((h) => `"${row[h] ?? ''}"`).join(','));
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `${filename}.csv`; a.click();
  URL.revokeObjectURL(url);
};

export const truncate = (str: string, length: number): string =>
  str?.length > length ? str.substring(0, length) + '...' : str || '';
