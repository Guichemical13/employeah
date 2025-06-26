import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

/**
 * @route PATCH /api/companies/[id]
 * @desc Edita empresa (SUPER_ADMIN)
 * @access Private
 */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await verifyToken(req);
  if (!user || (user as any).role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }
  const body = await req.json();
  const schema = z.object({ name: z.string().min(2) });
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Nome inválido' }, { status: 400 });
  }
  const company = await prisma.company.update({ where: { id: Number(params.id) }, data: { name: parsed.data.name } });
  return NextResponse.json(company);
}

/**
 * @route DELETE /api/companies/[id]
 * @desc Remove empresa (SUPER_ADMIN)
 * @access Private
 */
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await verifyToken(req);
  if (!user || (user as any).role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }
  const companyId = Number(params.id);
  // Remove elogios relacionados aos usuários da empresa
  await prisma.elogio.deleteMany({
    where: {
      OR: [
        { to: { companyId: companyId } },
        { from: { companyId: companyId } },
      ],
    },
  });
  // Remove transações de pontos da empresa
  await prisma.pointTransaction.deleteMany({ where: { companyId } });
  // Remove itens da empresa
  await prisma.item.deleteMany({ where: { companyId } });
  // Remove categorias da empresa
  await prisma.category.deleteMany({ where: { companyId } });
  // Remove usuários da empresa
  await prisma.user.deleteMany({ where: { companyId } });
  // Por fim, remove a empresa
  await prisma.company.delete({ where: { id: companyId } });
  return NextResponse.json({ success: true });
}
