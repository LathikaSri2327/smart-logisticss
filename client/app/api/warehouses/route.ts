import { NextRequest, NextResponse } from 'next/server';
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

export async function GET(req: NextRequest) {
  const authUser = await getUser(req);
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await dbConnect();
  try {
    const warehouses = await Warehouse.find().sort({ createdAt: -1 }).lean() as any[];
    return NextResponse.json(await Promise.all(warehouses.map((w: any) => loadWarehouse(w._id.toString()))));
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authUser = await getUser(req);
  if (!authUser || authUser.role !== 'admin')
    return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  const input = await req.json();
  await dbConnect();
  try {
    const code = 'WH-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    const warehouse = await Warehouse.create({
      warehouseName: input.warehouseName, code, location: input.location || {},
      capacity: input.capacity, manager: input.managerId || null,
    });
    return NextResponse.json(await loadWarehouse(warehouse._id.toString()));
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
