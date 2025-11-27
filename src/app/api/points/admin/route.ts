import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

/**
 * @route POST /api/points/admin
 * @desc Admin adiciona ou remove pontos de um funcionário
 * @access Private (COMPANY_ADMIN, SUPER_ADMIN)
 */
export async function POST(req: NextRequest) {
  const user = await verifyToken(req);
  if (!user || !['COMPANY_ADMIN', 'SUPER_ADMIN', 'SUPERVISOR'].includes((user as any).role)) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }

  const body = await req.json();
  const schema = z.object({
    userId: z.number().int().positive(),
    amount: z.number().int(),
    description: z.string().min(1, 'Motivo é obrigatório').max(500),
  });

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ 
      error: 'Dados inválidos',
      details: parsed.error.issues 
    }, { status: 400 });
  }

  const { userId, amount, description } = parsed.data;

  try {
    // Verificar se o usuário existe e pertence à empresa (se COMPANY_ADMIN)
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { company: true }
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // COMPANY_ADMIN só pode gerenciar pontos de sua própria empresa
    if ((user as any).role === 'COMPANY_ADMIN') {
      if (targetUser.companyId !== (user as any).companyId) {
        return NextResponse.json({ error: 'Acesso negado a este usuário' }, { status: 403 });
      }
    }

    // SUPERVISOR só pode gerenciar pontos dos membros de seus times
    if ((user as any).role === 'SUPERVISOR') {
      const supervisorTeams = await prisma.team.findMany({
        where: {
          supervisors: { some: { id: (user as any).id } }
        },
        include: { members: { select: { id: true } } }
      });

      const teamMemberIds = supervisorTeams.flatMap(team => team.members.map(m => m.id));
      
      if (!teamMemberIds.includes(userId)) {
        return NextResponse.json({ error: 'Acesso negado. Você só pode gerenciar pontos dos membros do seu time.' }, { status: 403 });
      }
    }

    // Verificar se o usuário terá pontos suficientes após a operação (se for remoção)
    if (amount < 0 && targetUser.points + amount < 0) {
      return NextResponse.json({ 
        error: `Usuário possui apenas ${targetUser.points} pontos. Não é possível remover ${Math.abs(amount)} pontos.` 
      }, { status: 400 });
    }

    // Determinar o tipo da transação
    const transactionType = amount > 0 ? 'admin_add' : 'admin_remove';

    // Executar transação no banco
    const [updatedUser, transaction] = await prisma.$transaction([
      // Atualizar pontos do usuário
      prisma.user.update({
        where: { id: userId },
        data: { points: { increment: amount } }
      }),
      // Registrar a transação
      prisma.pointTransaction.create({
        data: {
          userId,
          companyId: targetUser.companyId!,
          amount,
          type: transactionType,
          description,
          adminName: (user as any).name
        }
      })
    ]);

    // Criar notificação para o usuário
    await prisma.notification.create({
      data: {
        userId,
        message: amount > 0 
          ? `Você recebeu ${amount} pontos! Motivo: ${description}`
          : `${Math.abs(amount)} pontos foram removidos da sua conta. Motivo: ${description}`,
      }
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        points: updatedUser.points
      },
      transaction: {
        id: transaction.id,
        amount: transaction.amount,
        type: transaction.type,
        description: transaction.description,
        adminName: transaction.adminName,
        createdAt: transaction.createdAt
      }
    });

  } catch (error) {
    console.error('Erro ao gerenciar pontos:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

/**
 * @route GET /api/points/admin
 * @desc Lista histórico de transações de pontos gerenciadas por admin
 * @access Private (COMPANY_ADMIN, SUPER_ADMIN)
 */
export async function GET(req: NextRequest) {
  const user = await verifyToken(req);
  if (!user || !['COMPANY_ADMIN', 'SUPER_ADMIN', 'SUPERVISOR'].includes((user as any).role)) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const userId = searchParams.get('userId');

  try {
    const where: any = {
      type: { in: ['admin_add', 'admin_remove'] }
    };

    // COMPANY_ADMIN só vê transações da sua empresa
    if ((user as any).role === 'COMPANY_ADMIN') {
      where.companyId = (user as any).companyId;
    }

    // SUPERVISOR só vê transações dos membros de seus times
    if ((user as any).role === 'SUPERVISOR') {
      const supervisorTeams = await prisma.team.findMany({
        where: {
          supervisors: { some: { id: (user as any).id } }
        },
        include: { members: { select: { id: true } } }
      });

      const teamMemberIds = supervisorTeams.flatMap(team => team.members.map(m => m.id));
      where.userId = { in: teamMemberIds };
    }

    // Filtrar por usuário específico se fornecido
    if (userId) {
      where.userId = parseInt(userId);
    }

    const [transactions, total] = await Promise.all([
      prisma.pointTransaction.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.pointTransaction.count({ where })
    ]);

    return NextResponse.json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
