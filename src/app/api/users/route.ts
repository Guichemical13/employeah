import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

/**
 * @route GET /api/users
 * @desc Lista usuários da empresa (COMPANY_ADMIN)
 * @access Private
 */
export async function GET(req: NextRequest) {
  const user = await verifyToken(req);
  if (!user || !['COMPANY_ADMIN', 'SUPER_ADMIN', 'COLLABORATOR'].includes((user as any).role)) {
    return NextResponse.json([], { status: 403 });
  }
  let users;
  if ((user as any).role === 'SUPER_ADMIN') {
    users = await prisma.user.findMany();
  } else {
    users = await prisma.user.findMany({ where: { companyId: (user as any).companyId } });
  }
  return NextResponse.json(users);
}

/**
 * @route POST /api/users
 * @desc Cria usuário (SUPER_ADMIN pode criar COMPANY_ADMIN, COMPANY_ADMIN pode criar COLLABORATOR)
 * @access Private
 */
export async function POST(req: NextRequest) {
  const user = await verifyToken(req);
  if (!user) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }
  const body = await req.json();
  const schema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(8),
    role: z.enum(['COMPANY_ADMIN', 'COLLABORATOR']).optional(),
    companyId: z.number(), // companyId obrigatório
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
  }
  const hashedPassword = await bcrypt.hash(parsed.data.password, 10);
  // SUPER_ADMIN pode criar qualquer usuário para qualquer empresa
  if ((user as any).role === 'SUPER_ADMIN') {
    if (!parsed.data.companyId) {
      return NextResponse.json({ error: 'companyId obrigatório' }, { status: 400 });
    }
    const newUser = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        password: hashedPassword,
        role: parsed.data.role || 'COLLABORATOR',
        companyId: parsed.data.companyId,
        mustChangePassword: true,
      },
    });
    return NextResponse.json(newUser);
  }
  // COMPANY_ADMIN só pode criar COLLABORATOR para sua empresa
  if ((user as any).role === 'COMPANY_ADMIN' && (!parsed.data.role || parsed.data.role === 'COLLABORATOR')) {
    const newUser = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        password: hashedPassword,
        role: 'COLLABORATOR',
        companyId: (user as any).companyId,
        mustChangePassword: true,
      },
    });
    return NextResponse.json(newUser);
  }
  return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
}
