import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

/**
 * @route POST /api/elogios/create
 * @desc Cria um elogio
 * @access Private
 */
export async function POST(req: NextRequest) {
  const user = await verifyToken(req);
  if (!user) return NextResponse.json({ error: 'Acesso negado' }, { status: 401 });

  const body = await req.json();
  
  // Validação com Zod
  const schema = z.object({
    toId: z.number().int().positive(),
    message: z.string().min(1, 'Mensagem é obrigatória').max(1000, 'Mensagem muito longa')
  });

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ 
      error: 'Dados inválidos',
      details: parsed.error.issues 
    }, { status: 400 });
  }

  const { toId, message } = parsed.data;

  try {
    // Buscar dados completos do usuário remetente
    const fromUser = await prisma.user.findUnique({
      where: { id: (user as any).id },
      select: { name: true, companyId: true }
    });

    if (!fromUser) {
      return NextResponse.json({ error: 'Usuário remetente não encontrado' }, { status: 404 });
    }

    // Verificar se o usuário destinatário existe
    const toUser = await prisma.user.findUnique({ 
      where: { id: toId },
      include: { company: true }
    });

    if (!toUser) {
      return NextResponse.json({ error: 'Usuário destinatário não encontrado' }, { status: 404 });
    }

    // Verificar se não está enviando elogio para si mesmo
    if (toId === (user as any).id) {
      return NextResponse.json({ error: 'Você não pode enviar um elogio para si mesmo' }, { status: 400 });
    }

    // Verificar se ambos os usuários pertencem à mesma empresa (exceto SUPER_ADMIN)
    if ((user as any).role !== 'SUPER_ADMIN') {
      if (toUser.companyId !== (user as any).companyId) {
        return NextResponse.json({ error: 'Só é possível enviar elogios para colegas da mesma empresa' }, { status: 403 });
      }
    }

    // Usar transação do banco para garantir consistência
    const result = await prisma.$transaction(async (tx) => {
      // Criar o elogio
      const elogio = await tx.elogio.create({
        data: {
          fromId: (user as any).id,
          toId,
          message: message.trim(),
        },
        include: {
          from: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          to: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      // Adicionar 10 pontos ao destinatário
      const updatedToUser = await tx.user.update({
        where: { id: toId },
        data: { points: { increment: 10 } },
      });

      // Criar transação de pontos
      if (toUser.companyId) {
        await tx.pointTransaction.create({
          data: {
            userId: toId,
            companyId: toUser.companyId,
            amount: 10,
            type: 'award',
            description: `Elogio recebido de ${fromUser.name}`,
          },
        });
      }

      // Criar notificação para o destinatário
      await tx.notification.create({
        data: {
          userId: toId,
          message: `Você recebeu um elogio de ${fromUser.name} e ganhou 10 pontos! 🎉`,
        }
      });

      return { elogio, updatedToUser };
    });

    return NextResponse.json({
      success: true,
      elogio: result.elogio,
      pointsAwarded: 10,
      recipientNewPoints: result.updatedToUser.points
    });

  } catch (error) {
    console.error('Erro ao criar elogio:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
