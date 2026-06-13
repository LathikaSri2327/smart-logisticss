import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Order } from '@/lib/models';
import { getUser, mapUser } from '@/lib/middleware/auth';
import { loadShipment } from '@/lib/utils/shipment';

const loadOrder = async (id: string) => {
  const o = await Order.findById(id).populate('client').lean() as any;
  if (!o) return null;
  return {
    id: o._id.toString(), orderId: o.orderId,
    client: mapUser(o.client), shipment: o.shipment ? await loadShipment(o.shipment.toString()) : null,
    items: o.items || [], subtotal: o.subtotal, tax: o.tax, discount: o.discount,
    totalAmount: o.totalAmount, paymentStatus: o.paymentStatus,
    paymentMethod: o.paymentMethod, notes: o.notes,
    createdAt: o.createdAt, updatedAt: o.updatedAt,
  };
};

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const authUser = await getUser(req);
  if (!authUser || authUser.role !== 'admin')
    return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  const { status } = await req.json();
  await dbConnect();
  try {
    await Order.findByIdAndUpdate(params.id, { paymentStatus: status });
    return NextResponse.json(await loadOrder(params.id));
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
