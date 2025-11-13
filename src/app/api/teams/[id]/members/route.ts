import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "@/lib/auth";

const prisma = new PrismaClient();

// POST /api/teams/[id]/members - Adicionar membro ao time
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const decoded = await verifyToken(req);
    if (!decoded) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const currentUserId = typeof decoded === 'string' ? undefined : decoded.id;
    if (!currentUserId) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: currentUserId },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const { id } = await params;
    const teamId = parseInt(id);
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      return NextResponse.json({ error: "Time não encontrado" }, { status: 404 });
    }

    // Verificar permissões
    if (user.role === "SUPER_ADMIN") {
      // SUPER_ADMIN pode adicionar membros em qualquer time
    } else if (user.role === "COMPANY_ADMIN") {
      if (team.companyId !== user.companyId) {
        return NextResponse.json({ error: "Sem permissão para modificar este time" }, { status: 403 });
      }
    } else if (user.role === "SUPERVISOR") {
      if (team.supervisorId !== user.id) {
        return NextResponse.json({ error: "Apenas o supervisor do time pode adicionar membros" }, { status: 403 });
      }
    } else {
      return NextResponse.json({ error: "Sem permissão para adicionar membros" }, { status: 403 });
    }

    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId é obrigatório" }, { status: 400 });
    }

    const member = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!member) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    if (member.companyId !== team.companyId) {
      return NextResponse.json({ error: "Usuário não pertence à mesma empresa do time" }, { status: 400 });
    }

    if (member.teamId) {
      return NextResponse.json({ error: "Usuário já pertence a outro time" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { teamId },
    });

    const updatedTeam = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        company: { select: { id: true, name: true } },
        supervisor: { select: { id: true, name: true, email: true } },
        members: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    return NextResponse.json({ team: updatedTeam });
  } catch (error) {
    console.error("Erro ao adicionar membro:", error);
    return NextResponse.json({ error: "Erro ao adicionar membro" }, { status: 500 });
  }
}

// DELETE /api/teams/[id]/members - Remover membro do time
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const decoded = await verifyToken(req);
    if (!decoded) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const currentUserId = typeof decoded === 'string' ? undefined : decoded.id;
    if (!currentUserId) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: currentUserId },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const { id } = await params;
    const teamId = parseInt(id);
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      return NextResponse.json({ error: "Time não encontrado" }, { status: 404 });
    }

    // Verificar permissões
    if (user.role === "SUPER_ADMIN") {
      // SUPER_ADMIN pode remover membros de qualquer time
    } else if (user.role === "COMPANY_ADMIN") {
      if (team.companyId !== user.companyId) {
        return NextResponse.json({ error: "Sem permissão para modificar este time" }, { status: 403 });
      }
    } else if (user.role === "SUPERVISOR") {
      if (team.supervisorId !== user.id) {
        return NextResponse.json({ error: "Apenas o supervisor do time pode remover membros" }, { status: 403 });
      }
    } else {
      return NextResponse.json({ error: "Sem permissão para remover membros" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId é obrigatório" }, { status: 400 });
    }

    const member = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });

    if (!member) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    if (member.teamId !== teamId) {
      return NextResponse.json({ error: "Usuário não pertence a este time" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { teamId: null },
    });

    const updatedTeam = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        company: { select: { id: true, name: true } },
        supervisor: { select: { id: true, name: true, email: true } },
        members: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    return NextResponse.json({ team: updatedTeam });
  } catch (error) {
    console.error("Erro ao remover membro:", error);
    return NextResponse.json({ error: "Erro ao remover membro" }, { status: 500 });
  }
}
