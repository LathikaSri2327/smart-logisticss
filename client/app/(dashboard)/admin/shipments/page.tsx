'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Download, Package, Edit2, Trash2, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useFetch, useApiMutation } from '@/hooks/useApi';
import { Button, Badge, Modal, Input, Select, SearchBar, Table, Pagination, EmptyState } from '@/components/ui';
import { formatDate, formatCurrency, generateCSV } from '@/utils/helpers';
import { Shipment, ShipmentStatus } from '@/types';

const STATUSES: ShipmentStatus[] = ['Pending', 'Packed', 'In Transit', 'Customs Clearance', 'Out for Delivery', 'Delivered', 'Cancelled'];

export default function AdminShipmentsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const [selected, setSelected] = useState<Shipment | null>(null);
  const [assignData, setAssignData] = useState({ driverId: '', vehicleId: '' });
  const [statusData, setStatusData] = useState({ status: '', location: '', note: '' });
  const [createForm, setCreateForm] = useState({
    clientId: '', sourceAddress: '', sourceCity: '', sourceCountry: '',
    destAddress: '', destCity: '', destCountry: '',
    shipmentType: 'Standard', priority: 'Normal', weight: '', value: '', description: '', estimatedDelivery: '',
  });

  const params = new URLSearchParams({ page: String(page), limit: '10', ...(statusFilter && { status: statusFilter }), ...(search && { search }) }).toString();
  const { data, loading, refetch } = useFetch<any>(`/shipments?${params}`);
  const { data: clients } = useFetch<any[]>('/users?role=client');
  const { data: drivers } = useFetch<any[]>('/users?role=driver');
  const { data: vehicles } = useFetch<any[]>('/vehicles');
  const { mutate, loading: mutating } = useApiMutation();

  const shipments: Shipment[] = data?.shipments || [];
  const totalPages = data?.totalPages || 1;

  const handleCreate = () =>
    mutate('post', '/shipments', {
      clientId: createForm.clientId,
      source: { address: createForm.sourceAddress, city: createForm.sourceCity, country: createForm.sourceCountry },
      destination: { address: createForm.destAddress, city: createForm.destCity, country: createForm.destCountry },
      shipmentType: createForm.shipmentType, priority: createForm.priority,
      weight: parseFloat(createForm.weight) || undefined, value: parseFloat(createForm.value) || undefined,
      description: createForm.description, estimatedDelivery: createForm.estimatedDelivery || undefined,
    }, () => { toast.success('Shipment created'); setShowCreate(false); refetch(); },
    (e) => toast.error(e));

  const handleAssign = () =>
    mutate('patch', `/shipments/${selected!.id}`, { _action: 'assign', driverId: assignData.driverId, vehicleId: assignData.vehicleId || undefined },
      () => { toast.success('Driver assigned'); setShowAssign(false); refetch(); },
      (e) => toast.error(e));

  const handleStatus = () =>
    mutate('patch', `/shipments/${selected!.id}`, { _action: 'status', status: statusData.status, location: statusData.location, note: statusData.note },
      () => { toast.success('Status updated'); setShowStatus(false); refetch(); },
      (e) => toast.error(e));

  const handleDelete = (id: string) =>
    mutate('delete', `/shipments/${id}`, undefined,
      () => { toast.success('Shipment deleted'); refetch(); },
      (e) => toast.error(e));

  const handleExportCSV = () => {
    const rows = shipments.map((s) => ({
      ID: s.shipmentId, Client: s.client?.name, Status: s.shipmentStatus,
      Type: s.shipmentType, From: s.source?.city, To: s.destination?.city,
      Value: s.value, Created: formatDate(s.createdAt),
    }));
    generateCSV(rows, 'shipments');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Shipments</h1>
          <p className="text-gray-500 text-sm">Manage and track all shipments</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={<Download className="w-4 h-4" />} onClick={handleExportCSV}>Export CSV</Button>
          <Button size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setShowCreate(true)}>New Shipment</Button>
        </div>
      </div>

      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search by ID or description..." />
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="input sm:w-48">
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        <Table headers={['Shipment ID', 'Client', 'Route', 'Status', 'Type', 'Value', 'ETA', 'Actions']} loading={loading}>
          {shipments.length === 0 && !loading ? (
            <tr><td colSpan={8} className="text-center py-12 text-gray-500">No shipments found</td></tr>
          ) : shipments.map((s, i) => (
            <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
              className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
              <td className="px-4 py-3"><span className="font-mono text-xs font-medium text-brand-600 dark:text-brand-400">{s.shipmentId}</span></td>
              <td className="px-4 py-3">
                <p className="font-medium text-gray-900 dark:text-white text-sm">{s.client?.name}</p>
                <p className="text-xs text-gray-500">{s.client?.company}</p>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                <span>{s.source?.city}</span><span className="mx-1 text-gray-400">→</span><span>{s.destination?.city}</span>
              </td>
              <td className="px-4 py-3"><Badge label={s.shipmentStatus} dot /></td>
              <td className="px-4 py-3"><Badge label={s.shipmentType} /></td>
              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{formatCurrency(s.value)}</td>
              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{formatDate(s.estimatedDelivery)}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                  <button onClick={() => { setSelected(s); setShowAssign(true); setAssignData({ driverId: s.driver?.id || '', vehicleId: s.vehicle?.id || '' }); }}
                    className="p-1.5 hover:bg-brand-100 dark:hover:bg-brand-900/30 rounded-lg text-gray-500 hover:text-brand-600 transition-colors" title="Assign Driver">
                    <UserCheck className="w-4 h-4" />
                  </button>
                  <button onClick={() => { setSelected(s); setShowStatus(true); setStatusData({ status: s.shipmentStatus, location: '', note: '' }); }}
                    className="p-1.5 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 rounded-lg text-gray-500 hover:text-yellow-600 transition-colors" title="Update Status">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => { if (confirm('Delete this shipment?')) handleDelete(s.id); }}
                    className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg text-gray-500 hover:text-red-600 transition-colors" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </motion.tr>
          ))}
        </Table>
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create New Shipment" size="xl">
        <div className="space-y-4">
          <Select label="Client" value={createForm.clientId} onChange={(e) => setCreateForm({ ...createForm, clientId: e.target.value })}>
            <option value="">Select client</option>
            {clients?.map((u: any) => <option key={u.id} value={u.id}>{u.name} — {u.company}</option>)}
          </Select>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Origin</p>
              <Input placeholder="Address" value={createForm.sourceAddress} onChange={(e) => setCreateForm({ ...createForm, sourceAddress: e.target.value })} />
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="City" value={createForm.sourceCity} onChange={(e) => setCreateForm({ ...createForm, sourceCity: e.target.value })} />
                <Input placeholder="Country" value={createForm.sourceCountry} onChange={(e) => setCreateForm({ ...createForm, sourceCountry: e.target.value })} />
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Destination</p>
              <Input placeholder="Address" value={createForm.destAddress} onChange={(e) => setCreateForm({ ...createForm, destAddress: e.target.value })} />
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="City" value={createForm.destCity} onChange={(e) => setCreateForm({ ...createForm, destCity: e.target.value })} />
                <Input placeholder="Country" value={createForm.destCountry} onChange={(e) => setCreateForm({ ...createForm, destCountry: e.target.value })} />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Type" value={createForm.shipmentType} onChange={(e) => setCreateForm({ ...createForm, shipmentType: e.target.value })}>
              {['Standard', 'Express', 'Freight', 'Cold Chain'].map((t) => <option key={t}>{t}</option>)}
            </Select>
            <Select label="Priority" value={createForm.priority} onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value })}>
              {['Low', 'Normal', 'High', 'Urgent'].map((p) => <option key={p}>{p}</option>)}
            </Select>
            <Input label="Weight (kg)" type="number" placeholder="500" value={createForm.weight} onChange={(e) => setCreateForm({ ...createForm, weight: e.target.value })} />
            <Input label="Value ($)" type="number" placeholder="5000" value={createForm.value} onChange={(e) => setCreateForm({ ...createForm, value: e.target.value })} />
          </div>
          <Input label="Description" placeholder="Shipment contents..." value={createForm.description} onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })} />
          <Input label="Estimated Delivery" type="date" value={createForm.estimatedDelivery} onChange={(e) => setCreateForm({ ...createForm, estimatedDelivery: e.target.value })} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} loading={mutating} disabled={!createForm.clientId}>Create Shipment</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showAssign} onClose={() => setShowAssign(false)} title={`Assign Driver — ${selected?.shipmentId}`}>
        <div className="space-y-4">
          <Select label="Driver" value={assignData.driverId} onChange={(e) => setAssignData({ ...assignData, driverId: e.target.value })}>
            <option value="">Select driver</option>
            {drivers?.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </Select>
          <Select label="Vehicle" value={assignData.vehicleId} onChange={(e) => setAssignData({ ...assignData, vehicleId: e.target.value })}>
            <option value="">Select vehicle</option>
            {vehicles?.map((v: any) => <option key={v.id} value={v.id}>{v.vehicleNumber} — {v.type} {v.model}</option>)}
          </Select>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowAssign(false)}>Cancel</Button>
            <Button onClick={handleAssign} loading={mutating} disabled={!assignData.driverId}>Assign Driver</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showStatus} onClose={() => setShowStatus(false)} title={`Update Status — ${selected?.shipmentId}`}>
        <div className="space-y-4">
          <Select label="New Status" value={statusData.status} onChange={(e) => setStatusData({ ...statusData, status: e.target.value })}>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
          <Input label="Current Location" placeholder="e.g. Indianapolis, IN" value={statusData.location} onChange={(e) => setStatusData({ ...statusData, location: e.target.value })} />
          <Input label="Note" placeholder="Optional note..." value={statusData.note} onChange={(e) => setStatusData({ ...statusData, note: e.target.value })} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowStatus(false)}>Cancel</Button>
            <Button onClick={handleStatus} loading={mutating}>Update Status</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
