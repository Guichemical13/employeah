import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

/**
 * @route POST /api/auth/reset-password
 * @desc Redefine a senha do usuário
 * @access Public
 */
export async function POST(req: NextRequest) {
  try {
    const { userId, newPassword } = await req.json();

    if (!userId || !newPassword) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }

    // Validar senha forte
    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'Senha deve ter no mínimo 8 caracteres' }, { status: 400 });
    }

    if (!/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      return NextResponse.json({ 
        error: 'Senha deve conter ao menos uma letra maiúscula e um número' 
      }, { status: 400 });
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Atualizar senha e limpar código de reset
    await prisma.user.update({
      where: { id: userId },
      data: { 
        password: hashedPassword,
        resetCode: null,
        resetCodeExpires: null
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Senha redefinida com sucesso' 
    });

  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
