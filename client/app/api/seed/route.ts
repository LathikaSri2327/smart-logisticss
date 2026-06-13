import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import { User, Warehouse } from '@/lib/models';

export const dynamic = 'force-dynamic';

export async function GET() {
  await dbConnect();
  try {
    const hash = await bcrypt.hash('Admin@2327', 12);
    await User.findOneAndUpdate(
      { email: 'admin@smartlogistics.com' },
      { name: 'Admin', email: 'admin@smartlogistics.com', password: hash, role: 'admin', company: 'Smart Logistics', phone: '+91 98765 00100', isActive: true },
      { upsert: true, new: true }
    );

    const warehouses = [
      {
        warehouseName: 'Mumbai Distribution Center',
        code: 'WH-MUM',
        location: { address: '100 Industrial Blvd, Andheri East', city: 'Mumbai', country: 'India' },
        capacity: 50000, usedCapacity: 32000,
        stockItems: [
          { id: 's1', name: 'Electronic Components', sku: 'ELEC-001', quantity: 500, minQuantity: 50, unit: 'units', category: 'Electronics' },
          { id: 's2', name: 'Packaging Material', sku: 'PACK-001', quantity: 8, minQuantity: 100, unit: 'rolls', category: 'Packaging' },
          { id: 's3', name: 'Mobile Phones', sku: 'MOB-001', quantity: 200, minQuantity: 20, unit: 'units', category: 'Electronics' },
        ],
        inventoryStatus: 'LowStock', isActive: true,
      },
      {
        warehouseName: 'Delhi Fulfillment Center',
        code: 'WH-DEL',
        location: { address: '200 Logistics Park, Dwarka', city: 'Delhi', country: 'India' },
        capacity: 30000, usedCapacity: 12000,
        stockItems: [
          { id: 's4', name: 'Furniture Parts', sku: 'FURN-001', quantity: 200, minQuantity: 20, unit: 'units', category: 'Furniture' },
          { id: 's5', name: 'Office Supplies', sku: 'OFF-001', quantity: 1500, minQuantity: 100, unit: 'packs', category: 'Stationery' },
        ],
        inventoryStatus: 'Normal', isActive: true,
      },
      {
        warehouseName: 'Bangalore Tech Hub',
        code: 'WH-BLR',
        location: { address: '300 IT Corridor, Whitefield', city: 'Bangalore', country: 'India' },
        capacity: 40000, usedCapacity: 38000,
        stockItems: [
          { id: 's6', name: 'Laptops', sku: 'LAP-001', quantity: 150, minQuantity: 30, unit: 'units', category: 'Electronics' },
          { id: 's7', name: 'Server Components', sku: 'SRV-001', quantity: 80, minQuantity: 10, unit: 'units', category: 'IT Hardware' },
          { id: 's8', name: 'Cables & Accessories', sku: 'CAB-001', quantity: 5, minQuantity: 50, unit: 'boxes', category: 'Accessories' },
        ],
        inventoryStatus: 'Critical', isActive: true,
      },
      {
        warehouseName: 'Chennai Port Warehouse',
        code: 'WH-CHN',
        location: { address: '45 Port Road, Chennai Port', city: 'Chennai', country: 'India' },
        capacity: 60000, usedCapacity: 15000,
        stockItems: [
          { id: 's9', name: 'Textile Goods', sku: 'TEX-001', quantity: 3000, minQuantity: 200, unit: 'rolls', category: 'Textile' },
          { id: 's10', name: 'Auto Parts', sku: 'AUTO-001', quantity: 400, minQuantity: 50, unit: 'units', category: 'Automotive' },
        ],
        inventoryStatus: 'Normal', isActive: true,
      },
      {
        warehouseName: 'Hyderabad Cold Storage',
        code: 'WH-HYD',
        location: { address: '78 Cold Chain Zone, Shamshabad', city: 'Hyderabad', country: 'India' },
        capacity: 20000, usedCapacity: 9000,
        stockItems: [
          { id: 's11', name: 'Pharmaceutical Goods', sku: 'PHARMA-001', quantity: 600, minQuantity: 100, unit: 'units', category: 'Pharma' },
          { id: 's12', name: 'Food Products', sku: 'FOOD-001', quantity: 1200, minQuantity: 200, unit: 'kg', category: 'Food' },
        ],
        inventoryStatus: 'Normal', isActive: true,
      },
    ];

    for (const w of warehouses) {
      await Warehouse.findOneAndUpdate({ code: w.code }, w, { upsert: true, new: true });
    }

    return NextResponse.json({ success: true, message: '✅ Admin and 5 warehouses created successfully' });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
