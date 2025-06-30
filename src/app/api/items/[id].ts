import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

/**
 * @route PATCH /api/items/[id]
 * @desc Edita item (COMPANY_ADMIN)
 * @access Private
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await verifyToken(req);
  if (!user || (user as any).role !== 'COMPANY_ADMIN') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }
  const { id } = await params;
  const body = await req.json();
  const schema = z.object({ name: z.string().optional(), price: z.number().optional(), stock: z.number().optional(), categoryId: z.number().optional() });
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
  }
  const item = await prisma.item.update({ where: { id: Number(id) }, data: parsed.data });
  return NextResponse.json(item);
}

/**
 * @route DELETE /api/items/[id]
 * @desc Remove item (COMPANY_ADMIN)
 * @access Private
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await verifyToken(req);
  if (!user || (user as any).role !== 'COMPANY_ADMIN') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }
  const { id } = await params;
  await prisma.item.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
