import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

/**
 * @route PATCH /api/users/[id]
 * @desc Edita usuário (COMPANY_ADMIN, SUPER_ADMIN ou o próprio usuário)
 * @access Private
 * @note SUPER_ADMIN pode alterar senhas de qualquer usuário
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await verifyToken(req);
  if (!user) return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  const { id } = await params;
  const body = await req.json();
  const schema = z.object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    password: z.string().min(6).optional(),
    mustChangePassword: z.boolean().optional(),
    points: z.number().int().min(0).optional(),
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
  }
  const data: any = { ...parsed.data };
  const isSelf = (user as any).id === Number(id);
  const isAdmin = (user as any).role === 'COMPANY_ADMIN' || (user as any).role === 'SUPER_ADMIN';

  // Só admins podem editar pontos
  if (typeof data.points !== 'undefined') {
    if (!isAdmin) {
      return NextResponse.json({ error: 'Apenas administradores podem editar pontos.' }, { status: 403 });
    }
  }

  // O próprio usuário, COMPANY_ADMIN ou SUPER_ADMIN podem alterar senhas
  if (data.password) {
    const canChangePassword = isSelf || (user as any).role === 'SUPER_ADMIN' || (user as any).role === 'COMPANY_ADMIN';
    if (!canChangePassword) {
      return NextResponse.json({ error: 'Apenas o próprio usuário, COMPANY_ADMIN ou SUPER_ADMIN podem alterar senhas.' }, { status: 403 });
    }
    // Hash da nova senha
    data.password = await bcrypt.hash(data.password, 10);
    // Se SUPER_ADMIN ou COMPANY_ADMIN está alterando senha de outro usuário, força mustChangePassword=true
    if (!isSelf && ((user as any).role === 'SUPER_ADMIN' || (user as any).role === 'COMPANY_ADMIN')) {
      data.mustChangePassword = true;
    } else if (data.mustChangePassword === false) {
      // Usuário alterando própria senha pode definir mustChangePassword=false
      data.mustChangePassword = false;
    }
  } else {
    // Só admins podem alterar mustChangePassword sem senha
    if (typeof data.mustChangePassword !== 'undefined') {
      if (!isAdmin) {
        return NextResponse.json({ error: 'Acesso negado para alterar mustChangePassword.' }, { status: 403 });
      }
    }
  }
  const updated = await prisma.user.update({ where: { id: Number(id) }, data });
  return NextResponse.json(updated);
}

/**
 * @route DELETE /api/users/[id]
 * @desc Remove usuário (COMPANY_ADMIN ou SUPER_ADMIN)
 * @access Private
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await verifyToken(req);
  if (!user || !['COMPANY_ADMIN', 'SUPER_ADMIN'].includes((user as any).role)) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }
  const { id } = await params;
  await prisma.user.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
