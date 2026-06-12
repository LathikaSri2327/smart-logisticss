'use client';
import { motion } from 'framer-motion';
import { Package, Truck, Users, CheckCircle2, Clock, DollarSign, Car, AlertTriangle } from 'lucide-react';
import { useFetch } from '@/hooks/useApi';
import { StatCard, SkeletonCard } from '@/components/ui';
import { ShipmentsAreaChart, RevenueBarChart, StatusPieChart, RevenueByTypeChart } from '@/components/charts';
import { formatCurrency } from '@/utils/helpers';
import { useAuth } from '@/hooks/useAuth';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { data, loading } = useFetch<any>('/analytics');
  const stats = data?.stats;
  const monthly = data?.monthlyData || [];
  const statusBreakdown = data?.statusBreakdown || [];
  const revenueByType = data?.revenueByType || [];
  const topDrivers = data?.topDrivers || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Good morning, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">Here&apos;s what&apos;s happening with your logistics today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {loading ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />) : (
          <>
            <StatCard title="Total Shipments" value={stats?.totalShipments ?? 0} change="+12%" positive icon={<Package className="w-5 h-5 text-blue-600" />} color="bg-blue-100 dark:bg-blue-900/30" />
            <StatCard title="In Transit" value={stats?.inTransitShipments ?? 0} change="+5%" positive icon={<Truck className="w-5 h-5 text-purple-600" />} color="bg-purple-100 dark:bg-purple-900/30" />
            <StatCard title="Delivered" value={stats?.deliveredShipments ?? 0} change="+18%" positive icon={<CheckCircle2 className="w-5 h-5 text-green-600" />} color="bg-green-100 dark:bg-green-900/30" />
            <StatCard title="Pending" value={stats?.pendingShipments ?? 0} change="-3%" icon={<Clock className="w-5 h-5 text-yellow-600" />} color="bg-yellow-100 dark:bg-yellow-900/30" />
            <StatCard title="Total Revenue" value={formatCurrency(stats?.totalRevenue ?? 0)} change="+22%" positive icon={<DollarSign className="w-5 h-5 text-emerald-600" />} color="bg-emerald-100 dark:bg-emerald-900/30" />
          </>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {loading ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />) : (
          <>
            <StatCard title="Total Clients" value={stats?.totalClients ?? 0} icon={<Users className="w-5 h-5 text-cyan-600" />} color="bg-cyan-100 dark:bg-cyan-900/30" />
            <StatCard title="Active Drivers" value={stats?.activeDrivers ?? 0} icon={<Truck className="w-5 h-5 text-indigo-600" />} color="bg-indigo-100 dark:bg-indigo-900/30" />
            <StatCard title="Vehicles" value={stats?.totalVehicles ?? 0} icon={<Car className="w-5 h-5 text-orange-600" />} color="bg-orange-100 dark:bg-orange-900/30" />
            <StatCard title="Warehouse Alerts" value={stats?.warehouseAlerts ?? 0} icon={<AlertTriangle className="w-5 h-5 text-red-600" />} color="bg-red-100 dark:bg-red-900/30" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">Shipment Overview</h2>
            <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg">This Year</span>
          </div>
          <ShipmentsAreaChart data={monthly} />
        </div>
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Status Breakdown</h2>
          <StatusPieChart data={statusBreakdown} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">Monthly Revenue</h2>
            <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg">2024</span>
          </div>
          <RevenueBarChart data={monthly} />
        </div>
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Revenue by Type</h2>
          <RevenueByTypeChart data={revenueByType} />
        </div>
      </div>

      {topDrivers.length > 0 && (
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Top Performing Drivers</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  {['Driver', 'Total Deliveries', 'On-Time', 'Success Rate', 'Rating'].map((h) => (
                    <th key={h} className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {topDrivers.map((d: any, i: number) => (
                  <motion.tr key={d.driver.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-xs font-bold text-brand-700 dark:text-brand-300">
                          {d.driver.name.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">{d.driver.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{d.totalDeliveries}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{d.onTimeDeliveries}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 max-w-24">
                          <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${d.totalDeliveries ? (d.onTimeDeliveries / d.totalDeliveries) * 100 : 0}%` }} />
                        </div>
                        <span className="text-xs text-gray-500">{d.totalDeliveries ? Math.round((d.onTimeDeliveries / d.totalDeliveries) * 100) : 0}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        <span className="text-sm font-medium">{d.rating.toFixed(1)}</span>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
