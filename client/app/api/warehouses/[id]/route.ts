import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import dbConnect from '@/lib/db';
import { Warehouse } from '@/lib/models';
import { getUser, mapUser } from '@/lib/middleware/auth';

const loadWarehouse = async (id: string) => {
  const w = await Warehouse.findById(id).populate('manager').lean() as any;
  if (!w) return null;
  return {
    id: w._id.toString(), warehouseName: w.warehouseName, code: w.code, location: w.location,
    manager: w.manager ? mapUser(w.manager) : null,
    capacity: w.capacity, usedCapacity: w.usedCapacity,
    stockItems: (w.stockItems || []).map((s: any, i: number) => ({ id: s.id || String(i), ...s })),
    inventoryStatus: w.inventoryStatus, isActive: w.isActive, createdAt: w.createdAt,
  };
};

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const authUser = await getUser(req);
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const input = await req.json();
  await dbConnect();
  try {
    const w = await Warehouse.findById(params.id).lean() as any;
    let items = w.stockItems || [];

    if (input._action === 'addStock') {
      items = [...items, { id: uuidv4(), ...input.item, lastUpdated: new Date().toISOString() }];
    } else if (input._action === 'updateStock') {
      const item = items.find((s: any) => s.id === input.itemId);
      if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 });
      item.quantity = input.quantity;
      item.lastUpdated = new Date().toISOString();
    }

    const hasLow = items.some((s: any) => s.quantity <= (s.minQuantity || 10));
    await Warehouse.findByIdAndUpdate(params.id, { stockItems: items, inventoryStatus: hasLow ? 'LowStock' : 'Normal' });
    return NextResponse.json(await loadWarehouse(params.id));
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
