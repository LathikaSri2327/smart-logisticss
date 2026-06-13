import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { User } from '@/lib/models';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();
    const users = await User.find({}, { email: 1, role: 1, isActive: 1 }).lean();
    return NextResponse.json({ connected: true, userCount: users.length, users });
  } catch (e: any) {
    return NextResponse.json({ connected: false, error: e.message }, { status: 500 });
  }
}
