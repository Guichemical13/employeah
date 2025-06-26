import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

/**
 * @route GET /api/elogios
 * @desc Lista elogios recebidos pelo usuário autenticado
 * @access Private
 */
export async function GET(req: NextRequest) {
  const user = await verifyToken(req);
  if (!user) return NextResponse.json([], { status: 401 });
  let elogios;
  if ((user as any).role === 'SUPER_ADMIN') {
    elogios = await prisma.elogio.findMany({ orderBy: { createdAt: 'desc' } });
  } else {
    elogios = await prisma.elogio.findMany({
      where: { toId: (user as any).id },
      orderBy: { createdAt: 'desc' },
    });
  }
  return NextResponse.json(elogios);
}
