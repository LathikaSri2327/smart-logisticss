import { NextRequest, NextResponse } from 'next/server';
import qrcode from 'qrcode';
import dbConnect from '@/lib/db';
import { Shipment, Notification } from '@/lib/models';
import { getUser } from '@/lib/middleware/auth';
import { loadShipment } from '@/lib/utils/shipment';

export async function GET(req: NextRequest) {
  const authUser = await getUser(req);
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await dbConnect();

  const p = req.nextUrl.searchParams;
  const page = parseInt(p.get('page') || '1');
  const limit = parseInt(p.get('limit') || '10');
  const filter: any = {};

  if (p.get('status')) filter.shipmentStatus = p.get('status');
  if (p.get('shipmentType')) filter.shipmentType = p.get('shipmentType');
  if (p.get('priority')) filter.priority = p.get('priority');
  if (p.get('search')) filter.shipmentId = { $regex: p.get('search'), $options: 'i' };
  if (authUser.role === 'client') filter.client = authUser.id;
  else if (p.get('clientId')) filter.client = p.get('clientId');
  if (authUser.role === 'driver') filter.driver = authUser.id;
  else if (p.get('driverId')) filter.driver = p.get('driverId');

  try {
    const total = await Shipment.countDocuments(filter);
    const rows = await Shipment.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean();
    const shipments = await Promise.all(rows.map((r: any) => loadShipment(r._id.toString())));
    return NextResponse.json({ shipments: shipments.filter(Boolean), totalCount: total, totalPages: Math.ceil(total / limit), currentPage: page });
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
    const shipmentId = `SHP-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    const qrCode = await qrcode.toDataURL(shipmentId);
    const shipment = await Shipment.create({
      shipmentId, client: input.clientId, qrCode,
      source: input.source, destination: input.destination,
      shipmentType: input.shipmentType || 'Standard',
      priority: input.priority || 'Normal',
      weight: input.weight, value: input.value,
      description: input.description,
      estimatedDelivery: input.estimatedDelivery,
      notes: input.notes, insurance: input.insurance || false,
      shipmentHistory: [{ status: 'Pending', location: input.source?.address, note: 'Shipment created', timestamp: new Date().toISOString() }],
    });
    await Notification.create({ user: input.clientId, title: 'Shipment Created', message: `Your shipment ${shipmentId} has been created.`, type: 'shipment' });
    return NextResponse.json(await loadShipment(shipment._id.toString()));
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
