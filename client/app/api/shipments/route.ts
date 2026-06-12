import { NextRequest, NextResponse } from 'next/server';
import qrcode from 'qrcode';
import pool from '@/lib/db';
import { getUser } from '@/lib/middleware/auth';
import { loadShipment } from '@/lib/utils/shipment';

export async function GET(req: NextRequest) {
  const authUser = await getUser(req);
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const p = req.nextUrl.searchParams;
  const page = parseInt(p.get('page') || '1');
  const limit = parseInt(p.get('limit') || '10');
  const status = p.get('status');
  const search = p.get('search');
  const shipmentType = p.get('shipmentType');
  const priority = p.get('priority');
  const clientId = p.get('clientId');
  const driverId = p.get('driverId');

  const conds: string[] = [];
  const params: any[] = [];
  let i = 1;

  if (status) { conds.push(`shipment_status=$${i++}`); params.push(status); }
  if (shipmentType) { conds.push(`shipment_type=$${i++}`); params.push(shipmentType); }
  if (priority) { conds.push(`priority=$${i++}`); params.push(priority); }
  if (search) { conds.push(`(shipment_id ILIKE $${i} OR description ILIKE $${i})`); params.push(`%${search}%`); i++; }
  if (authUser.role === 'client' || clientId) { conds.push(`client_id=$${i++}`); params.push(authUser.role === 'client' ? authUser.id : clientId); }
  if (authUser.role === 'driver' || driverId) { conds.push(`driver_id=$${i++}`); params.push(authUser.role === 'driver' ? authUser.id : driverId); }

  const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
  try {
    const total = parseInt((await pool.query(`SELECT COUNT(*) FROM shipments ${where}`, params)).rows[0].count);
    const { rows } = await pool.query(
      `SELECT * FROM shipments ${where} ORDER BY created_at DESC LIMIT $${i} OFFSET $${i + 1}`,
      [...params, limit, (page - 1) * limit]
    );
    const shipments = await Promise.all(rows.map((r: any) => loadShipment(r.id)));
    return NextResponse.json({ shipments: shipments.filter(Boolean), totalCount: total, totalPages: Math.ceil(total / limit), currentPage: page });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authUser = await getUser(req);
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const input = await req.json();

  try {
    const shipmentId = `SHP-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    const qrCode = await qrcode.toDataURL(shipmentId);
    const history = [{ status: 'Pending', location: input.source?.address, note: 'Shipment created', timestamp: new Date().toISOString() }];
    const { rows } = await pool.query(
      `INSERT INTO shipments (shipment_id,client_id,source,destination,shipment_type,priority,weight,value,description,estimated_delivery,notes,insurance,qr_code,shipment_history)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING id`,
      [shipmentId, input.clientId, JSON.stringify(input.source), JSON.stringify(input.destination),
        input.shipmentType || 'Standard', input.priority || 'Normal', input.weight, input.value,
        input.description, input.estimatedDelivery, input.notes, input.insurance || false, qrCode, JSON.stringify(history)]
    );
    await pool.query(
      `INSERT INTO notifications (user_id,title,message,type) VALUES ($1,$2,$3,'shipment')`,
      [input.clientId, 'Shipment Created', `Your shipment ${shipmentId} has been created.`]
    );
    return NextResponse.json(await loadShipment(rows[0].id));
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
