import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUser } from '@/lib/middleware/auth';

const mapN = (r: any) => ({
  id: r.id, userId: r.user_id, title: r.title, message: r.message,
  type: r.type, readStatus: r.read_status, link: r.link, createdAt: r.created_at,
});

export async function GET(req: NextRequest) {
  const authUser = await getUser(req);
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { rows } = await pool.query(
      'SELECT * FROM notifications WHERE user_id=$1 ORDER BY created_at DESC LIMIT 50', [authUser.id]
    );
    const unread = rows.filter((r: any) => !r.read_status).length;
    return NextResponse.json({ notifications: rows.map(mapN), unreadCount: unread });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const authUser = await getUser(req);
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    await pool.query('UPDATE notifications SET read_status=true WHERE user_id=$1', [authUser.id]);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
