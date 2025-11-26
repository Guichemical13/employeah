import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { setUserPermission, PermissionKey } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/users/[id]/permissions/batch
 * Atualiza múltiplas permissões de um usuário de uma vez
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user: any = await verifyToken(req);
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "COMPANY_ADMIN")) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const { id } = await params;
    const userId = parseInt(id);
    const body = await req.json();
    const { permissions } = body;

    if (!Array.isArray(permissions) || permissions.length === 0) {
      return NextResponse.json(
        { error: "Lista de permissões é obrigatória" },
        { status: 400 }
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // Admin de empresa só pode editar usuários da própria empresa
    if (user.role === "COMPANY_ADMIN" && targetUser.companyId !== user.companyId) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    // Atualizar todas as permissões em uma transação
    const results = await Promise.all(
      permissions.map(({ permission, value }: { permission: string; value: boolean }) =>
        setUserPermission(userId, permission as PermissionKey, value)
      )
    );

    return NextResponse.json({
      message: `${results.length} permissões atualizadas com sucesso`,
      count: results.length,
    }, { status: 200 });
  } catch (error) {
    console.error("Erro ao atualizar permissões em lote:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
