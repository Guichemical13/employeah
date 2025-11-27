import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * @route POST /api/auth/verify-reset-code
 * @desc Verifica código de recuperação
 * @access Public
 */
export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'Email e código são obrigatórios' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return NextResponse.json({ error: 'Código inválido' }, { status: 400 });
    }

    // Verificar se código existe e não expirou
    if (!user.resetCode || !user.resetCodeExpires) {
      return NextResponse.json({ 
        error: 'Nenhum código de recuperação foi solicitado' 
      }, { status: 400 });
    }

    // Verificar se código expirou
    if (new Date() > user.resetCodeExpires) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetCode: null,
          resetCodeExpires: null
        }
      });

      return NextResponse.json({ 
        error: 'Código expirado. Solicite um novo código.' 
      }, { status: 400 });
    }

    // Verificar se código está correto
    if (user.resetCode !== code) {
      return NextResponse.json({ 
        error: 'Código inválido' 
      }, { status: 400 });
    }

    // Código válido
    return NextResponse.json({ 
      success: true, 
      message: 'Código verificado com sucesso',
      userId: user.id 
    });

  } catch (error) {
    console.error('Erro ao verificar código:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
