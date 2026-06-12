import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUser, mapUser } from '@/lib/middleware/auth';

export async function GET(req: NextRequest) {
  const authUser = await getUser(req);
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const role = req.nextUrl.searchParams.get('role');
  try {
    const { rows } = role
      ? await pool.query('SELECT * FROM users WHERE role=$1 ORDER BY created_at DESC', [role])
      : await pool.query('SELECT * FROM users ORDER BY created_at DESC');
    return NextResponse.json(rows.map(mapUser));
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
