import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

/**
 * @route GET /api/debug/user-role
 * @desc Mostra informações do usuário atual para debug
 * @access Private
 */
export async function GET(req: NextRequest) {
  try {
    const user = await verifyToken(req);
    
    if (!user) {
      return NextResponse.json({ 
        error: 'Usuário não autenticado',
        hasToken: req.headers.get('authorization') ? true : false
      }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: (user as any).id,
        name: (user as any).name,
        email: (user as any).email,
        role: (user as any).role,
        companyId: (user as any).companyId
      },
      permissions: {
        canDeleteElogios: ['COMPANY_ADMIN', 'SUPER_ADMIN'].includes((user as any).role),
        isCompanyAdmin: (user as any).role === 'COMPANY_ADMIN',
        isSuperAdmin: (user as any).role === 'SUPER_ADMIN',
        isCollaborator: (user as any).role === 'COLLABORATOR'
      }
    });

  } catch (error) {
    console.error('Erro ao verificar usuário:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error 
    }, { status: 500 });
  }
}
