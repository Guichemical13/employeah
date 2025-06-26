import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

/**
 * @route POST /api/elogios/create
 * @desc Cria um elogio
 * @access Private
 */
export async function POST(req: NextRequest) {
  const user = await verifyToken(req);
  if (!user) return NextResponse.json({ error: 'Acesso negado' }, { status: 401 });
  const body = await req.json();
  // Adapte a validação conforme necessário
  if (!body.toId || !body.message) {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
  }
  // Cria o elogio
  const elogio = await prisma.elogio.create({
    data: {
      fromId: (user as any).id,
      toId: body.toId,
      message: body.message,
    },
  });
  // Adiciona 10 pontos ao destinatário
  await prisma.user.update({
    where: { id: body.toId },
    data: { points: { increment: 10 } },
  });
  // Cria transação de pontos
  const toUser = await prisma.user.findUnique({ where: { id: body.toId } });
  if (toUser && toUser.companyId) {
    await prisma.pointTransaction.create({
      data: {
        userId: body.toId,
        companyId: toUser.companyId,
        amount: 10,
        type: 'award',
      },
    });
  }
  return NextResponse.json(elogio);
}
