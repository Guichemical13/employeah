import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getUserPermissions } from "@/lib/permissions";

/**
 * GET /api/supervisor/permissions
 * Retorna as permissões do supervisor logado
 */
export async function GET(req: NextRequest) {
  try {
    const user: any = await verifyToken(req);
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const permissions = await getUserPermissions(user.id, user.role);

    return NextResponse.json({ permissions }, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar permissões:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
