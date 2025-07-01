import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

/**
 * @route PATCH /api/notifications/[id]
 * @desc Marca uma notificação específica como lida
 * @access Private
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await verifyToken(req);
  if (!user) return NextResponse.json({ error: 'Acesso negado' }, { status: 401 });

  const { id } = await params;
  const notificationId = parseInt(id);
  
  // Busca a notificação com informações do usuário
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
    include: {
      user: {
        select: {
          id: true,
          companyId: true
        }
      }
    }
  });

  if (!notification) {
    return NextResponse.json({ error: 'Notificação não encontrada' }, { status: 404 });
  }

  // Verifica permissões
  let canUpdate = false;
  
  if ((user as any).role === 'SUPER_ADMIN') {
    canUpdate = true; // SUPER_ADMIN pode marcar qualquer notificação
  } else if ((user as any).role === 'COMPANY_ADMIN') {
    canUpdate = notification.user.companyId === (user as any).companyId; // COMPANY_ADMIN apenas da sua empresa
  } else {
    canUpdate = notification.userId === (user as any).id; // COLLABORATOR apenas suas próprias
  }

  if (!canUpdate) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }

  const updatedNotification = await prisma.notification.update({
    where: { id: notificationId },
    data: { read: true },
  });

  return NextResponse.json(updatedNotification);
}

/**
 * @route DELETE /api/notifications/[id]
 * @desc Deleta uma notificação específica
 * @access Private
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await verifyToken(req);
  if (!user) return NextResponse.json({ error: 'Acesso negado' }, { status: 401 });

  const { id } = await params;
  const notificationId = parseInt(id);
  
  // Busca a notificação com informações do usuário
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
    include: {
      user: {
        select: {
          id: true,
          companyId: true
        }
      }
    }
  });

  if (!notification) {
    return NextResponse.json({ error: 'Notificação não encontrada' }, { status: 404 });
  }

  // Verifica permissões - apenas o próprio usuário pode deletar suas notificações
  // ou admins podem deletar notificações de usuários da sua empresa
  let canDelete = false;
  
  if ((user as any).role === 'SUPER_ADMIN') {
    canDelete = true; // SUPER_ADMIN pode deletar qualquer notificação
  } else if ((user as any).role === 'COMPANY_ADMIN') {
    canDelete = notification.user.companyId === (user as any).companyId; // COMPANY_ADMIN apenas da sua empresa
  } else {
    canDelete = notification.userId === (user as any).id; // COLLABORATOR apenas suas próprias
  }

  if (!canDelete) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }

  await prisma.notification.delete({
    where: { id: notificationId },
  });

  return NextResponse.json({ success: true, message: 'Notificação deletada com sucesso' });
}
