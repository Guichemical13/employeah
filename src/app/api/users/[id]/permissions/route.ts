import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { setUserPermission, PermissionKey } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/users/[id]/permissions
 * Retorna as permissões de um usuário específico
 */
export async function GET(
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
    
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        permissions: true,
      },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // Admin de empresa só pode ver usuários da própria empresa
    if (user.role === "COMPANY_ADMIN" && targetUser.companyId !== user.companyId) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    return NextResponse.json({
      user: {
        id: targetUser.id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
      },
      permissions: targetUser.permissions,
    }, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar permissões do usuário:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

/**
 * POST /api/users/[id]/permissions
 * Atualiza permissões de um usuário
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
    const { permission, value } = body;

    if (!permission || typeof value !== "boolean") {
      return NextResponse.json(
        { error: "Permissão e valor são obrigatórios" },
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

    // Atualizar permissão
    const updatedPermission = await setUserPermission(userId, permission as PermissionKey, value);

    return NextResponse.json({
      message: "Permissão atualizada com sucesso",
      permission: updatedPermission,
    }, { status: 200 });
  } catch (error) {
    console.error("Erro ao atualizar permissão:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
