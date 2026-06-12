'use client';
import { motion } from 'framer-motion';
import { ShoppingBag, Download } from 'lucide-react';
import { useFetch } from '@/hooks/useApi';
import { Badge, EmptyState, Button, Table } from '@/components/ui';
import { formatDate, formatCurrency, generateCSV } from '@/utils/helpers';

export default function ClientOrdersPage() {
  const { data, loading } = useFetch<any[]>('/orders?mine=1');
  const orders = data || [];

  const exportOrders = () => {
    generateCSV(orders.map((o: any) => ({
      'Order ID': o.orderId, 'Shipment ID': o.shipment?.shipmentId || '—',
      Amount: o.totalAmount, 'Payment Status': o.paymentStatus, Date: formatDate(o.createdAt),
    })), 'my-orders');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Orders</h1>
          <p className="text-gray-500 text-sm">View your order history and invoices</p>
        </div>
        {orders.length > 0 && <Button variant="secondary" size="sm" icon={<Download className="w-4 h-4" />} onClick={exportOrders}>Export CSV</Button>}
      </div>

      <div className="card overflow-hidden">
        <Table headers={['Order ID', 'Shipment', 'Items', 'Subtotal', 'Tax', 'Total', 'Payment', 'Date']} loading={loading}>
          {orders.length === 0 && !loading ? (
            <tr><td colSpan={8} className="py-12">
              <EmptyState icon={<ShoppingBag className="w-8 h-8" />} title="No orders yet" description="Your orders will appear here once placed." />
            </td></tr>
          ) : orders.map((o: any, i: number) => (
            <motion.tr key={o.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
              className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
              <td className="px-4 py-3 font-mono text-xs text-brand-600 dark:text-brand-400">{o.orderId}</td>
              <td className="px-4 py-3 font-mono text-xs text-gray-500">{o.shipment?.shipmentId || '—'}</td>
              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                <div>
                  {o.items?.slice(0, 2).map((item: any, ii: number) => (
                    <p key={ii} className="truncate max-w-32">{item.productName} ×{item.quantity}</p>
                  ))}
                  {o.items?.length > 2 && <p className="text-xs text-gray-400">+{o.items.length - 2} more</p>}
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{formatCurrency(o.subtotal)}</td>
              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{formatCurrency(o.tax)}</td>
              <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{formatCurrency(o.totalAmount)}</td>
              <td className="px-4 py-3"><Badge label={o.paymentStatus} dot /></td>
              <td className="px-4 py-3 text-sm text-gray-500">{formatDate(o.createdAt)}</td>
            </motion.tr>
          ))}
        </Table>
      </div>
    </div>
  );
}
