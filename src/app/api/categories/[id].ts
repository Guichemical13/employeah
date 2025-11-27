import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { z } from 'zod';

/**
 * @route PATCH /api/categories/[id]
 * @desc Edita categoria (COMPANY_ADMIN ou SUPERVISOR com permissão)
 * @access Private
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await verifyToken(req);
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  
  const userId = (user as any).id;
  const userRole = (user as any).role;
  
  // Verificar permissão para gerenciar catálogo
  const canManageCatalog = await hasPermission(userId, userRole, 'insert_new_items_catalog');
  
  if (!canManageCatalog && !['COMPANY_ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
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
 * @desc Remove categoria (COMPANY_ADMIN ou SUPERVISOR com permissão)
 * @access Private
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await verifyToken(req);
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  
  const userId = (user as any).id;
  const userRole = (user as any).role;
  
  // Verificar permissão para remover itens do catálogo
  const canRemoveCatalog = await hasPermission(userId, userRole, 'remove_items_catalog');
  
  if (!canRemoveCatalog && !['COMPANY_ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
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
