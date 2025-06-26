import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

/**
 * @route POST /api/elogios/[id]/like
 * @desc Dá like em um elogio
 * @access Private
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await verifyToken(req);
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  const elogioId = Number(params.id);
  await prisma.elogio.update({ where: { id: elogioId }, data: { likes: { increment: 1 } } });
  return NextResponse.json({ success: true });
}
