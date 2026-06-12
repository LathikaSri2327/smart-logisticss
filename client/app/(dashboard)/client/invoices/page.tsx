'use client';
import { motion } from 'framer-motion';
import { FileText, Download, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useFetch } from '@/hooks/useApi';
import { Badge, EmptyState } from '@/components/ui';
import { formatDate, formatCurrency } from '@/utils/helpers';

export default function ClientInvoicesPage() {
  const { data, loading } = useFetch<any[]>('/orders?mine=1');
  const orders = data || [];

  const handleDownload = (order: any) => {
    const content = `INVOICE\n${'='.repeat(50)}\nOrder ID: ${order.orderId}\nDate: ${formatDate(order.createdAt)}\n${'='.repeat(50)}\nItems:\n${order.items?.map((i: any) => `  ${i.productName} x${i.quantity} @ ${formatCurrency(i.unitPrice)} = ${formatCurrency(i.totalPrice)}`).join('\n') || 'N/A'}\n${'='.repeat(50)}\nSubtotal: ${formatCurrency(order.subtotal)}\nTax: ${formatCurrency(order.tax)}\nTotal: ${formatCurrency(order.totalAmount)}\nPayment Status: ${order.paymentStatus}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `invoice-${order.orderId}.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  const paymentIcon = { Paid: <CheckCircle2 className="w-4 h-4 text-green-500" />, Pending: <Clock className="w-4 h-4 text-yellow-500" />, Overdue: <AlertCircle className="w-4 h-4 text-red-500" />, Refunded: <FileText className="w-4 h-4 text-gray-500" /> };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invoices</h1>
        <p className="text-gray-500 text-sm">Download your invoice history</p>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="card p-4 h-20 animate-pulse" />)}</div>
      ) : orders.length === 0 ? (
        <div className="card p-12"><EmptyState icon={<FileText className="w-8 h-8" />} title="No invoices" description="Your invoices will appear here." /></div>
      ) : (
        <div className="space-y-3">
          {orders.map((o: any, i: number) => (
            <motion.div key={o.id} className="card p-4 flex items-center justify-between hover:shadow-md transition-shadow"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-brand-100 dark:bg-brand-900/30 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white font-mono text-sm">{o.orderId}</p>
                  <p className="text-xs text-gray-500">Issued {formatDate(o.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="hidden sm:block text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(o.totalAmount)}</p>
                  <p className="text-xs text-gray-500">{o.items?.length} item{o.items?.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  {paymentIcon[o.paymentStatus as keyof typeof paymentIcon]}
                  <Badge label={o.paymentStatus} />
                </div>
                <button onClick={() => handleDownload(o)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-500 hover:text-brand-600">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
