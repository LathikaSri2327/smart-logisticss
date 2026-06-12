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

export async function GET(req: NextRequest) {
  const authUser = await getUser(req);
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const clientId = req.nextUrl.searchParams.get('clientId');
  const mine = req.nextUrl.searchParams.get('mine');
  try {
    const qId = mine ? authUser.id : (authUser.role === 'client' ? authUser.id : clientId);
    const { rows } = qId
      ? await pool.query('SELECT id FROM orders WHERE client_id=$1 ORDER BY created_at DESC', [qId])
      : await pool.query('SELECT id FROM orders ORDER BY created_at DESC');
    return NextResponse.json(await Promise.all(rows.map((r: any) => loadOrder(r.id))));
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authUser = await getUser(req);
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const input = await req.json();
  try {
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    const items = input.items.map((i: any) => ({ ...i, totalPrice: i.quantity * i.unitPrice }));
    const subtotal = items.reduce((s: number, i: any) => s + i.totalPrice, 0);
    const totalAmount = subtotal + (input.tax || 0) - (input.discount || 0);
    const { rows } = await pool.query(
      `INSERT INTO orders (order_id,client_id,shipment_id,items,subtotal,tax,discount,total_amount,payment_method,notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
      [orderId, input.clientId, input.shipmentId || null, JSON.stringify(items), subtotal,
        input.tax || 0, input.discount || 0, totalAmount, input.paymentMethod, input.notes]
    );
    return NextResponse.json(await loadOrder(rows[0].id));
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
