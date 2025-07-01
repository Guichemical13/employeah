import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

/**
 * @route GET /api/debug/data
 * @desc Debug - Verifica dados no banco
 * @access Private
 */
export async function GET(req: NextRequest) {
  const user = await verifyToken(req);
  if (!user) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }

  try {
    const [companies, users, elogios, transactions] = await Promise.all([
      prisma.company.count(),
      prisma.user.count(),
      prisma.elogio.count(),
      prisma.pointTransaction.count()
    ]);

    const currentUserCompany = await prisma.user.findUnique({
      where: { id: (user as any).id },
      include: { company: true }
    });

    const usersInCompany = await prisma.user.findMany({
      where: { companyId: (user as any).companyId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        points: true,
        companyId: true
      }
    });

    return NextResponse.json({
      debug: {
        currentUser: {
          id: (user as any).id,
          name: (user as any).name,
          role: (user as any).role,
          companyId: (user as any).companyId,
          company: currentUserCompany?.company
        },
        counts: {
          companies,
          users,
          elogios,
          transactions
        },
        usersInCompany: {
          count: usersInCompany.length,
          users: usersInCompany
        }
      }
    });

  } catch (error) {
    console.error('Erro no debug:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
