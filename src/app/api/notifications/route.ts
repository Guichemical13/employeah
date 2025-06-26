import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

/**
 * @route GET /api/notifications
 * @desc Lista notificações do usuário autenticado
 * @access Private
 */
export async function GET(req: NextRequest) {
  const user = await verifyToken(req);
  if (!user) return NextResponse.json({ error: 'Acesso negado' }, { status: 401 });

  let notifications;

  if ((user as any).role === 'SUPER_ADMIN') {
    // SUPER_ADMIN vê todas as notificações
    notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            companyId: true,
          }
        }
      }
    });
  } else if ((user as any).role === 'COMPANY_ADMIN') {
    // COMPANY_ADMIN vê notificações dos usuários da sua empresa
    notifications = await prisma.notification.findMany({
      where: {
        user: {
          companyId: (user as any).companyId
        }
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            companyId: true,
          }
        }
      }
    });
  } else {
    // COLLABORATOR vê apenas suas próprias notificações
    notifications = await prisma.notification.findMany({
      where: { userId: (user as any).id },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            companyId: true,
          }
        }
      }
    });
  }

  return NextResponse.json(notifications);
}

/**
 * @route PATCH /api/notifications
 * @desc Marca todas as notificações como lidas
 * @access Private
 */
export async function PATCH(req: NextRequest) {
  const user = await verifyToken(req);
  if (!user) return NextResponse.json({ error: 'Acesso negado' }, { status: 401 });

  if ((user as any).role === 'SUPER_ADMIN') {
    // SUPER_ADMIN marca todas as notificações como lidas
    await prisma.notification.updateMany({
      where: { read: false },
      data: { read: true },
    });
  } else if ((user as any).role === 'COMPANY_ADMIN') {
    // COMPANY_ADMIN marca como lidas apenas as notificações dos usuários da sua empresa
    await prisma.notification.updateMany({
      where: {
        read: false,
        user: {
          companyId: (user as any).companyId
        }
      },
      data: { read: true },
    });
  } else {
    // COLLABORATOR marca apenas suas próprias notificações como lidas
    await prisma.notification.updateMany({
      where: { 
        userId: (user as any).id,
        read: false 
      },
      data: { read: true },
    });
  }

  return NextResponse.json({ success: true });
}
