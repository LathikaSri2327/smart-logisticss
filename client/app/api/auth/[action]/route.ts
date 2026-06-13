import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import { User } from '@/lib/models';
import { getUser, mapUser } from '@/lib/middleware/auth';

const generateToken = (user: { id: string; role: string }) =>
  jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET!, {
    expiresIn: (process.env.JWT_EXPIRE || '7d') as any,
  });

export async function POST(req: NextRequest, { params }: { params: { action: string } }) {
  const body = await req.json();
  const { action } = params;
  await dbConnect();

  try {
    if (action === 'login') {
      const user = await User.findOne({ email: body.email }).lean() as any;
      if (!user || !(await bcrypt.compare(body.password, user.password)))
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });
      return NextResponse.json({ token: generateToken({ id: user._id.toString(), role: user.role }), user: mapUser(user) });
    }

    if (action === 'register') {
      if (!body.name || !body.email || !body.password)
        return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 });
      if (body.password.length < 6)
        return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
      if (await User.findOne({ email: body.email.toLowerCase().trim() }))
        return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
      const user = await User.create({
        name: body.name.trim(), email: body.email.toLowerCase().trim(),
        password: await bcrypt.hash(body.password, 12),
        role: body.role || 'client', phone: body.phone, company: body.company,
      });
      return NextResponse.json({ token: generateToken({ id: user._id.toString(), role: user.role }), user: mapUser(user) });
    }

    if (action === 'profile') {
      const authUser = await getUser(req);
      if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      const user = await User.findByIdAndUpdate(authUser.id,
        { name: body.name, phone: body.phone, company: body.company, address: body.address },
        { new: true }
      ).lean();
      return NextResponse.json(mapUser(user));
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: { action: string } }) {
  const { action } = params;
  if (action === 'me') {
    const authUser = await getUser(req);
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await dbConnect();
    const user = await User.findById(authUser.id).lean();
    return NextResponse.json(mapUser(user));
  }
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}
