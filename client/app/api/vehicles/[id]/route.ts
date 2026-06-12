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

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const authUser = await getUser(req);
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const input = await req.json();
  try {
    if (input._action === 'location') {
      await pool.query(
        'UPDATE vehicles SET current_location=$1, updated_at=NOW() WHERE id=$2',
        [JSON.stringify({ address: input.address, coordinates: { lat: input.lat, lng: input.lng } }), params.id]
      );
    } else {
      await pool.query('UPDATE vehicles SET status=$1, updated_at=NOW() WHERE id=$2', [input.status, params.id]);
    }
    return NextResponse.json(await loadVehicle(params.id));
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
