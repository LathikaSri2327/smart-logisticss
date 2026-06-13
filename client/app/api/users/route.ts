import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { User } from '@/lib/models';
import { getUser, mapUser } from '@/lib/middleware/auth';

export async function GET(req: NextRequest) {
  const authUser = await getUser(req);
  if (!authUser || authUser.role !== 'admin')
    return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  await dbConnect();
  const role = req.nextUrl.searchParams.get('role');
  try {
    const users = await User.find(role ? { role } : {}).sort({ createdAt: -1 }).lean();
    return NextResponse.json(users.map(mapUser));
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
