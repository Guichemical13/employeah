import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

/**
 * @route POST /api/auth/login
 * @desc Autentica usuário e retorna JWT
 * @access Public
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const schema = z.object({
    email: z.string().email(),
    password: z.string(),
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
  }
  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
  }
  // Permite login do SUPER_ADMIN com senha 'superadmin' (mesmo se o hash for diferente)
  if (user.role === 'SUPER_ADMIN' && password === 'superadmin') {
    // prossegue
  } else if (!(await bcrypt.compare(password, user.password))) {
    return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
  }
  const token = jwt.sign(
    { id: user.id, role: user.role, companyId: user.companyId },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );
  return NextResponse.json({ token, role: user.role });
}
