import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { setUserPermission } from '@/lib/permissions';
import { z } from 'zod';

const permissionSchema = z.object({
  userId: z.number(),
  permission: z.string(),
  value: z.boolean(),
});

/**
 * @route POST /api/permissions/set
 * @desc Define permissão customizada para um usuário (apenas COMPANY_ADMIN)
 * @access Private
 */
export async function POST(req: NextRequest) {
  const user = await verifyToken(req);
  
  if (!user || !['COMPANY_ADMIN', 'SUPER_ADMIN'].includes((user as any).role)) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }

  const body = await req.json();
  const parsed = permissionSchema.safeParse(body);
  
  if (!parsed.success) {
    return NextResponse.json({ 
      error: 'Dados inválidos', 
      details: parsed.error 
    }, { status: 400 });
  }

  const { userId, permission, value } = parsed.data;

  try {
    // Verificar se o usuário alvo pertence à mesma empresa (exceto SUPER_ADMIN)
    if ((user as any).role === 'COMPANY_ADMIN') {
      const targetUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { companyId: true }
      });

      if (!targetUser || targetUser.companyId !== (user as any).companyId) {
        return NextResponse.json({ 
          error: 'Você só pode gerenciar permissões de usuários da sua empresa' 
        }, { status: 403 });
      }
    }

    await setUserPermission(userId, permission as any, value);

    return NextResponse.json({ 
      success: true,
      message: 'Permissão atualizada com sucesso' 
    });

  } catch (error) {
    console.error('Erro ao definir permissão:', error);
    return NextResponse.json({ 
      error: 'Erro ao atualizar permissão' 
    }, { status: 500 });
  }
}
