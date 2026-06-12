import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUser, mapUser } from '@/lib/middleware/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const authUser = await getUser(req);
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE id=$1', [params.id]);
    return NextResponse.json(mapUser(rows[0]));
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
