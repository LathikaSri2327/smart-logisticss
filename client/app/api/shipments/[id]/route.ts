import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUser } from '@/lib/middleware/auth';
import { loadShipment } from '@/lib/utils/shipment';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const authUser = await getUser(req);
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = params;
  // track by shipmentId string
  const action = req.nextUrl.searchParams.get('action');
  try {
    if (action === 'track') {
      const { rows } = await pool.query('SELECT id FROM shipments WHERE shipment_id=$1', [id]);
      return NextResponse.json(rows[0] ? await loadShipment(rows[0].id) : null);
    }
    return NextResponse.json(await loadShipment(id));
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const authUser = await getUser(req);
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = params;
  const input = await req.json();

  try {
    const action = input._action;

    if (action === 'status') {
      const { rows: sr } = await pool.query('SELECT * FROM shipments WHERE id=$1', [id]);
      if (!sr[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      const s = sr[0];
      const history = [...(s.shipment_history || []), {
        status: input.status, location: input.location || s.current_location?.address,
        note: input.note, timestamp: new Date().toISOString(),
      }];
      await pool.query(
        `UPDATE shipments SET shipment_status=$1, shipment_history=$2${input.status === 'Delivered' ? ', actual_delivery=NOW()' : ''}, updated_at=NOW() WHERE id=$3`,
        [input.status, JSON.stringify(history), id]
      );
      await pool.query(
        `INSERT INTO notifications (user_id,title,message,type,link) VALUES ($1,$2,$3,'shipment',$4)`,
        [s.client_id, 'Shipment Update', `Your shipment ${s.shipment_id} is now ${input.status}.`, '/client/track']
      );
      return NextResponse.json(await loadShipment(id));
    }

    if (action === 'assign') {
      await pool.query(
        `UPDATE shipments SET driver_id=$1, vehicle_id=$2, shipment_status='Packed', updated_at=NOW() WHERE id=$3`,
        [input.driverId, input.vehicleId || null, id]
      );
      const { rows } = await pool.query('SELECT shipment_id FROM shipments WHERE id=$1', [id]);
      await pool.query(
        `INSERT INTO notifications (user_id,title,message,type) VALUES ($1,$2,$3,'delivery')`,
        [input.driverId, 'New Delivery Assigned', `You have been assigned shipment ${rows[0]?.shipment_id}.`]
      );
      return NextResponse.json(await loadShipment(id));
    }

    if (action === 'proof') {
      await pool.query(
        `UPDATE shipments SET proof_of_delivery=$1, shipment_status='Delivered', actual_delivery=NOW(), updated_at=NOW() WHERE id=$2`,
        [input.imageUrl, id]
      );
      return NextResponse.json(await loadShipment(id));
    }

    // generic update
    const sets: string[] = ['updated_at=NOW()'];
    const p: any[] = [];
    let i = 1;
    if (input.driverId !== undefined) { sets.push(`driver_id=$${i++}`); p.push(input.driverId); }
    if (input.vehicleId !== undefined) { sets.push(`vehicle_id=$${i++}`); p.push(input.vehicleId); }
    if (input.shipmentStatus) { sets.push(`shipment_status=$${i++}`); p.push(input.shipmentStatus); }
    if (input.currentLocation) { sets.push(`current_location=$${i++}`); p.push(JSON.stringify(input.currentLocation)); }
    if (input.estimatedDelivery) { sets.push(`estimated_delivery=$${i++}`); p.push(input.estimatedDelivery); }
    if (input.notes) { sets.push(`notes=$${i++}`); p.push(input.notes); }
    if (input.priority) { sets.push(`priority=$${i++}`); p.push(input.priority); }
    p.push(id);
    await pool.query(`UPDATE shipments SET ${sets.join(',')} WHERE id=$${i}`, p);
    return NextResponse.json(await loadShipment(id));
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const authUser = await getUser(req);
  if (!authUser || authUser.role !== 'admin')
    return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  try {
    await pool.query('DELETE FROM shipments WHERE id=$1', [params.id]);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
