import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

/**
 * @route DELETE /api/elogios/[id]
 * @desc Remove um elogio (COMPANY_ADMIN, SUPER_ADMIN)
 * @access Private
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await verifyToken(req);
  if (!user || !['COMPANY_ADMIN', 'SUPER_ADMIN'].includes((user as any).role)) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }

  const { id } = await params;
  const elogioId = parseInt(id);

  if (isNaN(elogioId)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  try {
    // Buscar o elogio com informações dos usuários
    const elogio = await prisma.elogio.findUnique({
      where: { id: elogioId },
      include: {
        from: { select: { companyId: true, name: true } },
        to: { select: { companyId: true, name: true } }
      }
    });

    if (!elogio) {
      return NextResponse.json({ error: 'Elogio não encontrado' }, { status: 404 });
    }

    // COMPANY_ADMIN só pode deletar elogios relacionados à sua empresa
    if ((user as any).role === 'COMPANY_ADMIN') {
      const userCompanyId = (user as any).companyId;
      if (elogio.from.companyId !== userCompanyId && elogio.to.companyId !== userCompanyId) {
        return NextResponse.json({ error: 'Acesso negado a este elogio' }, { status: 403 });
      }
    }

    // Deletar o elogio
    await prisma.elogio.delete({
      where: { id: elogioId }
    });

    // Criar notificação para o remetente informando sobre a exclusão
    await prisma.notification.create({
      data: {
        userId: elogio.fromId,
        message: `Seu elogio para ${elogio.to.name} foi removido por um administrador.`
      }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Erro ao deletar elogio:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

/**
 * @route GET /api/elogios/[id]
 * @desc Busca um elogio específico
 * @access Private
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await verifyToken(req);
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const { id } = await params;
  const elogioId = parseInt(id);

  if (isNaN(elogioId)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  try {
    const elogio = await prisma.elogio.findUnique({
      where: { id: elogioId },
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

    if (!elogio) {
      return NextResponse.json({ error: 'Elogio não encontrado' }, { status: 404 });
    }

    // Verificar permissões de visualização
    const canView = (user as any).role === 'SUPER_ADMIN' ||
                   (user as any).role === 'COMPANY_ADMIN' ||
                   elogio.fromId === (user as any).id ||
                   elogio.toId === (user as any).id;

    if (!canView) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    return NextResponse.json(elogio);

  } catch (error) {
    console.error('Erro ao buscar elogio:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
