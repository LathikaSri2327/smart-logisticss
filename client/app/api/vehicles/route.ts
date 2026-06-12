import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUser, mapUser } from '@/lib/middleware/auth';
import { mapVehicle } from '@/lib/utils/shipment';

const loadVehicle = async (id: string) => {
  const { rows } = await pool.query('SELECT * FROM vehicles WHERE id=$1', [id]);
  if (!rows[0]) return null;
  const du = rows[0].driver_id ? await pool.query('SELECT * FROM users WHERE id=$1', [rows[0].driver_id]) : null;
  return mapVehicle(rows[0], du?.rows[0] ? mapUser(du.rows[0]) : null);
};

export async function GET(req: NextRequest) {
  const authUser = await getUser(req);
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { rows } = await pool.query('SELECT id FROM vehicles ORDER BY created_at DESC');
    return NextResponse.json(await Promise.all(rows.map((r: any) => loadVehicle(r.id))));
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authUser = await getUser(req);
  if (!authUser || authUser.role !== 'admin')
    return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  const input = await req.json();
  try {
    const { rows } = await pool.query(
      `INSERT INTO vehicles (vehicle_number,type,model,year,capacity,fuel_type,driver_id) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
      [input.vehicleNumber, input.type || 'Truck', input.model, input.year, input.capacity, input.fuelType || 'Diesel', input.driverId || null]
    );
    return NextResponse.json(await loadVehicle(rows[0].id));
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
