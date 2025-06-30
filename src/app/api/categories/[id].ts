import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

/**
 * @route PATCH /api/categories/[id]
 * @desc Edita categoria (COMPANY_ADMIN)
 * @access Private
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await verifyToken(req);
  if (!user || !['COMPANY_ADMIN', 'SUPER_ADMIN'].includes((user as any).role)) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }
  const { id } = await params;
  const body = await req.json();
  const schema = z.object({ name: z.string().min(2) });
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Nome inválido' }, { status: 400 });
  }
  // COMPANY_ADMIN só pode editar categorias da sua empresa
  if ((user as any).role === 'COMPANY_ADMIN') {
    const category = await prisma.category.findUnique({ where: { id: Number(id) } });
    if (!category || category.companyId !== (user as any).companyId) {
      return NextResponse.json({ error: 'Acesso negado à categoria' }, { status: 403 });
    }
  }
  const category = await prisma.category.update({ where: { id: Number(id) }, data: { name: parsed.data.name } });
  return NextResponse.json(category);
}

/**
 * @route DELETE /api/categories/[id]
 * @desc Remove categoria (COMPANY_ADMIN)
 * @access Private
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await verifyToken(req);
  if (!user || !['COMPANY_ADMIN', 'SUPER_ADMIN'].includes((user as any).role)) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }
  const { id } = await params;
  // COMPANY_ADMIN só pode excluir categorias da sua empresa
  if ((user as any).role === 'COMPANY_ADMIN') {
    const category = await prisma.category.findUnique({ where: { id: Number(id) } });
    if (!category || category.companyId !== (user as any).companyId) {
      return NextResponse.json({ error: 'Acesso negado à categoria' }, { status: 403 });
    }
  }
  await prisma.category.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
