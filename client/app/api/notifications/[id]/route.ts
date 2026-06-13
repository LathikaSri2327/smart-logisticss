import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Notification } from '@/lib/models';
import { getUser } from '@/lib/middleware/auth';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const authUser = await getUser(req);
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await dbConnect();
  try {
    const n = await Notification.findByIdAndUpdate(params.id, { readStatus: true }, { new: true }).lean() as any;
    return NextResponse.json({ id: n._id.toString(), userId: n.user?.toString(), title: n.title, message: n.message, type: n.type, readStatus: n.readStatus, link: n.link, createdAt: n.createdAt });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
