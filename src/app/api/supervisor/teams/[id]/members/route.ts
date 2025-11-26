import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { canAccessTeam } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/supervisor/teams/[id]/members
 * Retorna os membros de um time específico (se supervisor tem acesso)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user: any = await verifyToken(req);
    if (!user || user.role !== "SUPERVISOR") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const { id } = await params;
    const teamId = parseInt(id);
    const hasAccess = await canAccessTeam(user.id, teamId);

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Você não tem acesso a este time" },
        { status: 403 }
      );
    }

    const members = await prisma.user.findMany({
      where: {
        teamId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        profilePicture: true,
        role: true,
        points: true,
        createdAt: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({ members }, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar membros do time:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
