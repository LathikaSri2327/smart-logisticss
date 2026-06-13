import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import { User } from '@/lib/models';

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
    await dbConnect();
    const user = await User.findOne({ _id: decoded.id, isActive: true }).lean() as any;
    return user ? { id: user._id.toString(), name: user.name, email: user.email, role: user.role } : null;
  } catch {
    return null;
  }
};

export const mapUser = (u: any) =>
  u ? {
    id: u._id?.toString() || u.id,
    name: u.name, email: u.email, role: u.role,
    phone: u.phone, profileImage: u.profileImage, company: u.company,
    address: u.address, isActive: u.isActive, lastLogin: u.lastLogin,
    createdAt: u.createdAt, updatedAt: u.updatedAt,
  } : null;
