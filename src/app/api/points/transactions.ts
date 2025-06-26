import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

/**
 * @route GET /api/points/transactions
 * @desc Lista transações de pontos do usuário autenticado
 * @access Private
 */
export async function GET(req: NextRequest) {
  const user = await verifyToken(req);
  if (!user || typeof user !== 'object' || !('id' in user)) return NextResponse.json([], { status: 401 });
  const transactions = await prisma.pointTransaction.findMany({
    where: { userId: (user as any).id },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(transactions);
}
