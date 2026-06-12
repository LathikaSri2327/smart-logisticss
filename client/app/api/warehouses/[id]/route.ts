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

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const authUser = await getUser(req);
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const input = await req.json();
  try {
    const { rows: wr } = await pool.query('SELECT stock_items FROM warehouses WHERE id=$1', [params.id]);
    let items = wr[0].stock_items || [];

    if (input._action === 'addStock') {
      items = [...items, { id: uuidv4(), ...input.item, lastUpdated: new Date().toISOString() }];
    } else if (input._action === 'updateStock') {
      const item = items.find((s: any) => s.id === input.itemId);
      if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 });
      item.quantity = input.quantity;
      item.lastUpdated = new Date().toISOString();
    }

    const hasLow = items.some((s: any) => s.quantity <= (s.minQuantity || 10));
    await pool.query(
      'UPDATE warehouses SET stock_items=$1, inventory_status=$2, updated_at=NOW() WHERE id=$3',
      [JSON.stringify(items), hasLow ? 'LowStock' : 'Normal', params.id]
    );
    return NextResponse.json(await loadWarehouse(params.id));
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
