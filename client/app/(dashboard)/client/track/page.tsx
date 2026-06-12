'use client';
import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, MapPin, Package, CheckCircle2, Truck, Clock, AlertCircle } from 'lucide-react';
import { Button, Input, Badge } from '@/components/ui';
import { formatDate, formatDateTime } from '@/utils/helpers';
import { api } from '@/lib/api';

const statusSteps = ['Pending', 'Packed', 'In Transit', 'Customs Clearance', 'Out for Delivery', 'Delivered'];

const stepIcon = (step: string) => {
  const icons: Record<string, React.ReactNode> = {
    Pending: <Clock className="w-4 h-4" />, Packed: <Package className="w-4 h-4" />,
    'In Transit': <Truck className="w-4 h-4" />, 'Customs Clearance': <AlertCircle className="w-4 h-4" />,
    'Out for Delivery': <MapPin className="w-4 h-4" />, Delivered: <CheckCircle2 className="w-4 h-4" />,
  };
  return icons[step] || <Clock className="w-4 h-4" />;
};

function TrackContent() {
  const searchParams = useSearchParams();
  const [trackId, setTrackId] = useState(searchParams?.get('id') || '');
  const [shipment, setShipment] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleTrack = async () => {
    if (!trackId.trim()) return;
    setLoading(true);
    setError(false);
    try {
      const data = await api.get<any>(`/shipments/${trackId.trim()}?action=track`);
      setShipment(data);
      if (!data) setError(true);
    } catch {
      setError(true);
      setShipment(null);
    } finally {
      setLoading(false);
    }
  };

  const currentStep = shipment ? statusSteps.indexOf(shipment.shipmentStatus) : -1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Track Shipment</h1>
        <p className="text-gray-500 text-sm">Enter your shipment ID for real-time updates</p>
      </div>

      <div className="card p-6">
        <div className="flex gap-3">
          <Input placeholder="Enter Shipment ID (e.g. SHP-1234567890-AB12)" value={trackId}
            onChange={(e) => setTrackId(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
            icon={<Package className="w-4 h-4" />} className="flex-1" />
          <Button onClick={handleTrack} loading={loading} icon={<Search className="w-4 h-4" />}>Track</Button>
        </div>
      </div>

      {error && <div className="card p-6 text-center text-red-500">Shipment not found. Check your ID and try again.</div>}

      {shipment && (
        <motion.div className="space-y-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="card p-6">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
              <div>
                <p className="text-xs text-gray-500 mb-1">Shipment ID</p>
                <p className="font-mono font-bold text-xl text-gray-900 dark:text-white">{shipment.shipmentId}</p>
              </div>
              <Badge label={shipment.shipmentStatus} dot />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-500 mb-1">From</p>
                <p className="font-medium text-gray-900 dark:text-white">{shipment.source?.city}</p>
                <p className="text-xs text-gray-500">{shipment.source?.country}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">To</p>
                <p className="font-medium text-gray-900 dark:text-white">{shipment.destination?.city}</p>
                <p className="text-xs text-gray-500">{shipment.destination?.country}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Est. Delivery</p>
                <p className="font-medium text-gray-900 dark:text-white">{formatDate(shipment.estimatedDelivery)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Driver</p>
                <p className="font-medium text-gray-900 dark:text-white">{shipment.driver?.name || 'Unassigned'}</p>
                {shipment.driver?.phone && <p className="text-xs text-gray-500">{shipment.driver.phone}</p>}
              </div>
            </div>
          </div>

          {shipment.shipmentStatus !== 'Cancelled' && (
            <div className="card p-6">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-6">Delivery Progress</h2>
              <div className="relative">
                <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200 dark:bg-gray-700 z-0">
                  <div className="h-full bg-brand-500 transition-all duration-700" style={{ width: `${currentStep >= 0 ? (currentStep / (statusSteps.length - 1)) * 100 : 0}%` }} />
                </div>
                <div className="relative z-10 flex justify-between">
                  {statusSteps.map((step, i) => {
                    const done = i <= currentStep;
                    const active = i === currentStep;
                    return (
                      <div key={step} className="flex flex-col items-center gap-2">
                        <motion.div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${done ? 'bg-brand-600 border-brand-600 text-white' : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-400'} ${active ? 'ring-4 ring-brand-200 dark:ring-brand-900' : ''}`}
                          animate={active ? { scale: [1, 1.1, 1] } : {}} transition={{ duration: 1, repeat: Infinity }}>
                          {stepIcon(step)}
                        </motion.div>
                        <p className={`text-xs font-medium text-center max-w-16 leading-tight ${done ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400'}`}>{step}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Shipment Timeline</h2>
            <div className="space-y-4">
              {[...(shipment.shipmentHistory || [])].reverse().map((h: any, i: number) => (
                <motion.div key={i} className="flex gap-4" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${i === 0 ? 'bg-brand-600 ring-4 ring-brand-100 dark:ring-brand-900' : 'bg-gray-300 dark:bg-gray-600'}`} />
                    {i < (shipment.shipmentHistory?.length || 0) - 1 && <div className="w-0.5 flex-1 bg-gray-200 dark:bg-gray-700 mt-1 min-h-6" />}
                  </div>
                  <div className="pb-4 flex-1">
                    <p className="font-medium text-sm text-gray-900 dark:text-white">{h.status}</p>
                    {h.location && <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{h.location}</p>}
                    {h.note && <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{h.note}</p>}
                    <p className="text-xs text-gray-400 mt-1">{formatDateTime(h.timestamp)}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {shipment.qrCode && (
            <div className="card p-6 flex flex-col items-center gap-3">
              <h2 className="font-semibold text-gray-900 dark:text-white">Shipment QR Code</h2>
              <img src={shipment.qrCode} alt="QR Code" className="w-48 h-48" />
              <p className="text-xs text-gray-500">Scan to verify delivery</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

export default function ClientTrackPage() {
  return <Suspense fallback={<div className="animate-pulse h-96 card" />}><TrackContent /></Suspense>;
}
