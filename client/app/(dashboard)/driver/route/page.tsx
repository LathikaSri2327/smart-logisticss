'use client';
import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Locate, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useFetch, useApiMutation } from '@/hooks/useApi';
import { Button, Badge } from '@/components/ui';
import { formatDate } from '@/utils/helpers';

function RouteContent() {
  const searchParams = useSearchParams();
  const id = searchParams?.get('id') || '';
  const [isTracking, setIsTracking] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const { data: shipment } = useFetch<any>(id ? `/shipments/${id}` : null);
  const { data: vehicles } = useFetch<any[]>('/vehicles');
  const { mutate } = useApiMutation();

  const startTracking = () => {
    if (!navigator.geolocation) return toast.error('Geolocation not supported');
    setIsTracking(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setCoords({ lat, lng });
        const vehicle = vehicles?.[0];
        if (vehicle) {
          mutate('patch', `/vehicles/${vehicle.id}`, { _action: 'location', lat, lng, address: `${lat.toFixed(4)}, ${lng.toFixed(4)}` },
            () => toast.success('Location updated!'),
            (e) => toast.error(e));
        }
        setIsTracking(false);
      },
      () => { toast.error('Could not get location'); setIsTracking(false); }
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Route Tracking</h1>
        <p className="text-gray-500 text-sm">View route and update your live location</p>
      </div>

      {shipment && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono font-bold text-brand-600 dark:text-brand-400">{shipment.shipmentId}</span>
            <Badge label={shipment.shipmentStatus} dot />
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <div>
                <p className="text-xs text-gray-500">Origin</p>
                <p className="font-medium">{shipment.source?.address}</p>
                <p className="text-xs text-gray-500">{shipment.source?.city}, {shipment.source?.country}</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <div>
                <p className="text-xs text-gray-500">Destination</p>
                <p className="font-medium">{shipment.destination?.address}</p>
                <p className="text-xs text-gray-500">{shipment.destination?.city}, {shipment.destination?.country}</p>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 text-sm">
            <span className="text-gray-500">ETA: </span>
            <span className="font-medium text-gray-900 dark:text-white">{formatDate(shipment.estimatedDelivery)}</span>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="relative h-72 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-brand-100 dark:bg-brand-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <MapPin className="w-8 h-8 text-brand-600" />
            </div>
            <p className="font-medium text-gray-700 dark:text-gray-300">Google Maps Integration</p>
            <p className="text-sm text-gray-500 mt-1">Set NEXT_PUBLIC_GOOGLE_MAPS_KEY in .env</p>
            {coords && (
              <div className="mt-3 bg-white dark:bg-gray-800 rounded-xl px-4 py-2 inline-block">
                <p className="text-xs font-mono text-gray-700 dark:text-gray-300">{coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}</p>
              </div>
            )}
          </div>
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>
        <div className="p-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-800">
          <div>
            {coords ? (
              <p className="text-sm text-green-600 dark:text-green-400 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse inline-block" /> Live location active
              </p>
            ) : (
              <p className="text-sm text-gray-500">Location not shared yet</p>
            )}
          </div>
          <Button onClick={startTracking} loading={isTracking} icon={<Locate className="w-4 h-4" />} size="sm">
            {coords ? 'Update Location' : 'Share Location'}
          </Button>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <Navigation className="w-5 h-5 text-brand-600" /> Navigation Tips
        </h2>
        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li className="flex items-center gap-2"><span className="w-5 h-5 bg-brand-100 dark:bg-brand-900/30 text-brand-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>Click &quot;Share Location&quot; to broadcast your live position</li>
          <li className="flex items-center gap-2"><span className="w-5 h-5 bg-brand-100 dark:bg-brand-900/30 text-brand-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>Update location every 30 minutes while in transit</li>
          <li className="flex items-center gap-2"><span className="w-5 h-5 bg-brand-100 dark:bg-brand-900/30 text-brand-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>Call the client at the listed number before delivery</li>
          <li className="flex items-center gap-2"><span className="w-5 h-5 bg-brand-100 dark:bg-brand-900/30 text-brand-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">4</span>Upload proof of delivery photo after completing the delivery</li>
        </ul>
      </div>
    </div>
  );
}

export default function DriverRoutePage() {
  return <Suspense fallback={<div className="animate-pulse h-96 card" />}><RouteContent /></Suspense>;
}
