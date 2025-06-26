import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

/**
 * @route POST /api/points/spend
 * @desc Resgata um ou mais itens (carrinho)
 * @access Private
 */
export async function POST(req: NextRequest) {
  const user = await verifyToken(req);
  if (!user) return NextResponse.json({ error: 'Acesso negado' }, { status: 401 });
  const body = await req.json();
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: 'Carrinho vazio' }, { status: 400 });
  }
  // Busca itens e calcula total
  const itemIds = body.items.map((i: any) => i.itemId ?? i.id);
  const dbItems = await prisma.item.findMany({ where: { id: { in: itemIds } } });
  let total = 0;
  for (const cartItem of body.items) {
    const dbItem = dbItems.find(i => i.id === (cartItem.itemId ?? cartItem.id));
    if (!dbItem) return NextResponse.json({ error: `Item ${cartItem.itemId ?? cartItem.id} não encontrado` }, { status: 400 });
    if (dbItem.stock < cartItem.quantity) return NextResponse.json({ error: `Estoque insuficiente para ${dbItem.name}` }, { status: 400 });
    total += dbItem.price * cartItem.quantity;
  }

  // Busca saldo atualizado do usuário
  const dbUser = await prisma.user.findUnique({ where: { id: (user as any).id } });
  if (!dbUser) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
  if (dbUser.points < total) {
    return NextResponse.json({ error: 'Pontos insuficientes' }, { status: 400 });
  }

  // Prepara o nome do usuário e a lista de itens para as notificações
  const userName = dbUser.name;
  const itemNames = body.items.map((cartItem: any) => {
    const dbItem = dbItems.find(i => i.id === (cartItem.itemId ?? cartItem.id));
    return `${dbItem?.name} (${cartItem.quantity}x)`;
  }).join(', ');

  // Transação atômica: atualiza estoque, pontos, transação e notificações
  const result = await prisma.$transaction(async (tx) => {
    // Atualiza estoque
    for (const cartItem of body.items) {
      await tx.item.update({
        where: { id: cartItem.itemId ?? cartItem.id },
        data: { stock: { decrement: cartItem.quantity } },
      });
    }
    // Debita pontos
    await tx.user.update({
      where: { id: (user as any).id },
      data: { points: { decrement: total } },
    });
    // Cria transação
    await tx.pointTransaction.create({
      data: {
        userId: (user as any).id,
        companyId: (user as any).companyId,
        amount: -total,
        type: 'spend',
      },
    });

    // Cria notificações
    // Notificação para o usuário
    await tx.notification.create({
      data: {
        userId: (user as any).id,
        message: `Você resgatou com sucesso: ${itemNames}`,
      },
    });

    // Notificação para admins (excluindo o próprio usuário se ele for admin)
    const adminUsers = await tx.user.findMany({
      where: {
        companyId: (user as any).companyId,
        role: { in: ['SUPER_ADMIN', 'COMPANY_ADMIN'] },
        id: { not: (user as any).id }, // Exclui o próprio usuário
      },
    });
    for (const admin of adminUsers) {
      await tx.notification.create({
        data: {
          userId: admin.id,
          message: `${userName} resgatou: ${itemNames}`,
        },
      });
    }
    return true;
  });

  return NextResponse.json({ success: true });
}
