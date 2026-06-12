'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Truck, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { useFetch, useApiMutation } from '@/hooks/useApi';
import { Button, Badge, Modal, Input, Avatar, EmptyState, Table } from '@/components/ui';
import { formatDate, formatDistanceToNow } from '@/utils/helpers';

export default function AdminDriversPage() {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: 'password123', phone: '', role: 'driver' });
  const { data, loading, refetch } = useFetch<any[]>('/users?role=driver');
  const { mutate, loading: creating } = useApiMutation();

  const drivers = data || [];
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  const handleAdd = () =>
    mutate('post', '/auth/register', form,
      () => { toast.success('Driver added'); setShowAdd(false); refetch(); },
      (e) => toast.error(e));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Drivers</h1>
          <p className="text-gray-500 text-sm">Manage your driver fleet</p>
        </div>
        <Button icon={<UserPlus className="w-4 h-4" />} onClick={() => setShowAdd(true)}>Add Driver</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Drivers', value: drivers.length, color: 'text-blue-600' },
          { label: 'Active', value: drivers.filter((d: any) => d.isActive).length, color: 'text-green-600' },
          { label: 'Inactive', value: drivers.filter((d: any) => !d.isActive).length, color: 'text-red-600' },
          { label: 'Avg. Rating', value: '4.7★', color: 'text-yellow-600' },
        ].map((s) => (
          <div key={s.label} className="card p-4">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-sm text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-5 animate-pulse space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
                <div className="space-y-2 flex-1"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" /><div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" /></div>
              </div>
            </div>
          ))}
        </div>
      ) : drivers.length === 0 ? (
        <div className="card p-12">
          <EmptyState icon={<Truck className="w-8 h-8" />} title="No drivers yet" description="Add your first driver to get started" action={<Button onClick={() => setShowAdd(true)}>Add Driver</Button>} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {drivers.map((d: any, i: number) => (
            <motion.div key={d.id} className="card p-5 hover:shadow-md transition-shadow" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar name={d.name} size="lg" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{d.name}</p>
                    <p className="text-xs text-gray-500">{d.email}</p>
                  </div>
                </div>
                <Badge label={d.isActive ? 'Active' : 'Inactive'} dot />
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Phone</span><span className="text-gray-900 dark:text-white">{d.phone || '—'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Last Login</span><span className="text-gray-900 dark:text-white">{d.lastLogin ? formatDistanceToNow(d.lastLogin) : 'Never'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Joined</span><span className="text-gray-900 dark:text-white">{formatDate(d.createdAt)}</span></div>
              </div>
              <div className="mt-4 flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => <Star key={s} className={`w-4 h-4 ${s <= 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />)}
                <span className="text-xs text-gray-500 ml-1">4.7</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add New Driver">
        <div className="space-y-4">
          <Input label="Full Name" placeholder="John Driver" value={form.name} onChange={set('name')} required />
          <Input label="Email" type="email" placeholder="driver@logistics.com" value={form.email} onChange={set('email')} required />
          <Input label="Phone" placeholder="+1 555 0200" value={form.phone} onChange={set('phone')} />
          <Input label="Temporary Password" type="password" value={form.password} onChange={set('password')} required />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={handleAdd} loading={creating}>Add Driver</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
