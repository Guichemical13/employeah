import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

/**
 * @route GET /api/items
 * @desc Lista itens da empresa (COMPANY_ADMIN ou COLLABORATOR)
 * @access Private
 */
export async function GET(req: NextRequest) {
  const user = await verifyToken(req);
  if (!user) return NextResponse.json([], { status: 401 });
  let items;
  if ((user as any).role === 'SUPER_ADMIN') {
    items = await prisma.item.findMany();
  } else {
    items = await prisma.item.findMany({ where: { companyId: (user as any).companyId } });
  }
  return NextResponse.json(items);
}

/**
 * @route POST /api/items
 * @desc Cria item (COMPANY_ADMIN)
 * @access Private
 */
export async function POST(req: NextRequest) {
  const user = await verifyToken(req);
  if (!user || !['COMPANY_ADMIN', 'SUPER_ADMIN'].includes((user as any).role)) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }
  const body = await req.json();
  const schema = z.object({ name: z.string(), price: z.number(), stock: z.number(), categoryId: z.number().optional(), companyId: z.number().optional() });
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
  }
  // Validação extra: se categoryId foi enviado, garantir que existe
  if (parsed.data.categoryId) {
    const category = await prisma.category.findUnique({ where: { id: parsed.data.categoryId } });
    if (!category) {
      return NextResponse.json({ error: 'Categoria não encontrada' }, { status: 400 });
    }
  }
  let companyId;
  if ((user as any).role === 'SUPER_ADMIN') {
    if (!parsed.data.companyId) {
      return NextResponse.json({ error: 'companyId obrigatório' }, { status: 400 });
    }
    companyId = parsed.data.companyId;
  } else {
    companyId = (user as any).companyId;
  }
  const item = await prisma.item.create({
    data: {
      ...parsed.data,
      companyId,
    },
  });
  return NextResponse.json(item);
}
