import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

/**
 * @route GET /api/categories
 * @desc Lista categorias da empresa (COMPANY_ADMIN ou COLLABORATOR)
 * @access Private
 */
export async function GET(req: NextRequest) {
  const user = await verifyToken(req);
  if (!user) return NextResponse.json([], { status: 401 });
  let categories;
  if ((user as any).role === 'SUPER_ADMIN') {
    categories = await prisma.category.findMany();
  } else {
    categories = await prisma.category.findMany({ where: { companyId: (user as any).companyId } });
  }
  return NextResponse.json(categories);
}

/**
 * @route POST /api/categories
 * @desc Cria categoria (COMPANY_ADMIN)
 * @access Private
 */
export async function POST(req: NextRequest) {
  const user = await verifyToken(req);
  if (!user || !['COMPANY_ADMIN', 'SUPER_ADMIN'].includes((user as any).role)) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }
  const body = await req.json();
  const schema = z.object({ name: z.string(), companyId: z.number().int() });
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Nome ou empresa inválida' }, { status: 400 });
  }
  // Valida se a empresa existe
  const company = await prisma.company.findUnique({ where: { id: parsed.data.companyId } });
  if (!company) {
    return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 400 });
  }
  // COMPANY_ADMIN só pode criar para sua própria empresa
  if ((user as any).role === 'COMPANY_ADMIN' && (user as any).companyId !== parsed.data.companyId) {
    return NextResponse.json({ error: 'Acesso negado à empresa' }, { status: 403 });
  }
  const category = await prisma.category.create({
    data: {
      name: parsed.data.name,
      companyId: parsed.data.companyId,
    },
  });
  return NextResponse.json(category);
}
