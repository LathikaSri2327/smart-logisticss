'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Car } from 'lucide-react';
import toast from 'react-hot-toast';
import { useFetch, useApiMutation } from '@/hooks/useApi';
import { Button, Badge, Modal, Input, Select, Table, EmptyState } from '@/components/ui';
import { formatDate } from '@/utils/helpers';
import { VehicleStatus } from '@/types';

const VEHICLE_TYPES = ['Truck', 'Van', 'Motorcycle', 'Ship', 'Plane'];
const FUEL_TYPES = ['Diesel', 'Petrol', 'Electric', 'Hybrid'];
const STATUSES: VehicleStatus[] = ['Available', 'InUse', 'Maintenance', 'Inactive'];

export default function AdminVehiclesPage() {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ vehicleNumber: '', type: 'Truck', model: '', year: '', capacity: '', fuelType: 'Diesel', driverId: '' });
  const { data: vehicles, loading, refetch } = useFetch<any[]>('/vehicles');
  const { data: drivers } = useFetch<any[]>('/users?role=driver');
  const { mutate, loading: mutating } = useApiMutation();

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [k]: e.target.value });

  const handleCreate = () =>
    mutate('post', '/vehicles', { ...form, year: form.year ? parseInt(form.year) : undefined, capacity: form.capacity ? parseFloat(form.capacity) : undefined, driverId: form.driverId || undefined },
      () => { toast.success('Vehicle added'); setShowAdd(false); refetch(); },
      (e) => toast.error(e));

  const handleStatus = (id: string, status: string) =>
    mutate('patch', `/vehicles/${id}`, { status },
      () => { toast.success('Status updated'); refetch(); },
      (e) => toast.error(e));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Vehicles</h1>
          <p className="text-gray-500 text-sm">Manage your vehicle fleet</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowAdd(true)}>Add Vehicle</Button>
      </div>

      <div className="card overflow-hidden">
        <Table headers={['Vehicle', 'Type', 'Driver', 'Status', 'Location', 'Capacity', 'Last Service', 'Actions']} loading={loading}>
          {(vehicles || []).length === 0 && !loading ? (
            <tr><td colSpan={8}><EmptyState icon={<Car className="w-8 h-8" />} title="No vehicles" description="Add your first vehicle" /></td></tr>
          ) : (vehicles || []).map((v: any, i: number) => (
            <motion.tr key={v.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
              className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
              <td className="px-4 py-3">
                <p className="font-medium text-gray-900 dark:text-white">{v.vehicleNumber}</p>
                <p className="text-xs text-gray-500">{v.model} {v.year}</p>
              </td>
              <td className="px-4 py-3"><Badge label={v.type} /></td>
              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{v.driver?.name || <span className="text-gray-400">Unassigned</span>}</td>
              <td className="px-4 py-3"><Badge label={v.status} dot /></td>
              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{v.currentLocation?.address || '—'}</td>
              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{v.capacity ? `${v.capacity.toLocaleString()} kg` : '—'}</td>
              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{v.lastService ? formatDate(v.lastService) : '—'}</td>
              <td className="px-4 py-3">
                <Select value={v.status} onChange={(e) => handleStatus(v.id, e.target.value)} className="text-xs py-1 px-2 w-32">
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </Select>
              </td>
            </motion.tr>
          ))}
        </Table>
      </div>

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add New Vehicle" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Vehicle Number" placeholder="TRK-001" value={form.vehicleNumber} onChange={set('vehicleNumber')} required />
            <Select label="Type" value={form.type} onChange={set('type')}>{VEHICLE_TYPES.map((t) => <option key={t}>{t}</option>)}</Select>
            <Input label="Model" placeholder="Volvo FH16" value={form.model} onChange={set('model')} />
            <Input label="Year" type="number" placeholder="2023" value={form.year} onChange={set('year')} />
            <Input label="Capacity (kg)" type="number" placeholder="20000" value={form.capacity} onChange={set('capacity')} />
            <Select label="Fuel Type" value={form.fuelType} onChange={set('fuelType')}>{FUEL_TYPES.map((f) => <option key={f}>{f}</option>)}</Select>
          </div>
          <Select label="Assign Driver (optional)" value={form.driverId} onChange={set('driverId')}>
            <option value="">No driver</option>
            {(drivers || []).map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </Select>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={handleCreate} loading={mutating} disabled={!form.vehicleNumber}>Add Vehicle</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
