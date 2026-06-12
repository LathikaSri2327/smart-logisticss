'use client';
import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, MapPin, Camera, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { useFetch, useApiMutation } from '@/hooks/useApi';
import { Button, Select, Input, Badge } from '@/components/ui';
import { ShipmentStatus } from '@/types';

const DRIVER_STATUSES: ShipmentStatus[] = ['Packed', 'In Transit', 'Customs Clearance', 'Out for Delivery', 'Delivered'];

function UpdateContent() {
  const searchParams = useSearchParams();
  const id = searchParams?.get('id') || '';
  const [status, setStatus] = useState('');
  const [location, setLocation] = useState('');
  const [note, setNote] = useState('');
  const [proofUrl, setProofUrl] = useState('');

  const { data: shipment, loading, refetch } = useFetch<any>(id ? `/shipments/${id}` : null);
  const { mutate, loading: updating } = useApiMutation();

  const handleUpdate = () => {
    if (!status) return toast.error('Please select a status');
    mutate('patch', `/shipments/${id}`, { _action: 'status', status, location: location || undefined, note: note || undefined },
      () => { toast.success('Status updated successfully!'); refetch(); },
      (e) => toast.error(e));
  };

  const handleProof = () => {
    if (!proofUrl) return toast.error('Please enter image URL');
    mutate('patch', `/shipments/${id}`, { _action: 'proof', imageUrl: proofUrl },
      () => { toast.success('Proof of delivery uploaded!'); refetch(); },
      (e) => toast.error(e));
  };

  if (!id) return <div className="card p-8 text-center text-gray-500">No shipment selected. Go to Deliveries and click Update.</div>;
  if (loading) return <div className="card p-8 animate-pulse h-64" />;
  if (!shipment) return <div className="card p-8 text-center text-red-500">Shipment not found.</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Update Delivery</h1>
        <p className="text-gray-500 text-sm">Shipment: <span className="font-mono text-brand-600 dark:text-brand-400">{shipment.shipmentId}</span></p>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Current Status</h2>
          <Badge label={shipment.shipmentStatus} dot />
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-gray-500">Pickup</p>
            <p className="font-medium text-gray-900 dark:text-white">{shipment.source?.city}, {shipment.source?.country}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Delivery</p>
            <p className="font-medium text-gray-900 dark:text-white">{shipment.destination?.city}, {shipment.destination?.country}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Client</p>
            <p className="font-medium text-gray-900 dark:text-white">{shipment.client?.name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Client Phone</p>
            <p className="font-medium text-gray-900 dark:text-white">{shipment.client?.phone || '—'}</p>
          </div>
        </div>
      </div>

      <motion.div className="card p-6 space-y-4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-brand-600" /> Update Status
        </h2>
        <Select label="New Status" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Select status...</option>
          {DRIVER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </Select>
        <Input label="Current Location" placeholder="e.g. Indianapolis, IN" value={location}
          onChange={(e) => setLocation(e.target.value)} icon={<MapPin className="w-4 h-4" />} />
        <Input label="Note (optional)" placeholder="Add delivery note..." value={note} onChange={(e) => setNote(e.target.value)} />
        <Button onClick={handleUpdate} loading={updating} icon={<CheckCircle2 className="w-4 h-4" />} disabled={!status}>
          Update Status
        </Button>
      </motion.div>

      {(shipment.shipmentStatus === 'Out for Delivery' || status === 'Delivered') && (
        <motion.div className="card p-6 space-y-4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Camera className="w-5 h-5 text-brand-600" /> Proof of Delivery
          </h2>
          <p className="text-sm text-gray-500">Upload a photo as proof of delivery</p>
          <Input label="Image URL" placeholder="https://... (paste image URL)" value={proofUrl}
            onChange={(e) => setProofUrl(e.target.value)} icon={<Upload className="w-4 h-4" />} />
          {proofUrl && <img src={proofUrl} alt="Proof preview" className="w-full h-48 object-cover rounded-xl" onError={(e) => (e.currentTarget.style.display = 'none')} />}
          <Button variant="secondary" onClick={handleProof} loading={updating} disabled={!proofUrl}>
            Upload Proof of Delivery
          </Button>
        </motion.div>
      )}
    </div>
  );
}

export default function DriverUpdatePage() {
  return <Suspense fallback={<div className="animate-pulse h-96 card" />}><UpdateContent /></Suspense>;
}
