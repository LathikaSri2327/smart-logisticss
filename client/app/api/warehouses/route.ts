import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import pool from '@/lib/db';
import { getUser, mapUser } from '@/lib/middleware/auth';

const loadWarehouse = async (id: string) => {
  const { rows } = await pool.query('SELECT * FROM warehouses WHERE id=$1', [id]);
  if (!rows[0]) return null;
  const w = rows[0];
  const mu = w.manager_id ? await pool.query('SELECT * FROM users WHERE id=$1', [w.manager_id]) : null;
  return {
    id: w.id, warehouseName: w.warehouse_name, code: w.code, location: w.location,
    manager: mu?.rows[0] ? mapUser(mu.rows[0]) : null,
    capacity: w.capacity, usedCapacity: w.used_capacity,
    stockItems: (w.stock_items || []).map((s: any, idx: number) => ({ id: s.id || String(idx), ...s })),
    inventoryStatus: w.inventory_status, isActive: w.is_active, createdAt: w.created_at,
  };
};

export async function GET(req: NextRequest) {
  const authUser = await getUser(req);
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { rows } = await pool.query('SELECT id FROM warehouses ORDER BY created_at DESC');
    return NextResponse.json(await Promise.all(rows.map((r: any) => loadWarehouse(r.id))));
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authUser = await getUser(req);
  if (!authUser || authUser.role !== 'admin')
    return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  const input = await req.json();
  try {
    const code = 'WH-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    const { rows } = await pool.query(
      `INSERT INTO warehouses (warehouse_name,code,location,capacity,manager_id) VALUES ($1,$2,$3,$4,$5) RETURNING id`,
      [input.warehouseName, code, JSON.stringify(input.location || {}), input.capacity, input.managerId || null]
    );
    return NextResponse.json(await loadWarehouse(rows[0].id));
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
