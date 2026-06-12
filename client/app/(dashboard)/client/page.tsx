'use client';
import { motion } from 'framer-motion';
import { Package, Truck, CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useFetch } from '@/hooks/useApi';
import { StatCard, Badge, SkeletonCard, Button } from '@/components/ui';
import { formatDate, formatCurrency } from '@/utils/helpers';
import { useAuth } from '@/hooks/useAuth';

export default function ClientDashboard() {
  const { user } = useAuth();
  const { data: shipments, loading: loadingS } = useFetch<any[]>('/shipments?mine=1');
  const { data: ordersData, loading: loadingO } = useFetch<any[]>('/orders?mine=1');

  const allShipments = (shipments as any)?.shipments || shipments || [];
  const orders = ordersData || [];
  const activeShipments = allShipments.filter((s: any) => !['Delivered', 'Cancelled'].includes(s.shipmentStatus));
  const totalSpend = orders.filter((o: any) => o.paymentStatus === 'Paid').reduce((s: number, o: any) => s + o.totalAmount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-gray-500 text-sm">Track your shipments and manage orders</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loadingS ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />) : (
          <>
            <StatCard title="Total Shipments" value={allShipments.length} icon={<Package className="w-5 h-5 text-blue-600" />} color="bg-blue-100 dark:bg-blue-900/30" />
            <StatCard title="Active" value={activeShipments.length} icon={<Truck className="w-5 h-5 text-purple-600" />} color="bg-purple-100 dark:bg-purple-900/30" />
            <StatCard title="Delivered" value={allShipments.filter((s: any) => s.shipmentStatus === 'Delivered').length} icon={<CheckCircle2 className="w-5 h-5 text-green-600" />} color="bg-green-100 dark:bg-green-900/30" />
            <StatCard title="Total Spend" value={formatCurrency(totalSpend)} icon={<Clock className="w-5 h-5 text-emerald-600" />} color="bg-emerald-100 dark:bg-emerald-900/30" />
          </>
        )}
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Active Shipments</h2>
          <Link href="/client/orders"><Button variant="ghost" size="sm" icon={<ArrowRight className="w-4 h-4" />}>View All</Button></Link>
        </div>
        {activeShipments.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">No active shipments</p>
        ) : (
          <div className="space-y-3">
            {activeShipments.slice(0, 5).map((s: any, i: number) => (
              <motion.div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-brand-100 dark:bg-brand-900/30 rounded-xl flex items-center justify-center">
                    <Package className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-900 dark:text-white font-mono">{s.shipmentId}</p>
                    <p className="text-xs text-gray-500">{s.source?.city} → {s.destination?.city}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-gray-500">ETA</p>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{formatDate(s.estimatedDelivery)}</p>
                  </div>
                  <Badge label={s.shipmentStatus} dot />
                  <Link href={`/client/track?id=${s.shipmentId}`}>
                    <Button variant="ghost" size="sm"><ArrowRight className="w-4 h-4" /></Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Recent Orders</h2>
          <Link href="/client/orders"><Button variant="ghost" size="sm" icon={<ArrowRight className="w-4 h-4" />}>View All</Button></Link>
        </div>
        {orders.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">No orders yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  {['Order ID', 'Items', 'Amount', 'Payment', 'Date'].map((h) => (
                    <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {orders.slice(0, 5).map((o: any) => (
                  <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                    <td className="px-3 py-2 font-mono text-xs text-brand-600 dark:text-brand-400">{o.orderId}</td>
                    <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{o.items?.length || 0} items</td>
                    <td className="px-3 py-2 font-medium text-gray-900 dark:text-white">{formatCurrency(o.totalAmount)}</td>
                    <td className="px-3 py-2"><Badge label={o.paymentStatus} /></td>
                    <td className="px-3 py-2 text-gray-500">{formatDate(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
