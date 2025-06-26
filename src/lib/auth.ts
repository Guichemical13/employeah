import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export async function verifyToken(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth) return null;
  const token = auth.replace('Bearer ', '');
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    return payload;
  } catch {
    return null;
  }
}

export function requireRole(user: any, roles: string[]) {
  if (!user || !roles.includes(user.role)) {
    throw new Error('Acesso negado');
  }
}
