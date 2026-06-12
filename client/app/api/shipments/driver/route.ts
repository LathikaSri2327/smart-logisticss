import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUser } from '@/lib/middleware/auth';
import { loadShipment } from '@/lib/utils/shipment';

export async function GET(req: NextRequest) {
  const authUser = await getUser(req);
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { rows } = await pool.query(
      `SELECT id FROM shipments WHERE driver_id=$1 AND shipment_status NOT IN ('Delivered','Cancelled') ORDER BY created_at DESC`,
      [authUser.id]
    );
    const shipments = await Promise.all(rows.map((r: any) => loadShipment(r.id)));
    return NextResponse.json(shipments.filter(Boolean));
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
