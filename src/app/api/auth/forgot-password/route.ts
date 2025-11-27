import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

/**
 * @route POST /api/auth/forgot-password
 * @desc Envia código de recuperação para o email
 * @access Public
 */
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 });
    }

    // Verificar se usuário existe
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    // Por segurança, sempre retorna sucesso mesmo se email não existir
    if (!user) {
      return NextResponse.json({ 
        success: true, 
        message: 'Se o email existir, um código será enviado' 
      });
    }

    // Gerar código de 6 dígitos
    const resetCode = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    // Salvar código no banco (você precisa criar esta tabela ou adicionar campos no User)
    // Por enquanto, vou simular salvando em memória (em produção, use banco de dados)
    // Criar uma tabela PasswordReset ou adicionar campos resetCode e resetCodeExpires no User
    
    await prisma.user.update({
      where: { id: user.id },
      data: {
        // Adicione estes campos no seu schema do Prisma se ainda não existirem
        // resetCode: resetCode,
        // resetCodeExpires: expiresAt
      }
    });

    // TODO: Enviar email com o código
    // Por enquanto, retornar o código no desenvolvimento (REMOVER EM PRODUÇÃO)
    console.log(`Código de recuperação para ${email}: ${resetCode}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Código enviado para o email',
      // REMOVER EM PRODUÇÃO:
      devCode: process.env.NODE_ENV === 'development' ? resetCode : undefined
    });

  } catch (error) {
    console.error('Erro ao processar recuperação de senha:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
