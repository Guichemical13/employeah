import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } 
) {
  try {
    const decoded = await verifyToken(req);
    if (!decoded || typeof decoded === 'string') {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const userId = (decoded as any).userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, companyId: true },
    });

    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "COMPANY_ADMIN" && user.role !== "SUPERVISOR")) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const resolvedParams = await params; 

    const teamId = parseInt(resolvedParams.id); 
    
    // Buscar time com membros
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            points: true,
          },
        },
        supervisors: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!team) {
      return NextResponse.json({ error: "Time não encontrado" }, { status: 404 });
    }

    // Verificar permissão
    if (user.role === "COMPANY_ADMIN" && team.companyId !== user.companyId) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    // Calcular analytics
    const totalMembers = team.members?.length || 0;
    const totalPoints = team.members?.reduce((sum: number, member: any) => sum + (member.points || 0), 0) || 0;
    const averagePoints = totalMembers > 0 ? totalPoints / totalMembers : 0;

    // Buscar elogios recebidos pelos membros do time
    const memberIds = team.members?.map((m: any) => m.id) || [];
    const elogios = await prisma.elogio.findMany({
      where: {
        toId: { in: memberIds },
      },
    });
    const totalElogios = elogios.length;

    // Top performers (ordenar por pontos)
    const topPerformers = team.members
      ?.map((member: any) => ({
        user: member,
        points: member.points || 0,
        elogios: elogios.filter((e: any) => e.toId === member.id).length,
      }))
      .sort((a: any, b: any) => b.points - a.points)
      .slice(0, 5) || [];

    // Atividades recentes (últimas transações de pontos e elogios)
    const recentTransactions = await prisma.pointTransaction.findMany({
      where: {
        userId: { in: memberIds },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        user: {
          select: { name: true },
        },
      },
    });

    const recentElogios = await prisma.elogio.findMany({
      where: {
        OR: [
          { toId: { in: memberIds } },
          { fromId: { in: memberIds } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        from: { select: { name: true } },
        to: { select: { name: true } },
      },
    });

    const recentActivities = [
      ...recentTransactions.map((t: any) => ({
        type: 'points' as const,
        description: `${t.user.name} ${t.amount > 0 ? 'recebeu' : 'gastou'} ${Math.abs(t.amount)} pontos`,
        date: t.createdAt.toISOString(),
        userName: t.user.name,
      })),
      ...recentElogios.map((e: any) => ({
        type: 'elogio' as const,
        description: `${e.from.name} enviou um elogio para ${e.to.name}`,
        date: e.createdAt.toISOString(),
        userName: e.from.name,
      })),
    ]
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 15);

    const analytics = {
      totalMembers,
      totalPoints,
      averagePoints,
      totalElogios,
      topPerformers,
      recentActivities,
    };

    return NextResponse.json({ analytics });
  } catch (error) {
    console.error("Erro ao buscar analytics do time:", error);
    return NextResponse.json(
      { error: "Erro ao buscar analytics" },
      { status: 500 }
    );
  }
}
