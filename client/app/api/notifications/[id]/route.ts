import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUser } from '@/lib/middleware/auth';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const authUser = await getUser(req);
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { rows } = await pool.query(
      'UPDATE notifications SET read_status=true WHERE id=$1 RETURNING *', [params.id]
    );
    const r = rows[0];
    return NextResponse.json({ id: r.id, userId: r.user_id, title: r.title, message: r.message, type: r.type, readStatus: r.read_status, link: r.link, createdAt: r.created_at });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
