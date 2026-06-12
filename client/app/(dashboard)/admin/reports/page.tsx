'use client';
import { motion } from 'framer-motion';
import { Download, BarChart3, Package, DollarSign } from 'lucide-react';
import { useFetch } from '@/hooks/useApi';
import { Button } from '@/components/ui';
import { formatDate, formatCurrency, generateCSV } from '@/utils/helpers';

export default function AdminReportsPage() {
  const { data: shipmentsData } = useFetch<any>('/shipments?limit=100&page=1');
  const { data: ordersData } = useFetch<any[]>('/orders');

  const shipments = shipmentsData?.shipments || [];
  const orders = ordersData || [];

  const exportShipments = () => {
    generateCSV(shipments.map((s: any) => ({
      'Shipment ID': s.shipmentId, Client: s.client?.name, Company: s.client?.company,
      Driver: s.driver?.name || 'Unassigned', From: `${s.source?.city}, ${s.source?.country}`,
      To: `${s.destination?.city}, ${s.destination?.country}`, Status: s.shipmentStatus,
      Type: s.shipmentType, Priority: s.priority, Value: s.value || 0,
      'Est. Delivery': formatDate(s.estimatedDelivery), Created: formatDate(s.createdAt),
    })), 'shipments-report');
  };

  const exportOrders = () => {
    generateCSV(orders.map((o: any) => ({
      'Order ID': o.orderId, Client: o.client?.name, 'Shipment ID': o.shipment?.shipmentId || '—',
      Amount: o.totalAmount, 'Payment Status': o.paymentStatus,
      Method: o.paymentMethod || '—', Date: formatDate(o.createdAt),
    })), 'orders-report');
  };

  const reportCards = [
    { title: 'Shipments Report', desc: 'All shipments with status, routes, drivers, and values', icon: Package, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600', count: shipments.length, onExport: exportShipments },
    { title: 'Revenue Report', desc: 'Orders, payments, and revenue breakdown', icon: DollarSign, color: 'bg-green-100 dark:bg-green-900/30 text-green-600', count: orders.length, onExport: exportOrders },
    { title: 'Analytics Summary', desc: 'KPIs, trends, and performance metrics', icon: BarChart3, color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600', count: null, onExport: () => {} },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h1>
        <p className="text-gray-500 text-sm">Download and export business reports</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportCards.map((r, i) => (
          <motion.div key={r.title} className="card p-6 hover:shadow-md transition-shadow" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <div className={`w-12 h-12 rounded-xl ${r.color} flex items-center justify-center mb-4`}>
              <r.icon className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{r.title}</h3>
            <p className="text-sm text-gray-500 mb-4">{r.desc}</p>
            {r.count !== null && <p className="text-xs text-gray-400 mb-4">{r.count} records available</p>}
            <Button variant="secondary" size="sm" icon={<Download className="w-4 h-4" />} onClick={r.onExport} className="w-full justify-center">
              Export CSV
            </Button>
          </motion.div>
        ))}
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Recent Shipments Summary</h2>
          <Button variant="secondary" size="sm" icon={<Download className="w-4 h-4" />} onClick={exportShipments}>Export All</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                {['ID', 'Client', 'Route', 'Status', 'Value', 'Date'].map((h) => (
                  <th key={h} className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {shipments.slice(0, 10).map((s: any) => (
                <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                  <td className="px-4 py-2 font-mono text-xs text-brand-600 dark:text-brand-400">{s.shipmentId}</td>
                  <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{s.client?.name}</td>
                  <td className="px-4 py-2 text-gray-500">{s.source?.city} → {s.destination?.city}</td>
                  <td className="px-4 py-2"><span className="text-xs font-medium text-gray-600 dark:text-gray-400">{s.shipmentStatus}</span></td>
                  <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{formatCurrency(s.value)}</td>
                  <td className="px-4 py-2 text-gray-500">{formatDate(s.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
