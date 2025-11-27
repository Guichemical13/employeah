import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { z } from 'zod';

/**
 * @route GET /api/items
 * @desc Lista itens da empresa (COMPANY_ADMIN ou COLLABORATOR)
 * @access Private
 */
export async function GET(req: NextRequest) {
  const user = await verifyToken(req);
  if (!user) return NextResponse.json([], { status: 401 });
  
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const categoryId = searchParams.get('categoryId');
  
  let items;
  if ((user as any).role === 'SUPER_ADMIN') {
    items = await prisma.item.findMany({
      where: {
        ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
        ...(categoryId ? { categoryId: Number(categoryId) } : {})
      },
      include: {
        category: { select: { name: true } },
        company: { select: { name: true } }
      },
      orderBy: { name: 'asc' }
    });
  } else {
    items = await prisma.item.findMany({ 
      where: { 
        companyId: (user as any).companyId,
        ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
        ...(categoryId ? { categoryId: Number(categoryId) } : {})
      },
      include: {
        category: { select: { name: true } }
      },
      orderBy: { name: 'asc' }
    });
  }
  return NextResponse.json(items);
}

/**
 * @route POST /api/items
 * @desc Cria item (COMPANY_ADMIN ou SUPERVISOR com permissão)
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
  const schema = z.object({ 
    name: z.string().min(1), 
    description: z.string().optional(),
    imageUrl: z.string().url().optional().or(z.literal('')),
    price: z.number().min(0), 
    stock: z.number().min(0), 
    categoryId: z.number().optional(), 
    companyId: z.number().optional(),
    createCategory: z.string().optional() // Nome da nova categoria a criar
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos', details: parsed.error }, { status: 400 });
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
  
  // Se createCategory foi enviado, cria a categoria primeiro
  let categoryId = parsed.data.categoryId;
  if (parsed.data.createCategory && parsed.data.createCategory.trim()) {
    const newCategory = await prisma.category.create({
      data: {
        name: parsed.data.createCategory,
        companyId
      }
    });
    categoryId = newCategory.id;
  }
  
  // Validação extra: se categoryId foi enviado, garantir que existe
  if (categoryId) {
    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      return NextResponse.json({ error: 'Categoria não encontrada' }, { status: 400 });
    }
  }
  
  const item = await prisma.item.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      imageUrl: parsed.data.imageUrl || null,
      price: parsed.data.price,
      stock: parsed.data.stock,
      categoryId: categoryId || null,
      companyId,
    },
    include: {
      category: { select: { name: true } }
    }
  });
  return NextResponse.json(item);
}

