import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getSupervisorTeams } from "@/lib/permissions";

/**
 * GET /api/supervisor/teams
 * Retorna os times gerenciados pelo supervisor
 */
export async function GET(req: NextRequest) {
  try {
    const user: any = await verifyToken(req);
    if (!user || user.role !== "SUPERVISOR") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const teams = await getSupervisorTeams(user.id);

    return NextResponse.json({ teams }, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar times do supervisor:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
