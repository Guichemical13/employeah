import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { canAccessTeam } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/supervisor/teams/[id]/analytics
 * Retorna analytics de um time específico (se supervisor tem acesso)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user: any = await verifyToken(req);
    if (!user || user.role !== "SUPERVISOR") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const teamId = parseInt(params.id);
    const hasAccess = await canAccessTeam(user.id, teamId);

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Você não tem acesso a este time" },
        { status: 403 }
      );
    }

    // Buscar informações do time
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          select: {
            id: true,
            name: true,
            points: true,
            role: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!team) {
      return NextResponse.json({ error: "Time não encontrado" }, { status: 404 });
    }

    // Estatísticas de elogios do time
    const elogiosRecebidos = await prisma.elogio.count({
      where: {
        to: {
          teamId,
        },
      },
    });

    const elogiosEnviados = await prisma.elogio.count({
      where: {
        from: {
          teamId,
        },
      },
    });

    // Total de pontos do time
    const totalPoints = team.members.reduce((sum, member) => sum + member.points, 0);

    // Top 5 membros com mais pontos
    const topMembers = [...team.members]
      .sort((a, b) => b.points - a.points)
      .slice(0, 5);

    // Transações de pontos do time (últimos 30 dias)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentTransactions = await prisma.pointTransaction.findMany({
      where: {
        user: {
          teamId,
        },
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    });

    return NextResponse.json({
      team: {
        id: team.id,
        name: team.name,
        description: team.description,
        memberCount: team.members.length,
        totalPoints,
        company: team.company,
      },
      analytics: {
        elogiosRecebidos,
        elogiosEnviados,
        topMembers,
        recentTransactions,
      },
    }, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar analytics do time:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
