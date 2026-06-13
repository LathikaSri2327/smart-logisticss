import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Order } from '@/lib/models';
import { getUser, mapUser } from '@/lib/middleware/auth';
import { loadShipment } from '@/lib/utils/shipment';

const loadOrder = async (id: string) => {
  await dbConnect();
  const o = await Order.findById(id).populate('client').populate('shipment').lean() as any;
  if (!o) return null;
  return {
    id: o._id.toString(), orderId: o.orderId,
    client: mapUser(o.client), shipment: o.shipment ? await loadShipment(o.shipment._id.toString()) : null,
    items: o.items || [], subtotal: o.subtotal, tax: o.tax, discount: o.discount,
    totalAmount: o.totalAmount, paymentStatus: o.paymentStatus,
    paymentMethod: o.paymentMethod, notes: o.notes,
    createdAt: o.createdAt, updatedAt: o.updatedAt,
  };
};

export async function GET(req: NextRequest) {
  const authUser = await getUser(req);
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await dbConnect();
  const clientId = req.nextUrl.searchParams.get('clientId');
  const mine = req.nextUrl.searchParams.get('mine');
  try {
    const filter: any = {};
    if (mine || authUser.role === 'client') filter.client = authUser.id;
    else if (clientId) filter.client = clientId;
    const orders = await Order.find(filter).sort({ createdAt: -1 }).lean() as any[];
    return NextResponse.json(await Promise.all(orders.map((o: any) => loadOrder(o._id.toString()))));
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authUser = await getUser(req);
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const input = await req.json();
  await dbConnect();
  try {
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    const items = input.items.map((i: any) => ({ ...i, totalPrice: i.quantity * i.unitPrice }));
    const subtotal = items.reduce((s: number, i: any) => s + i.totalPrice, 0);
    const totalAmount = subtotal + (input.tax || 0) - (input.discount || 0);
    const order = await Order.create({
      orderId, client: input.clientId, shipment: input.shipmentId || null,
      items, subtotal, tax: input.tax || 0, discount: input.discount || 0,
      totalAmount, paymentMethod: input.paymentMethod, notes: input.notes,
    });
    return NextResponse.json(await loadOrder(order._id.toString()));
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
