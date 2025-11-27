import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { hasPermission, PermissionKey } from '@/lib/permissions';

export interface AuthenticatedUser {
  id: number;
  email: string;
  role: string;
  companyId?: number;
}

/**
 * Verifica autenticação e retorna dados do usuário
 */
export async function authenticate(req: NextRequest): Promise<AuthenticatedUser | null> {
  const user = await verifyToken(req);
  return user as AuthenticatedUser | null;
}

/**
 * Verifica se usuário tem permissão específica
 * Retorna NextResponse com erro 403 se não tiver permissão
 */
export async function checkPermission(
  user: AuthenticatedUser,
  permission: PermissionKey,
  allowedRoles: string[] = ['COMPANY_ADMIN', 'SUPER_ADMIN']
): Promise<{ authorized: boolean; response?: NextResponse }> {
  const canAccess = await hasPermission(user.id, user.role, permission);
  
  if (!canAccess && !allowedRoles.includes(user.role)) {
    return {
      authorized: false,
      response: NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    };
  }
  
  return { authorized: true };
}

/**
 * Valida se usuário pode acessar recursos da empresa
 */
export function validateCompanyAccess(
  user: AuthenticatedUser,
  resourceCompanyId: number
): { authorized: boolean; response?: NextResponse } {
  if (user.role === 'SUPER_ADMIN') {
    return { authorized: true };
  }
  
  if (user.companyId !== resourceCompanyId) {
    return {
      authorized: false,
      response: NextResponse.json({ error: 'Acesso negado ao recurso' }, { status: 403 })
    };
  }
  
  return { authorized: true };
}

/**
 * Wrapper completo para autenticação e verificação de permissão
 */
export async function authorizeRequest(
  req: NextRequest,
  permission: PermissionKey,
  allowedRoles: string[] = ['COMPANY_ADMIN', 'SUPER_ADMIN']
): Promise<{ user?: AuthenticatedUser; response?: NextResponse }> {
  // Autenticar
  const user = await authenticate(req);
  if (!user) {
    return {
      response: NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    };
  }
  
  // Verificar permissão
  const { authorized, response } = await checkPermission(user, permission, allowedRoles);
  if (!authorized) {
    return { response };
  }
  
  return { user };
}
