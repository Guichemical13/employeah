import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

/**
 * @route POST /api/points/spend
 * @desc Resgata um item (COLLABORATOR)
 * @access Private
 */
export async function POST(req: NextRequest) {
  const user = await verifyToken(req);
  if (!user || typeof user !== 'object' || user.role !== 'COLLABORATOR' || !('id' in user)) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }
  const body = await req.json();
  const schema = z.object({ itemId: z.number() });
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
  }
  const item = await prisma.item.findUnique({ where: { id: parsed.data.itemId } });
  if (!item || item.stock < 1) {
    return NextResponse.json({ error: 'Item indisponível' }, { status: 400 });
  }
  const dbUser = await prisma.user.findUnique({ where: { id: (user as any).id } });
  if (!dbUser || dbUser.points < item.price) {
    return NextResponse.json({ error: 'Saldo insuficiente' }, { status: 400 });
  }
  await prisma.$transaction([
    prisma.user.update({ where: { id: dbUser.id }, data: { points: { decrement: item.price } } }),
    prisma.item.update({ where: { id: item.id }, data: { stock: { decrement: 1 } } }),
    prisma.pointTransaction.create({
      data: {
        userId: dbUser.id,
        companyId: dbUser.companyId!,
        amount: -item.price,
        type: 'spend',
      },
    }),
  ]);
  return NextResponse.json({ success: true });
}
