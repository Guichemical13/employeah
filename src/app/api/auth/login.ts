import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

/**
 * @route POST /api/auth/login
 * @desc Autentica usuário e retorna JWT e mustChangePassword
 * @access Public
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
  }
  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
  }
  const token = jwt.sign(
    { id: user.id, role: user.role, companyId: user.companyId },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );
  // Retorna também mustChangePassword, userId e role
  return NextResponse.json({
    token,
    mustChangePassword: !!user.mustChangePassword, // garante boolean
    userId: user.id,
    role: user.role
  });
}
