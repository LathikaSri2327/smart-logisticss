import jwt from 'jsonwebtoken';
import pool from '@/lib/db';

export interface AuthUser {
  id: string;
  role: string;
  email: string;
  name: string;
}

export const getUser = async (req: Request): Promise<AuthUser | null> => {
  const token = req.headers.get('authorization') || '';
  if (!token) return null;
  try {
    const bearer = token.startsWith('Bearer ') ? token.slice(7) : token;
    const decoded = jwt.verify(bearer, process.env.JWT_SECRET!) as { id: string };
    const { rows } = await pool.query(
      'SELECT id, name, email, role FROM users WHERE id = $1 AND is_active = true',
      [decoded.id]
    );
    return rows[0] ?? null;
  } catch {
    return null;
  }
};

export const mapUser = (r: any) =>
  r ? {
    id: r.id, name: r.name, email: r.email, role: r.role,
    phone: r.phone, profileImage: r.profile_image, company: r.company,
    address: r.address, isActive: r.is_active, lastLogin: r.last_login,
    createdAt: r.created_at, updatedAt: r.updated_at,
  } : null;
