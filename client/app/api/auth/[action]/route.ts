import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '@/lib/db';
import { getUser, mapUser } from '@/lib/middleware/auth';

const generateToken = (user: { id: string; role: string }) =>
  jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET!, {
    expiresIn: (process.env.JWT_EXPIRE || '7d') as any,
  });

export async function POST(req: NextRequest, { params }: { params: { action: string } }) {
  const body = await req.json();
  const { action } = params;

  try {
    if (action === 'login') {
      const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [body.email]);
      const user = rows[0];
      if (!user || !(await bcrypt.compare(body.password, user.password)))
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);
      return NextResponse.json({ token: generateToken(user), user: mapUser(user) });
    }

    if (action === 'register') {
      const existing = await pool.query('SELECT id FROM users WHERE email = $1', [body.email]);
      if (existing.rows.length)
        return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
      const hashed = await bcrypt.hash(body.password, 12);
      const { rows } = await pool.query(
        `INSERT INTO users (name,email,password,role,phone,company) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
        [body.name, body.email, hashed, body.role || 'client', body.phone || null, body.company || null]
      );
      return NextResponse.json({ token: generateToken(rows[0]), user: mapUser(rows[0]) });
    }

    if (action === 'profile') {
      const authUser = await getUser(req);
      if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      const { rows } = await pool.query(
        `UPDATE users SET name=COALESCE($1,name), phone=COALESCE($2,phone),
         company=COALESCE($3,company), address=COALESCE($4,address), updated_at=NOW()
         WHERE id=$5 RETURNING *`,
        [body.name, body.phone, body.company, body.address, authUser.id]
      );
      return NextResponse.json(mapUser(rows[0]));
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
    const { rows } = await pool.query('SELECT * FROM users WHERE id=$1', [authUser.id]);
    return NextResponse.json(mapUser(rows[0]));
  }
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}
