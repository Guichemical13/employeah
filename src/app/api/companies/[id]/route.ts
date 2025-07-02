import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

/**
 * @route PATCH /api/companies/[id]
 * @desc Edita empresa (SUPER_ADMIN)
 * @access Private
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await verifyToken(req);
  if (!user || (user as any).role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }
  const { id } = await params;
  const body = await req.json();
  const schema = z.object({ name: z.string().min(2) });
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Nome inválido' }, { status: 400 });
  }
  const company = await prisma.company.update({ where: { id: Number(id) }, data: { name: parsed.data.name } });
  return NextResponse.json(company);
}

/**
 * @route DELETE /api/companies/[id]
 * @desc Remove empresa (SUPER_ADMIN)
 * @access Private
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await verifyToken(req);
  if (!user || (user as any).role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }
  const { id } = await params;
  const companyId = Number(id);

  try {
    await prisma.$transaction(async (prisma) => {
      // 1. Primeiro, buscar todos os usuários da empresa
      const users = await prisma.user.findMany({
        where: { companyId },
        select: { id: true }
      });
      
      const userIds = users.map(user => user.id);

      if (userIds.length > 0) {
        // 2. Deletar notificações dos usuários
        await prisma.notification.deleteMany({
          where: { userId: { in: userIds } }
        });

        // 3. Deletar transações de pontos dos usuários
        await prisma.pointTransaction.deleteMany({
          where: { userId: { in: userIds } }
        });

        // 4. Deletar elogios (tanto enviados quanto recebidos)
        await prisma.elogio.deleteMany({
          where: {
            OR: [
              { fromId: { in: userIds } },
              { toId: { in: userIds } }
            ]
          }
        });
      }

      // 5. Deletar itens da empresa
      await prisma.item.deleteMany({ where: { companyId } });

      // 6. Deletar categorias da empresa
      await prisma.category.deleteMany({ where: { companyId } });

      // 7. Deletar usuários da empresa
      await prisma.user.deleteMany({ where: { companyId } });

      // 8. Por fim, deletar a empresa
      await prisma.company.delete({ where: { id: companyId } });
    });

    return NextResponse.json({ success: true, message: 'Empresa deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar empresa:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor', 
        details: error instanceof Error ? error.message : 'Erro desconhecido' 
      },
      { status: 500 }
    );
  }
}
