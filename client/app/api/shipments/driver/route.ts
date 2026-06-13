import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Shipment } from '@/lib/models';
import { getUser } from '@/lib/middleware/auth';
import { loadShipment } from '@/lib/utils/shipment';

export async function GET(req: NextRequest) {
  const authUser = await getUser(req);
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await dbConnect();
  try {
    const rows = await Shipment.find({ driver: authUser.id, shipmentStatus: { $nin: ['Delivered', 'Cancelled'] } }).sort({ createdAt: -1 }).lean() as any[];
    const shipments = await Promise.all(rows.map((r: any) => loadShipment(r._id.toString())));
    return NextResponse.json(shipments.filter(Boolean));
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
