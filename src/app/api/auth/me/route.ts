import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

/**
 * @route GET /api/auth/me
 * @desc Retorna dados do usuário autenticado
 * @access Private
 */
export async function GET(req: NextRequest) {
  const userPayload = await verifyToken(req);
  if (!userPayload) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }
  // Garante que userPayload é JwtPayload
  const id = typeof userPayload === 'string' ? undefined : userPayload.id;
  if (!id) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
  }
  // Busca o usuário completo no banco
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      companyId: true,
      teamId: true,
      mustChangePassword: true,
      points: true,
      username: true,
      profilePicture: true,
      bio: true,
      createdAt: true,
      updatedAt: true,
    }
  });
  if (!user) {
    return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
  }
  return NextResponse.json({ user });
}
