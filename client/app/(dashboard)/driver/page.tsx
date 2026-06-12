'use client';
import { motion } from 'framer-motion';
import { Truck, Package, CheckCircle2, Clock, ArrowRight, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useFetch } from '@/hooks/useApi';
import { StatCard, Badge, SkeletonCard, Button } from '@/components/ui';
import { formatDate } from '@/utils/helpers';
import { useAuth } from '@/hooks/useAuth';

export default function DriverDashboard() {
  const { user } = useAuth();
  const { data, loading } = useFetch<any[]>('/shipments/driver');
  const deliveries = data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Driver Dashboard</h1>
        <p className="text-gray-500 text-sm">Welcome, {user?.name}. Here are your active deliveries.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />) : (
          <>
            <StatCard title="Active Deliveries" value={deliveries.length} icon={<Truck className="w-5 h-5 text-blue-600" />} color="bg-blue-100 dark:bg-blue-900/30" />
            <StatCard title="Urgent" value={deliveries.filter((d: any) => d.priority === 'Urgent').length} icon={<Package className="w-5 h-5 text-red-600" />} color="bg-red-100 dark:bg-red-900/30" />
            <StatCard title="High Priority" value={deliveries.filter((d: any) => d.priority === 'High').length} icon={<Clock className="w-5 h-5 text-orange-600" />} color="bg-orange-100 dark:bg-orange-900/30" />
            <StatCard title="In Transit" value={deliveries.filter((d: any) => d.shipmentStatus === 'In Transit').length} icon={<CheckCircle2 className="w-5 h-5 text-green-600" />} color="bg-green-100 dark:bg-green-900/30" />
          </>
        )}
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Today&apos;s Deliveries</h2>
          <Link href="/driver/deliveries"><Button variant="ghost" size="sm" icon={<ArrowRight className="w-4 h-4" />}>View All</Button></Link>
        </div>
        {loading ? (
          <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />)}</div>
        ) : deliveries.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Truck className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No active deliveries assigned</p>
          </div>
        ) : (
          <div className="space-y-3">
            {deliveries.map((d: any, i: number) => (
              <motion.div key={d.id} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-mono text-sm font-bold text-brand-600 dark:text-brand-400">{d.shipmentId}</p>
                      <Badge label={d.priority} />
                      <Badge label={d.shipmentStatus} dot />
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <MapPin className="w-3 h-3" />
                      <span>{d.source?.city}</span>
                      <ArrowRight className="w-3 h-3" />
                      <span className="font-medium text-gray-700 dark:text-gray-300">{d.destination?.city}</span>
                    </div>
                    {d.client && <p className="text-xs text-gray-500 mt-1">Client: {d.client.name} · {d.client.phone}</p>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-500">ETA</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(d.estimatedDelivery)}</p>
                    <Link href={`/driver/update?id=${d.id}`} className="mt-2 inline-block">
                      <Button size="sm" variant="secondary">Update</Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
