import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

/**
 * @route GET /api/elogios
 * @desc Lista elogios da empresa (enviados e recebidos)
 * @access Private
 */
export async function GET(req: NextRequest) {
  const user = await verifyToken(req);
  if (!user) return NextResponse.json([], { status: 401 });
  
  let elogios;
  if ((user as any).role === 'SUPER_ADMIN') {
    // SUPER_ADMIN vê todos os elogios
    elogios = await prisma.elogio.findMany({ 
      orderBy: { createdAt: 'desc' } 
    });
  } else {
    // Usuários veem elogios enviados OU recebidos por eles
    // Ou elogios entre usuários da mesma empresa
    const userId = (user as any).id;
    const companyId = (user as any).companyId;
    
    // Buscar todos os usuários da mesma empresa
    const companyUsers = await prisma.user.findMany({
      where: { companyId },
      select: { id: true }
    });
    
    const companyUserIds = companyUsers.map(u => u.id);
    
    // Retornar elogios onde FROM ou TO estão na mesma empresa
    elogios = await prisma.elogio.findMany({
      where: {
        OR: [
          { fromId: { in: companyUserIds } },
          { toId: { in: companyUserIds } }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });
  }
  
  return NextResponse.json(elogios);
}
