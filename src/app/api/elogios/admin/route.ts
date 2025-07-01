import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

/**
 * @route GET /api/elogios/admin
 * @desc Lista todos os elogios para administradores
 * @access Private (COMPANY_ADMIN, SUPER_ADMIN)
 */
export async function GET(req: NextRequest) {
  const user = await verifyToken(req);
  if (!user || !['COMPANY_ADMIN', 'SUPER_ADMIN'].includes((user as any).role)) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  try {
    const where: any = {};

    // COMPANY_ADMIN só vê elogios da sua empresa
    if ((user as any).role === 'COMPANY_ADMIN') {
      where.OR = [
        { from: { companyId: (user as any).companyId } },
        { to: { companyId: (user as any).companyId } }
      ];
    }

    const [elogios, total] = await Promise.all([
      prisma.elogio.findMany({
        where,
        include: {
          from: {
            select: {
              id: true,
              name: true,
              email: true,
              company: { select: { name: true } }
            }
          },
          to: {
            select: {
              id: true,
              name: true,
              email: true,
              company: { select: { name: true } }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.elogio.count({ where })
    ]);

    return NextResponse.json({
      elogios,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Erro ao buscar elogios:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
