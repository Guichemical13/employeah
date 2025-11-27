import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { z } from 'zod';

/**
 * @route GET /api/categories
 * @desc Lista categorias da empresa (COMPANY_ADMIN ou COLLABORATOR)
 * @access Private
 */
export async function GET(req: NextRequest) {
  const user = await verifyToken(req);
  if (!user) return NextResponse.json([], { status: 401 });
  
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  
  let categories;
  if ((user as any).role === 'SUPER_ADMIN') {
    categories = await prisma.category.findMany({
      where: search ? {
        name: { contains: search, mode: 'insensitive' }
      } : {},
      include: {
        company: { select: { name: true } },
        _count: { select: { items: true } }
      },
      orderBy: { name: 'asc' }
    });
  } else {
    categories = await prisma.category.findMany({ 
      where: { 
        companyId: (user as any).companyId,
        ...(search ? { name: { contains: search, mode: 'insensitive' } } : {})
      },
      include: {
        _count: { select: { items: true } }
      },
      orderBy: { name: 'asc' }
    });
  }
  return NextResponse.json(categories);
}

/**
 * @route POST /api/categories
 * @desc Cria categoria (COMPANY_ADMIN ou SUPERVISOR com permissão)
 * @access Private
 */
export async function POST(req: NextRequest) {
  const user = await verifyToken(req);
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  
  const userId = (user as any).id;
  const userRole = (user as any).role;
  
  // Verificar permissão para inserir itens no catálogo
  const canManageCatalog = await hasPermission(userId, userRole, 'insert_new_items_catalog');
  
  if (!canManageCatalog) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }
  const body = await req.json();
  const schema = z.object({ name: z.string().min(1), companyId: z.number().int().optional() });
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Nome ou empresa inválida' }, { status: 400 });
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
  
  // Valida se a empresa existe
  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company) {
    return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 400 });
  }
  
  const category = await prisma.category.create({
    data: {
      name: parsed.data.name,
      companyId,
    },
  });
  return NextResponse.json(category);
}

