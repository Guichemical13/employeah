import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

/**
 * @route POST /api/elogios/create
 * @desc Cria um elogio para outro colaborador
 * @access Private
 */
export async function POST(req: NextRequest) {
  const user = await verifyToken(req);
  if (!user || (user as any).role !== 'COLLABORATOR') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }
  const body = await req.json();
  const schema = z.object({ message: z.string().min(2) });
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Mensagem inválida' }, { status: 400 });
  }
  // TODO: Receber toId do colaborador a ser elogiado
  // Aqui, para exemplo, envia para si mesmo
  const elogio = await prisma.elogio.create({
    data: {
      message: parsed.data.message,
      fromId: (user as any).id,
      toId: (user as any).id,
    },
  });
  return NextResponse.json(elogio);
}
