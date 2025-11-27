import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

const orderSchema = z.object({
  items: z.array(z.object({
    id: z.number(),
    quantity: z.number().min(1)
  })).min(1),
  customerData: z.object({
    nome: z.string().min(1),
    email: z.string().email(),
    telefone: z.string().min(1),
  }),
  shippingAddress: z.object({
    cep: z.string(),
    logradouro: z.string(),
    numero: z.string(),
    complemento: z.string().optional(),
    bairro: z.string(),
    localidade: z.string(),
    uf: z.string(),
  })
});

/**
 * @route POST /api/orders/create
 * @desc Cria um pedido de resgate de itens
 * @access Private
 */
export async function POST(req: NextRequest) {
  const user = await verifyToken(req);
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const body = await req.json();
  const parsed = orderSchema.safeParse(body);
  
  if (!parsed.success) {
    return NextResponse.json({ 
      error: 'Dados inválidos', 
      details: parsed.error.errors 
    }, { status: 400 });
  }

  const { items: orderItems, customerData, shippingAddress } = parsed.data;
  const userId = (user as any).id;
  const companyId = (user as any).companyId;

  try {
    // Buscar os itens do banco
    const items = await prisma.item.findMany({
      where: {
        id: { in: orderItems.map(i => i.id) }
      }
    });

    if (items.length !== orderItems.length) {
      return NextResponse.json({ error: 'Alguns itens não foram encontrados' }, { status: 400 });
    }

    // Calcular total de pontos
    let totalPoints = 0;
    const itemsDetails = [];
    
    for (const orderItem of orderItems) {
      const item = items.find(i => i.id === orderItem.id);
      if (!item) continue;
      
      // Verificar estoque
      if (item.stock < orderItem.quantity) {
        return NextResponse.json({ 
          error: `Estoque insuficiente para ${item.name}` 
        }, { status: 400 });
      }
      
      totalPoints += item.price * orderItem.quantity;
      itemsDetails.push({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: orderItem.quantity,
        total: item.price * orderItem.quantity
      });
    }

    // Buscar usuário para verificar pontos
    const currentUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    if (currentUser.points < totalPoints) {
      return NextResponse.json({ 
        error: 'Pontos insuficientes',
        required: totalPoints,
        available: currentUser.points
      }, { status: 400 });
    }

    // Criar transação de pontos
    await prisma.pointTransaction.create({
      data: {
        userId,
        companyId,
        amount: -totalPoints,
        type: 'PURCHASE',
        description: `Compra de ${itemsDetails.length} ${itemsDetails.length === 1 ? 'item' : 'itens'}: ${itemsDetails.map(i => `${i.name} (${i.quantity}x)`).join(', ')}`,
      }
    });

    // Atualizar pontos do usuário
    await prisma.user.update({
      where: { id: userId },
      data: { points: currentUser.points - totalPoints }
    });

    // Atualizar estoque dos itens
    for (const orderItem of orderItems) {
      const item = items.find(i => i.id === orderItem.id);
      if (item) {
        await prisma.item.update({
          where: { id: item.id },
          data: { stock: item.stock - orderItem.quantity }
        });
      }
    }

    // Criar notificação para admins da empresa
    const admins = await prisma.user.findMany({
      where: {
        companyId,
        role: 'COMPANY_ADMIN'
      }
    });

    // Buscar supervisores
    const supervisors = await prisma.user.findMany({
      where: {
        companyId,
        role: 'SUPERVISOR'
      }
    });

    const orderMessage = `Novo pedido de ${currentUser.name}: ${itemsDetails.map(i => `${i.name} (${i.quantity}x)`).join(', ')} - Total: ${totalPoints} pontos. Endereço: ${shippingAddress.logradouro}, ${shippingAddress.numero}, ${shippingAddress.bairro}, ${shippingAddress.localidade}/${shippingAddress.uf}`;

    // Notificar admins
    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          message: orderMessage,
        }
      });
    }

    // Notificar supervisores
    for (const supervisor of supervisors) {
      await prisma.notification.create({
        data: {
          userId: supervisor.id,
          message: orderMessage,
        }
      });
    }

    // TODO: Enviar e-mail para o funcionário com recibo
    // TODO: Enviar e-mail para admins e supervisores

    return NextResponse.json({
      success: true,
      message: 'Pedido realizado com sucesso!',
      order: {
        items: itemsDetails,
        total: totalPoints,
        customerData,
        shippingAddress,
      }
    });

  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    return NextResponse.json({ 
      error: 'Erro ao processar pedido',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
