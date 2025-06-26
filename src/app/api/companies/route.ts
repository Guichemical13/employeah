import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

/**
 * @route GET /api/companies
 * @desc Lista empresas (apenas SUPER_ADMIN)
 * @access Private
 */
export async function GET(req: NextRequest) {
  const user = await verifyToken(req);
  if (!user || (user as any).role !== 'SUPER_ADMIN') {
    return NextResponse.json([], { status: 403 });
  }
  const companies = await prisma.company.findMany();
  return NextResponse.json(companies);
}

/**
 * @route POST /api/companies
 * @desc Cria uma empresa (apenas SUPER_ADMIN)
 * @access Private
 */
export async function POST(req: NextRequest) {
  const user = await verifyToken(req);
  if (!user || (user as any).role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }
  const body = await req.json();
  const schema = z.object({
    name: z.string().min(2),
    admin: z.object({
      name: z.string().min(2),
      email: z.string().email(),
      password: z.string().min(8)
    })
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
  }
  // Cria empresa
  const company = await prisma.company.create({ data: { name: parsed.data.name } });
  // Cria usuário admin vinculado à empresa
  const hashedPassword = await bcrypt.hash(parsed.data.admin.password, 10);
  const adminUser = await prisma.user.create({
    data: {
      name: parsed.data.admin.name,
      email: parsed.data.admin.email,
      password: hashedPassword,
      role: 'COMPANY_ADMIN',
      companyId: company.id,
      mustChangePassword: true,
    }
  });
  return NextResponse.json({ company, adminUser });
}
