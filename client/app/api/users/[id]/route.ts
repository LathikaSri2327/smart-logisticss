import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { User } from '@/lib/models';
import { getUser, mapUser } from '@/lib/middleware/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const authUser = await getUser(req);
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await dbConnect();
  try {
    const user = await User.findById(params.id).lean();
    return NextResponse.json(mapUser(user));
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
