'use client';
import { BarChart3, TrendingUp, Package, DollarSign } from 'lucide-react';
import { useFetch } from '@/hooks/useApi';
import { ShipmentsAreaChart, RevenueBarChart, StatusPieChart, RevenueByTypeChart } from '@/components/charts';
import { SkeletonCard, StatCard } from '@/components/ui';
import { formatCurrency } from '@/utils/helpers';

export default function AdminAnalyticsPage() {
  const { data, loading } = useFetch<any>('/analytics');
  const stats = data?.stats;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        <p className="text-gray-500 text-sm">Detailed performance metrics and insights</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />) : (
          <>
            <StatCard title="Total Shipments" value={stats?.totalShipments ?? 0} change="+12%" positive icon={<Package className="w-5 h-5 text-blue-600" />} color="bg-blue-100 dark:bg-blue-900/30" />
            <StatCard title="Delivered" value={stats?.deliveredShipments ?? 0} change="+18%" positive icon={<TrendingUp className="w-5 h-5 text-green-600" />} color="bg-green-100 dark:bg-green-900/30" />
            <StatCard title="Revenue" value={formatCurrency(stats?.totalRevenue ?? 0)} change="+22%" positive icon={<DollarSign className="w-5 h-5 text-emerald-600" />} color="bg-emerald-100 dark:bg-emerald-900/30" />
            <StatCard title="Active Drivers" value={stats?.activeDrivers ?? 0} icon={<BarChart3 className="w-5 h-5 text-purple-600" />} color="bg-purple-100 dark:bg-purple-900/30" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Shipment Trends</h2>
          <ShipmentsAreaChart data={data?.monthlyData || []} />
        </div>
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Revenue Trend</h2>
          <RevenueBarChart data={data?.monthlyData || []} />
        </div>
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Shipment Status Distribution</h2>
          <StatusPieChart data={data?.statusBreakdown || []} />
        </div>
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Shipments by Type</h2>
          <RevenueByTypeChart data={data?.revenueByType || []} />
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">🤖 AI Insights</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { title: 'Delivery Success Rate', value: stats ? `${Math.round((stats.deliveredShipments / Math.max(stats.totalShipments, 1)) * 100)}%` : '—', desc: 'Based on completed shipments', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
            { title: 'Avg Revenue/Shipment', value: stats ? formatCurrency(stats.totalRevenue / Math.max(stats.totalShipments, 1)) : '—', desc: 'Per shipment average', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
            { title: 'Pending Backlog', value: stats?.pendingShipments ?? '—', desc: 'Shipments awaiting processing', color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
            { title: 'Fleet Utilization', value: stats ? `${Math.min(100, Math.round((stats.inTransitShipments / Math.max(stats.totalVehicles, 1)) * 100))}%` : '—', desc: 'Vehicles actively delivering', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
            { title: 'Warehouse Alerts', value: stats?.warehouseAlerts ?? 0, desc: 'Require immediate attention', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
            { title: 'Client Retention', value: stats?.totalClients ? `${stats.totalClients} active` : '—', desc: 'Active client accounts', color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
          ].map((insight) => (
            <div key={insight.title} className={`${insight.bg} rounded-xl p-4`}>
              <p className="text-sm text-gray-500 mb-1">{insight.title}</p>
              <p className={`text-2xl font-bold ${insight.color}`}>{insight.value}</p>
              <p className="text-xs text-gray-500 mt-1">{insight.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
