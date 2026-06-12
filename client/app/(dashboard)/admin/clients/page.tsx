'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Building2, Phone } from 'lucide-react';
import { useFetch } from '@/hooks/useApi';
import { Badge, Avatar, EmptyState, SearchBar, Table } from '@/components/ui';
import { formatDate, formatDistanceToNow } from '@/utils/helpers';

export default function AdminClientsPage() {
  const [search, setSearch] = useState('');
  const { data, loading } = useFetch<any[]>('/users?role=client');
  const clients = (data || []).filter((c: any) =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Clients</h1>
          <p className="text-gray-500 text-sm">Manage your client accounts</p>
        </div>
        <div className="flex items-center gap-2 text-sm bg-brand-50 dark:bg-brand-950/30 text-brand-700 dark:text-brand-400 px-3 py-2 rounded-xl">
          <Users className="w-4 h-4" />
          <span>{clients.length} total clients</span>
        </div>
      </div>

      <div className="card p-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Search clients by name or email..." />
      </div>

      <div className="card overflow-hidden">
        <Table headers={['Client', 'Company', 'Contact', 'Status', 'Joined', 'Last Active']} loading={loading}>
          {clients.length === 0 && !loading ? (
            <tr><td colSpan={6} className="py-12">
              <EmptyState icon={<Users className="w-8 h-8" />} title="No clients found" />
            </td></tr>
          ) : clients.map((c: any, i: number) => (
            <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
              className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar name={c.name} size="sm" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{c.name}</p>
                    <p className="text-xs text-gray-500">{c.email}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                  <Building2 className="w-3.5 h-3.5" />
                  {c.company || '—'}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                  <Phone className="w-3.5 h-3.5" />
                  {c.phone || '—'}
                </div>
              </td>
              <td className="px-4 py-3"><Badge label={c.isActive ? 'Active' : 'Inactive'} dot /></td>
              <td className="px-4 py-3 text-sm text-gray-500">{formatDate(c.createdAt)}</td>
              <td className="px-4 py-3 text-sm text-gray-500">{c.lastLogin ? formatDistanceToNow(c.lastLogin) : 'Never'}</td>
            </motion.tr>
          ))}
        </Table>
      </div>
    </div>
  );
}
