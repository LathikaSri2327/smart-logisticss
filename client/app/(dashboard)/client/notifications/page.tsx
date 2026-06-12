'use client';
import { motion } from 'framer-motion';
import { Bell, BellOff, Package, Truck, Warehouse, CreditCard, Settings } from 'lucide-react';
import { useFetch, useApiMutation } from '@/hooks/useApi';
import { Button, EmptyState } from '@/components/ui';
import { formatDistanceToNow } from '@/utils/helpers';

const typeIcon: Record<string, React.ReactNode> = {
  shipment: <Package className="w-4 h-4" />, delivery: <Truck className="w-4 h-4" />,
  warehouse: <Warehouse className="w-4 h-4" />, payment: <CreditCard className="w-4 h-4" />,
  system: <Settings className="w-4 h-4" />,
};
const typeColor: Record<string, string> = {
  shipment: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600', delivery: 'bg-green-100 dark:bg-green-900/30 text-green-600',
  warehouse: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600', payment: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600',
  system: 'bg-gray-100 dark:bg-gray-800 text-gray-600',
};

export default function ClientNotificationsPage() {
  const { data, loading, refetch } = useFetch<any>('/notifications');
  const { mutate } = useApiMutation();

  const notifications = data?.notifications || [];
  const unread = data?.unreadCount || 0;

  const markOne = (id: string) => mutate('patch', `/notifications/${id}`, {}, () => refetch());
  const markAll = () => mutate('patch', '/notifications', {}, () => refetch());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p className="text-gray-500 text-sm">{unread > 0 ? `${unread} unread notification${unread > 1 ? 's' : ''}` : 'All caught up!'}</p>
        </div>
        {unread > 0 && <Button variant="secondary" size="sm" onClick={markAll}>Mark all as read</Button>}
      </div>

      <div className="card divide-y divide-gray-100 dark:divide-gray-800 overflow-hidden">
        {loading ? Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-4 animate-pulse flex gap-4">
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl" />
            <div className="flex-1 space-y-2"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" /><div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" /></div>
          </div>
        )) : notifications.length === 0 ? (
          <div className="p-12">
            <EmptyState icon={<BellOff className="w-8 h-8" />} title="No notifications" description="You're all caught up! Notifications will appear here." />
          </div>
        ) : notifications.map((n: any, i: number) => (
          <motion.div key={n.id} className={`p-4 flex items-start gap-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${!n.readStatus ? 'bg-brand-50/40 dark:bg-brand-950/10' : ''}`}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
            onClick={() => !n.readStatus && markOne(n.id)}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${typeColor[n.type] || typeColor.system}`}>
              {typeIcon[n.type] || typeIcon.system}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className={`text-sm font-medium ${!n.readStatus ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>{n.title}</p>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-gray-400">{formatDistanceToNow(n.createdAt)}</span>
                  {!n.readStatus && <div className="w-2 h-2 bg-brand-500 rounded-full" />}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
