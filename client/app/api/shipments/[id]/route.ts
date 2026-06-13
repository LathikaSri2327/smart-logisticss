import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Shipment, Notification } from '@/lib/models';
import { getUser } from '@/lib/middleware/auth';
import { loadShipment } from '@/lib/utils/shipment';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const authUser = await getUser(req);
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await dbConnect();
  const action = req.nextUrl.searchParams.get('action');
  try {
    if (action === 'track') {
      const s = await Shipment.findOne({ shipmentId: params.id }).lean() as any;
      return NextResponse.json(s ? await loadShipment(s._id.toString()) : null);
    }
    return NextResponse.json(await loadShipment(params.id));
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const authUser = await getUser(req);
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const input = await req.json();
  await dbConnect();

  try {
    const action = input._action;

    if (action === 'status') {
      const s = await Shipment.findById(params.id).lean() as any;
      if (!s) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      const history = [...(s.shipmentHistory || []), { status: input.status, location: input.location, note: input.note, timestamp: new Date().toISOString() }];
      await Shipment.findByIdAndUpdate(params.id, {
        shipmentStatus: input.status, shipmentHistory: history,
        ...(input.status === 'Delivered' ? { actualDelivery: new Date() } : {}),
      });
      await Notification.create({ user: s.client, title: 'Shipment Update', message: `Your shipment ${s.shipmentId} is now ${input.status}.`, type: 'shipment', link: '/client/track' });
      return NextResponse.json(await loadShipment(params.id));
    }

    if (action === 'assign') {
      const s = await Shipment.findByIdAndUpdate(params.id, { driver: input.driverId, vehicle: input.vehicleId || null, shipmentStatus: 'Packed' }, { new: true }).lean() as any;
      await Notification.create({ user: input.driverId, title: 'New Delivery Assigned', message: `You have been assigned shipment ${s?.shipmentId}.`, type: 'delivery' });
      return NextResponse.json(await loadShipment(params.id));
    }

    if (action === 'proof') {
      await Shipment.findByIdAndUpdate(params.id, { proofOfDelivery: input.imageUrl, shipmentStatus: 'Delivered', actualDelivery: new Date() });
      return NextResponse.json(await loadShipment(params.id));
    }

    const update: any = {};
    if (input.driverId !== undefined) update.driver = input.driverId;
    if (input.vehicleId !== undefined) update.vehicle = input.vehicleId;
    if (input.shipmentStatus) update.shipmentStatus = input.shipmentStatus;
    if (input.currentLocation) update.currentLocation = input.currentLocation;
    if (input.estimatedDelivery) update.estimatedDelivery = input.estimatedDelivery;
    if (input.notes) update.notes = input.notes;
    if (input.priority) update.priority = input.priority;
    if (input.driverAcceptance) update.driverAcceptance = input.driverAcceptance;
    await Shipment.findByIdAndUpdate(params.id, update);
    return NextResponse.json(await loadShipment(params.id));
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const authUser = await getUser(req);
  if (!authUser || authUser.role !== 'admin')
    return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  await dbConnect();
  try {
    await Shipment.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
