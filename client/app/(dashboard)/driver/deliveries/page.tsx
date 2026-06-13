'use client';
import { motion } from 'framer-motion';
import { ClipboardList, MapPin, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useFetch, useApiMutation } from '@/hooks/useApi';
import { Badge, EmptyState, Button } from '@/components/ui';
import { formatDate } from '@/utils/helpers';

export default function DriverDeliveriesPage() {
  const { data, loading, refetch } = useFetch<any[]>('/shipments/driver');
  const { mutate, loading: mutating } = useApiMutation();
  const deliveries = data || [];

  const handleAccept = (id: string) => {
    mutate('patch', `/shipments/${id}`, { driverAcceptance: 'Accepted' },
      () => { toast.success('Delivery accepted!'); refetch(); },
      (e) => toast.error(e));
  };

  const handleReject = (id: string) => {
    mutate('patch', `/shipments/${id}`, { driverAcceptance: 'Rejected' },
      () => { toast.success('Delivery rejected'); refetch(); },
      (e) => toast.error(e));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Deliveries</h1>
        <p className="text-gray-500 text-sm">All assigned shipments requiring your attention</p>
      </div>

      {loading ? (
        <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="card p-5 h-28 animate-pulse" />)}</div>
      ) : deliveries.length === 0 ? (
        <div className="card p-12">
          <EmptyState icon={<ClipboardList className="w-8 h-8" />} title="No deliveries" description="No active deliveries assigned to you." />
        </div>
      ) : (
        <div className="space-y-4">
          {deliveries.map((d: any, i: number) => (
            <motion.div key={d.id} className="card p-5 hover:shadow-md transition-shadow"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="font-mono font-bold text-brand-600 dark:text-brand-400">{d.shipmentId}</span>
                    <Badge label={d.shipmentStatus} dot />
                    <Badge label={d.priority} />
                    <Badge label={d.shipmentType} />
                    {d.driverAcceptance && (
                      <Badge 
                        label={d.driverAcceptance} 
                        dot 
                        className={d.driverAcceptance === 'Accepted' ? 'bg-green-100 text-green-700' : d.driverAcceptance === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'} 
                      />
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <div>
                        <p className="text-xs text-gray-500">Pickup</p>
                        <p className="font-medium text-gray-900 dark:text-white">{d.source?.city}, {d.source?.country}</p>
                        <p className="text-xs text-gray-500 truncate">{d.source?.address}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                      <div>
                        <p className="text-xs text-gray-500">Delivery</p>
                        <p className="font-medium text-gray-900 dark:text-white">{d.destination?.city}, {d.destination?.country}</p>
                        <p className="text-xs text-gray-500 truncate">{d.destination?.address}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Client</p>
                      <p className="font-medium text-gray-900 dark:text-white">{d.client?.name}</p>
                      <p className="text-xs text-gray-500">{d.client?.phone}</p>
                    </div>
                  </div>
                  {d.notes && <p className="mt-2 text-xs text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-1.5">{d.notes}</p>}
                </div>
                <div className="flex flex-col items-end gap-3 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-xs text-gray-500">ETA</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{formatDate(d.estimatedDelivery)}</p>
                  </div>
                  {d.vehicle && (
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Vehicle</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{d.vehicle.vehicleNumber}</p>
                    </div>
                  )}
                  <div className="flex gap-2 flex-wrap">
                    {(!d.driverAcceptance || d.driverAcceptance === 'Pending') && (
                      <>
                        <Button size="sm" variant="secondary" icon={<CheckCircle className="w-4 h-4" />} onClick={() => handleAccept(d.id)} loading={mutating}>Accept</Button>
                        <Button size="sm" variant="secondary" icon={<XCircle className="w-4 h-4" />} onClick={() => handleReject(d.id)} loading={mutating} className="bg-red-50 hover:bg-red-100 text-red-600">Reject</Button>
                      </>
                    )}
                    {d.driverAcceptance === 'Accepted' && (
                      <>
                        <Link href={`/driver/route?id=${d.id}`}>
                          <Button variant="secondary" size="sm" icon={<MapPin className="w-4 h-4" />}>Route</Button>
                        </Link>
                        <Link href={`/driver/update?id=${d.id}`}>
                          <Button size="sm" icon={<ArrowRight className="w-4 h-4" />}>Update</Button>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}\n        </div>
      )}
    </div>
  );
}
