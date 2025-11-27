import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { z } from 'zod';

/**
 * @route PATCH /api/items/[id]
 * @desc Edita item (COMPANY_ADMIN, SUPERVISOR ou usuário com permissão)
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
  
  if (!canManageCatalog) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }
  
  const { id } = await params;
  const body = await req.json();
  const schema = z.object({ 
    name: z.string().optional(), 
    description: z.string().optional(),
    imageUrl: z.string().url().optional().or(z.literal('')),
    price: z.number().optional(), 
    stock: z.number().optional(), 
    categoryId: z.number().optional().nullable()
  });
  
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
  }
  
  // Verificar se item pertence à empresa do usuário
  if (userRole !== 'SUPER_ADMIN') {
    const item = await prisma.item.findUnique({ where: { id: Number(id) } });
    if (!item || item.companyId !== (user as any).companyId) {
      return NextResponse.json({ error: 'Acesso negado ao item' }, { status: 403 });
    }
  }
  
  const item = await prisma.item.update({ 
    where: { id: Number(id) }, 
    data: parsed.data,
    include: {
      category: { select: { name: true } }
    }
  });
  
  return NextResponse.json(item);
}

/**
 * @route DELETE /api/items/[id]
 * @desc Remove item (COMPANY_ADMIN, SUPERVISOR ou usuário com permissão)
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
  
  if (!canRemoveCatalog) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }
  
  const { id } = await params;
  
  // Verificar se item pertence à empresa do usuário
  if (userRole !== 'SUPER_ADMIN') {
    const item = await prisma.item.findUnique({ where: { id: Number(id) } });
    if (!item || item.companyId !== (user as any).companyId) {
      return NextResponse.json({ error: 'Acesso negado ao item' }, { status: 403 });
    }
  }
  
  await prisma.item.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
