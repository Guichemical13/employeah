import { NextResponse } from 'next/server';

/**
 * @route POST /api/auth/logout
 * @desc Logout do usuário (frontend deve remover token)
 * @access Private
 */
export async function POST() {
  // Apenas instrução para frontend remover token
  return NextResponse.json({ message: 'Logout realizado' });
}
