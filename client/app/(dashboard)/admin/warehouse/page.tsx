'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Warehouse, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useFetch, useApiMutation } from '@/hooks/useApi';
import { Button, Badge, Modal, Input, Select, EmptyState } from '@/components/ui';
import { Warehouse as WarehouseType, StockItem } from '@/types';

export default function AdminWarehousePage() {
  const [showCreate, setShowCreate] = useState(false);
  const [showAddStock, setShowAddStock] = useState(false);
  const [showUpdateStock, setShowUpdateStock] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<WarehouseType | null>(null);
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
  const [newQty, setNewQty] = useState('');
  const [whForm, setWhForm] = useState({ warehouseName: '', address: '', city: '', country: '', capacity: '' });
  const [stockForm, setStockForm] = useState({ name: '', sku: '', quantity: '', minQuantity: '10', unit: '', category: '', location: '' });

  const { data, loading, refetch } = useFetch<any[]>('/warehouses');
  const { mutate, loading: mutating } = useApiMutation();

  const warehouses: WarehouseType[] = data || [];
  const lowStockWarehouses = warehouses.filter((w) => w.inventoryStatus === 'Low Stock' || w.inventoryStatus === 'Critical');

  const handleCreate = () =>
    mutate('post', '/warehouses', { warehouseName: whForm.warehouseName, location: { address: whForm.address, city: whForm.city, country: whForm.country }, capacity: parseFloat(whForm.capacity) || undefined },
      () => { toast.success('Warehouse created'); setShowCreate(false); refetch(); },
      (e) => toast.error(e));

  const handleAddStock = () =>
    mutate('patch', `/warehouses/${selectedWarehouse!.id}`, { _action: 'addStock', item: { ...stockForm, quantity: parseInt(stockForm.quantity), minQuantity: parseInt(stockForm.minQuantity) } },
      () => { toast.success('Stock item added'); setShowAddStock(false); refetch(); },
      (e) => toast.error(e));

  const handleUpdateStock = () =>
    mutate('patch', `/warehouses/${selectedWarehouse!.id}`, { _action: 'updateStock', itemId: selectedItem!.id, quantity: parseInt(newQty) },
      () => { toast.success('Stock updated'); setShowUpdateStock(false); refetch(); },
      (e) => toast.error(e));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Warehouse</h1>
          <p className="text-gray-500 text-sm">Manage inventory and stock levels</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowCreate(true)}>Add Warehouse</Button>
      </div>

      {lowStockWarehouses.length > 0 && (
        <motion.div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 flex items-start gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-800 dark:text-yellow-400">Low Stock Alert</p>
            <p className="text-sm text-yellow-700 dark:text-yellow-500 mt-0.5">
              {lowStockWarehouses.length} warehouse(s) have low stock: {lowStockWarehouses.map((w) => w.warehouseName).join(', ')}
            </p>
          </div>
        </motion.div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="card p-6 animate-pulse h-64" />)}</div>
      ) : warehouses.length === 0 ? (
        <div className="card p-12">
          <EmptyState icon={<Warehouse className="w-8 h-8" />} title="No warehouses" description="Add your first warehouse" action={<Button onClick={() => setShowCreate(true)}>Add Warehouse</Button>} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {warehouses.map((w, i) => {
            const usedPct = w.capacity && w.usedCapacity ? (w.usedCapacity / w.capacity) * 100 : 0;
            const lowItems = w.stockItems?.filter((s) => s.quantity <= s.minQuantity) || [];
            return (
              <motion.div key={w.id} className="card p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">{w.warehouseName}</h3>
                    <p className="text-sm text-gray-500">{w.location?.city}, {w.location?.country}</p>
                    <p className="text-xs text-gray-400 mt-1">Code: {w.code}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge label={w.inventoryStatus} dot />
                    <Badge label={w.isActive ? 'Active' : 'Inactive'} />
                  </div>
                </div>
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Storage Used</span>
                    <span>{usedPct.toFixed(0)}% ({w.usedCapacity?.toLocaleString()} / {w.capacity?.toLocaleString()} units)</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className={`h-2 rounded-full transition-all duration-500 ${usedPct > 80 ? 'bg-red-500' : usedPct > 60 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${Math.min(usedPct, 100)}%` }} />
                  </div>
                </div>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Stock Items ({w.stockItems?.length || 0})</p>
                    {lowItems.length > 0 && <span className="text-xs text-red-600 font-medium">{lowItems.length} low</span>}
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {w.stockItems?.map((item) => (
                      <div key={item.id} className={`flex items-center justify-between p-2 rounded-lg text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${item.quantity <= item.minQuantity ? 'bg-red-50 dark:bg-red-900/10' : ''}`}
                        onClick={() => { setSelectedWarehouse(w); setSelectedItem(item); setNewQty(String(item.quantity)); setShowUpdateStock(true); }}>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                          <p className="text-xs text-gray-500">{item.sku} · {item.category}</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${item.quantity <= item.minQuantity ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>{item.quantity}</p>
                          <p className="text-xs text-gray-500">{item.unit}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <Button variant="secondary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => { setSelectedWarehouse(w); setShowAddStock(true); }} className="w-full justify-center">
                  Add Stock Item
                </Button>
              </motion.div>
            );
          })}
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add Warehouse">
        <div className="space-y-4">
          <Input label="Warehouse Name" placeholder="Chicago Distribution Center" value={whForm.warehouseName} onChange={(e) => setWhForm({ ...whForm, warehouseName: e.target.value })} required />
          <Input label="Address" placeholder="1234 Industrial Blvd" value={whForm.address} onChange={(e) => setWhForm({ ...whForm, address: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="City" placeholder="Chicago" value={whForm.city} onChange={(e) => setWhForm({ ...whForm, city: e.target.value })} />
            <Input label="Country" placeholder="USA" value={whForm.country} onChange={(e) => setWhForm({ ...whForm, country: e.target.value })} />
          </div>
          <Input label="Capacity (units)" type="number" placeholder="50000" value={whForm.capacity} onChange={(e) => setWhForm({ ...whForm, capacity: e.target.value })} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} loading={mutating} disabled={!whForm.warehouseName}>Create</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showAddStock} onClose={() => setShowAddStock(false)} title={`Add Stock — ${selectedWarehouse?.warehouseName}`}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Name" placeholder="Electronic Components" value={stockForm.name} onChange={(e) => setStockForm({ ...stockForm, name: e.target.value })} required />
            <Input label="SKU" placeholder="ELEC-001" value={stockForm.sku} onChange={(e) => setStockForm({ ...stockForm, sku: e.target.value })} />
            <Input label="Quantity" type="number" placeholder="100" value={stockForm.quantity} onChange={(e) => setStockForm({ ...stockForm, quantity: e.target.value })} required />
            <Input label="Min Quantity" type="number" placeholder="10" value={stockForm.minQuantity} onChange={(e) => setStockForm({ ...stockForm, minQuantity: e.target.value })} />
            <Input label="Unit" placeholder="units / kg / boxes" value={stockForm.unit} onChange={(e) => setStockForm({ ...stockForm, unit: e.target.value })} />
            <Input label="Category" placeholder="Electronics" value={stockForm.category} onChange={(e) => setStockForm({ ...stockForm, category: e.target.value })} />
          </div>
          <Input label="Location in Warehouse" placeholder="Aisle A1" value={stockForm.location} onChange={(e) => setStockForm({ ...stockForm, location: e.target.value })} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowAddStock(false)}>Cancel</Button>
            <Button onClick={handleAddStock} loading={mutating} disabled={!stockForm.name || !stockForm.quantity}>Add Item</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showUpdateStock} onClose={() => setShowUpdateStock(false)} title={`Update Stock — ${selectedItem?.name}`} size="sm">
        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-sm space-y-1">
            <div className="flex justify-between"><span className="text-gray-500">Current</span><span className="font-medium">{selectedItem?.quantity} {selectedItem?.unit}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Min. Required</span><span className="font-medium">{selectedItem?.minQuantity}</span></div>
          </div>
          <Input label="New Quantity" type="number" value={newQty} onChange={(e) => setNewQty(e.target.value)} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowUpdateStock(false)}>Cancel</Button>
            <Button onClick={handleUpdateStock} loading={mutating}>Update</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
