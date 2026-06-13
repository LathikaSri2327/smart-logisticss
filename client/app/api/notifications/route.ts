import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Notification } from '@/lib/models';
import { getUser } from '@/lib/middleware/auth';

const mapN = (n: any) => ({
  id: n._id.toString(), userId: n.user?.toString(), title: n.title,
  message: n.message, type: n.type, readStatus: n.readStatus, link: n.link, createdAt: n.createdAt,
});

export async function GET(req: NextRequest) {
  const authUser = await getUser(req);
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await dbConnect();
  try {
    const notifications = await Notification.find({ user: authUser.id }).sort({ createdAt: -1 }).limit(50).lean() as any[];
    const unread = notifications.filter((n: any) => !n.readStatus).length;
    return NextResponse.json({ notifications: notifications.map(mapN), unreadCount: unread });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const authUser = await getUser(req);
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await dbConnect();
  try {
    await Notification.updateMany({ user: authUser.id }, { readStatus: true });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
