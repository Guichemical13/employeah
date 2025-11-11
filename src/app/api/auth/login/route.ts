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
  try {
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
    
    // Verifica a senha usando bcrypt
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
    }
    
    if (!process.env.JWT_SECRET) {
      console.error('[login API] JWT_SECRET não configurado');
      return NextResponse.json({ error: 'Erro de configuração do servidor' }, { status: 500 });
    }
    
    const token = jwt.sign(
      { id: user.id, role: user.role, companyId: user.companyId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    return NextResponse.json({ 
      token, 
      role: user.role, 
      mustChangePassword: user.mustChangePassword,
      userId: user.id 
    });
  } catch (error) {
    console.error('[login API] Erro inesperado:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Erro interno do servidor' 
    }, { status: 500 });
  }
}
