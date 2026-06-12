import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUser, mapUser } from '@/lib/middleware/auth';
import { loadShipment } from '@/lib/utils/shipment';

const loadOrder = async (id: string) => {
  const { rows } = await pool.query('SELECT * FROM orders WHERE id=$1', [id]);
  if (!rows[0]) return null;
  const o = rows[0];
  const [cu, su] = await Promise.all([
    o.client_id ? pool.query('SELECT * FROM users WHERE id=$1', [o.client_id]) : null,
    o.shipment_id ? loadShipment(o.shipment_id) : null,
  ]);
  return {
    id: o.id, orderId: o.order_id,
    client: cu?.rows[0] ? mapUser(cu.rows[0]) : null, shipment: su,
    items: o.items || [], subtotal: o.subtotal, tax: o.tax, discount: o.discount,
    totalAmount: o.total_amount, paymentStatus: o.payment_status,
    paymentMethod: o.payment_method, notes: o.notes,
    createdAt: o.created_at, updatedAt: o.updated_at,
  };
};

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const authUser = await getUser(req);
  if (!authUser || authUser.role !== 'admin')
    return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  const { status } = await req.json();
  try {
    await pool.query('UPDATE orders SET payment_status=$1, updated_at=NOW() WHERE id=$2', [status, params.id]);
    return NextResponse.json(await loadOrder(params.id));
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
