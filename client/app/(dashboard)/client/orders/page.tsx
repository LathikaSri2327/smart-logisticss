'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Plus, Download, Package, Warehouse } from 'lucide-react';
import toast from 'react-hot-toast';
import { useFetch, useApiMutation } from '@/hooks/useApi';
import { Badge, EmptyState, Button, Table, Modal, Input, Select } from '@/components/ui';
import { formatDate, formatCurrency, generateCSV } from '@/utils/helpers';
import { useAuth } from '@/hooks/useAuth';

export default function ClientOrdersPage() {
  const { user } = useAuth();
  const { data, loading, refetch } = useFetch<any[]>('/orders?mine=1');
  const { data: shipmentsData } = useFetch<any>('/shipments?mine=1');
  const { data: warehouses } = useFetch<any[]>('/warehouses');
  const { mutate, loading: mutating } = useApiMutation();

  const orders = data || [];
  const shipments = shipmentsData?.shipments || [];

  const [showShipment, setShowShipment] = useState(false);
  const [showOrder, setShowOrder] = useState(false);
  const [showWarehouse, setShowWarehouse] = useState(false);

  const [shipmentForm, setShipmentForm] = useState({
    sourceAddress: '', sourceCity: '', sourceCountry: '',
    destAddress: '', destCity: '', destCountry: '',
    shipmentType: 'Standard', priority: 'Normal',
    weight: '', value: '', description: '', estimatedDelivery: '',
  });

  const [orderForm, setOrderForm] = useState({
    shipmentId: '', productName: '', sku: '', quantity: '1', unitPrice: '',
    paymentMethod: 'Bank Transfer', tax: '0',
  });

  const [warehouseForm, setWarehouseForm] = useState({
    warehouseId: '', itemName: '', sku: '', quantity: '1', unit: 'units', category: '',
  });

  const handleCreateShipment = () => {
    if (!shipmentForm.sourceCity || !shipmentForm.destCity)
      return toast.error('Please fill source and destination cities');
    mutate('post', '/shipments', {
      clientId: user?.id,
      source: { address: shipmentForm.sourceAddress, city: shipmentForm.sourceCity, country: shipmentForm.sourceCountry },
      destination: { address: shipmentForm.destAddress, city: shipmentForm.destCity, country: shipmentForm.destCountry },
      shipmentType: shipmentForm.shipmentType, priority: shipmentForm.priority,
      weight: parseFloat(shipmentForm.weight) || undefined,
      value: parseFloat(shipmentForm.value) || undefined,
      description: shipmentForm.description,
      estimatedDelivery: shipmentForm.estimatedDelivery || undefined,
    }, () => { toast.success('Shipment booked successfully!'); setShowShipment(false); refetch(); },
      (e) => toast.error(e));
  };

  const handleCreateOrder = () => {
    if (!orderForm.productName || !orderForm.unitPrice)
      return toast.error('Please fill product name and price');
    const unitPrice = parseFloat(orderForm.unitPrice);
    const quantity = parseInt(orderForm.quantity);
    mutate('post', '/orders', {
      clientId: user?.id,
      shipmentId: orderForm.shipmentId || undefined,
      items: [{ productName: orderForm.productName, sku: orderForm.sku, quantity, unitPrice, totalPrice: quantity * unitPrice }],
      tax: parseFloat(orderForm.tax) || 0,
      paymentMethod: orderForm.paymentMethod,
    }, () => { toast.success('Order placed successfully!'); setShowOrder(false); refetch(); },
      (e) => toast.error(e));
  };

  const handleBookWarehouse = () => {
    if (!warehouseForm.warehouseId || !warehouseForm.itemName)
      return toast.error('Please select a warehouse and enter item details');
    mutate('patch', `/warehouses/${warehouseForm.warehouseId}`, {
      _action: 'addStock',
      item: { name: warehouseForm.itemName, sku: warehouseForm.sku, quantity: parseInt(warehouseForm.quantity), unit: warehouseForm.unit, category: warehouseForm.category, minQuantity: 5 },
    }, () => { toast.success('Warehouse space booked!'); setShowWarehouse(false); },
      (e) => toast.error(e));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Orders</h1>
          <p className="text-gray-500 text-sm">Manage your orders and shipments</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" icon={<Package className="w-4 h-4" />} onClick={() => setShowShipment(true)}>Book Shipment</Button>
          <Button size="sm" variant="secondary" icon={<Warehouse className="w-4 h-4" />} onClick={() => setShowWarehouse(true)}>Book Warehouse</Button>
          <Button size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setShowOrder(true)}>Place Order</Button>
          {orders.length > 0 && <Button size="sm" variant="secondary" icon={<Download className="w-4 h-4" />} onClick={() => generateCSV(orders.map((o: any) => ({ 'Order ID': o.orderId, Amount: o.totalAmount, Status: o.paymentStatus, Date: formatDate(o.createdAt) })), 'my-orders')}>Export</Button>}
        </div>
      </div>

      <div className="card overflow-hidden">
        <Table headers={['Order ID', 'Shipment', 'Items', 'Total', 'Payment', 'Date']} loading={loading}>
          {orders.length === 0 && !loading ? (
            <tr><td colSpan={6} className="py-12">
              <EmptyState icon={<ShoppingBag className="w-8 h-8" />} title="No orders yet" description="Place your first order using the button above." />
            </td></tr>
          ) : orders.map((o: any, i: number) => (
            <motion.tr key={o.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
              className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
              <td className="px-4 py-3 font-mono text-xs text-brand-600 dark:text-brand-400">{o.orderId}</td>
              <td className="px-4 py-3 font-mono text-xs text-gray-500">{o.shipment?.shipmentId || '—'}</td>
              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{o.items?.length || 0} items</td>
              <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{formatCurrency(o.totalAmount)}</td>
              <td className="px-4 py-3"><Badge label={o.paymentStatus} dot /></td>
              <td className="px-4 py-3 text-sm text-gray-500">{formatDate(o.createdAt)}</td>
            </motion.tr>
          ))}
        </Table>
      </div>

      {/* Book Shipment Modal */}
      <Modal isOpen={showShipment} onClose={() => setShowShipment(false)} title="Book a Shipment" size="xl">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">📍 Origin</p>
              <Input placeholder="Address" value={shipmentForm.sourceAddress} onChange={(e) => setShipmentForm({ ...shipmentForm, sourceAddress: e.target.value })} />
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="City *" value={shipmentForm.sourceCity} onChange={(e) => setShipmentForm({ ...shipmentForm, sourceCity: e.target.value })} />
                <Input placeholder="Country" value={shipmentForm.sourceCountry} onChange={(e) => setShipmentForm({ ...shipmentForm, sourceCountry: e.target.value })} />
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">📍 Destination</p>
              <Input placeholder="Address" value={shipmentForm.destAddress} onChange={(e) => setShipmentForm({ ...shipmentForm, destAddress: e.target.value })} />
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="City *" value={shipmentForm.destCity} onChange={(e) => setShipmentForm({ ...shipmentForm, destCity: e.target.value })} />
                <Input placeholder="Country" value={shipmentForm.destCountry} onChange={(e) => setShipmentForm({ ...shipmentForm, destCountry: e.target.value })} />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Shipment Type" value={shipmentForm.shipmentType} onChange={(e) => setShipmentForm({ ...shipmentForm, shipmentType: e.target.value })}>
              {['Standard', 'Express', 'Freight', 'Cold Chain'].map((t) => <option key={t}>{t}</option>)}
            </Select>
            <Select label="Priority" value={shipmentForm.priority} onChange={(e) => setShipmentForm({ ...shipmentForm, priority: e.target.value })}>
              {['Low', 'Normal', 'High', 'Urgent'].map((p) => <option key={p}>{p}</option>)}
            </Select>
            <Input label="Weight (kg)" type="number" placeholder="500" value={shipmentForm.weight} onChange={(e) => setShipmentForm({ ...shipmentForm, weight: e.target.value })} />
            <Input label="Value (₹)" type="number" placeholder="50000" value={shipmentForm.value} onChange={(e) => setShipmentForm({ ...shipmentForm, value: e.target.value })} />
          </div>
          <Input label="Description" placeholder="What are you shipping?" value={shipmentForm.description} onChange={(e) => setShipmentForm({ ...shipmentForm, description: e.target.value })} />
          <Input label="Expected Delivery Date" type="date" value={shipmentForm.estimatedDelivery} onChange={(e) => setShipmentForm({ ...shipmentForm, estimatedDelivery: e.target.value })} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowShipment(false)}>Cancel</Button>
            <Button onClick={handleCreateShipment} loading={mutating}>Book Shipment</Button>
          </div>
        </div>
      </Modal>

      {/* Place Order Modal */}
      <Modal isOpen={showOrder} onClose={() => setShowOrder(false)} title="Place an Order">
        <div className="space-y-4">
          <Select label="Link to Shipment (optional)" value={orderForm.shipmentId} onChange={(e) => setOrderForm({ ...orderForm, shipmentId: e.target.value })}>
            <option value="">No shipment</option>
            {shipments.map((s: any) => <option key={s.id} value={s.id}>{s.shipmentId} — {s.source?.city} → {s.destination?.city}</option>)}
          </Select>
          <Input label="Product Name *" placeholder="e.g. Laptop" value={orderForm.productName} onChange={(e) => setOrderForm({ ...orderForm, productName: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="SKU" placeholder="PROD-001" value={orderForm.sku} onChange={(e) => setOrderForm({ ...orderForm, sku: e.target.value })} />
            <Input label="Quantity *" type="number" value={orderForm.quantity} onChange={(e) => setOrderForm({ ...orderForm, quantity: e.target.value })} />
            <Input label="Unit Price (₹) *" type="number" placeholder="1000" value={orderForm.unitPrice} onChange={(e) => setOrderForm({ ...orderForm, unitPrice: e.target.value })} />
            <Input label="Tax (₹)" type="number" placeholder="0" value={orderForm.tax} onChange={(e) => setOrderForm({ ...orderForm, tax: e.target.value })} />
          </div>
          <Select label="Payment Method" value={orderForm.paymentMethod} onChange={(e) => setOrderForm({ ...orderForm, paymentMethod: e.target.value })}>
            {['Bank Transfer', 'UPI', 'Credit Card', 'Cash on Delivery'].map((m) => <option key={m}>{m}</option>)}
          </Select>
          {orderForm.unitPrice && orderForm.quantity && (
            <div className="bg-brand-50 dark:bg-brand-950/20 rounded-xl p-3 text-sm">
              <p className="text-gray-600 dark:text-gray-400">Total: <span className="font-bold text-brand-600">{formatCurrency((parseFloat(orderForm.unitPrice) * parseInt(orderForm.quantity)) + parseFloat(orderForm.tax || '0'))}</span></p>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowOrder(false)}>Cancel</Button>
            <Button onClick={handleCreateOrder} loading={mutating}>Place Order</Button>
          </div>
        </div>
      </Modal>

      {/* Book Warehouse Modal */}
      <Modal isOpen={showWarehouse} onClose={() => setShowWarehouse(false)} title="Book Warehouse Space">
        <div className="space-y-4">
          <Select label="Select Warehouse *" value={warehouseForm.warehouseId} onChange={(e) => setWarehouseForm({ ...warehouseForm, warehouseId: e.target.value })}>
            <option value="">Choose a warehouse</option>
            <option value="WH-MUM-ID" disabled style={{fontWeight:'bold', color:'#888'}}>── Available Warehouses ──</option>
            {(warehouses && warehouses.length > 0) ? warehouses.map((w: any) => (
              <option key={w.id} value={w.id}>
                {w.warehouseName} — {w.location?.city} | Capacity: {w.usedCapacity?.toLocaleString()}/{w.capacity?.toLocaleString()} | {w.inventoryStatus}
              </option>
            )) : (
              <option disabled>Loading warehouses...</option>
            )}
          </Select>
          {warehouses && warehouses.length > 0 && warehouseForm.warehouseId && (() => {
            const w = warehouses.find((wh: any) => wh.id === warehouseForm.warehouseId);
            if (!w) return null;
            const used = Math.round((w.usedCapacity / w.capacity) * 100);
            return (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-sm space-y-1">
                <p className="text-gray-500">📍 {w.location?.address}, {w.location?.city}</p>
                <p className="text-gray-500">Capacity used: <span className="font-semibold text-gray-900 dark:text-white">{used}%</span></p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div className={`h-1.5 rounded-full ${used > 90 ? 'bg-red-500' : used > 70 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${used}%` }} />
                </div>
              </div>
            );
          })()}
          <Input label="Item Name *" placeholder="e.g. Electronic Components" value={warehouseForm.itemName} onChange={(e) => setWarehouseForm({ ...warehouseForm, itemName: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="SKU" placeholder="ITEM-001" value={warehouseForm.sku} onChange={(e) => setWarehouseForm({ ...warehouseForm, sku: e.target.value })} />
            <Input label="Quantity *" type="number" value={warehouseForm.quantity} onChange={(e) => setWarehouseForm({ ...warehouseForm, quantity: e.target.value })} />
            <Input label="Unit" placeholder="units / boxes / kg" value={warehouseForm.unit} onChange={(e) => setWarehouseForm({ ...warehouseForm, unit: e.target.value })} />
            <Input label="Category" placeholder="Electronics" value={warehouseForm.category} onChange={(e) => setWarehouseForm({ ...warehouseForm, category: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowWarehouse(false)}>Cancel</Button>
            <Button onClick={handleBookWarehouse} loading={mutating}>Book Space</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
