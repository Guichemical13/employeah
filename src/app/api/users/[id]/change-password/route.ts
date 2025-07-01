import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

/**
 * @route PATCH /api/users/[id]/change-password
 * @desc Altera a senha do usuário
 * @access Private
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyToken(req);
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { id } = await params;
    const userId = parseInt(id);
    const requestUserId = (user as any).id;

    // Usuário só pode alterar sua própria senha, exceto SUPER_ADMIN
    if (requestUserId !== userId && (user as any).role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const body = await req.json();
    const schema = z.object({
      currentPassword: z.string().min(1, 'Senha atual obrigatória'),
      newPassword: z.string()
        .min(8, 'Senha mínima de 8 caracteres')
        .regex(/[A-Z]/, 'Deve conter uma letra maiúscula')
        .regex(/[a-z]/, 'Deve conter uma letra minúscula')
        .regex(/[0-9]/, 'Deve conter um número'),
    });

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ 
        error: 'Dados inválidos',
        details: parsed.error.errors 
      }, { status: 400 });
    }

    const { currentPassword, newPassword } = parsed.data;

    // Busca o usuário no banco
    const targetUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Verifica a senha atual (exceto para SUPER_ADMIN alterando senha de outros)
    if (requestUserId === userId) {
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, targetUser.password);
      if (!isCurrentPasswordValid) {
        return NextResponse.json({ error: 'Senha atual incorreta' }, { status: 400 });
      }
    }

    // Hash da nova senha
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Atualiza a senha
    await prisma.user.update({
      where: { id: userId },
      data: { 
        password: hashedNewPassword,
        mustChangePassword: false
      }
    });

    return NextResponse.json({ 
      message: 'Senha alterada com sucesso' 
    });

  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}
