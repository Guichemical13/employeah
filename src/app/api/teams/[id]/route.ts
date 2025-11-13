import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "@/lib/auth";

const prisma = new PrismaClient();

// GET /api/teams/[id] - Buscar time específico
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const decoded = await verifyToken(req);
    if (!decoded) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const userId = typeof decoded === 'string' ? undefined : decoded.id;
    if (!userId) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const teamId = parseInt((await params).id);
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        company: { select: { id: true, name: true } },
        supervisors: { select: { id: true, name: true, email: true, role: true } },
        members: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    if (!team) {
      return NextResponse.json({ error: "Time não encontrado" }, { status: 404 });
    }

    // Verificar permissões
    if (user.role === "SUPER_ADMIN") {
      // SUPER_ADMIN pode ver qualquer time
    } else if (user.role === "COMPANY_ADMIN") {
      if (team.companyId !== user.companyId) {
        return NextResponse.json({ error: "Sem permissão para ver este time" }, { status: 403 });
      }
    } else if (user.role === "SUPERVISOR") {
      const isSupervisor = team.supervisors?.some(s => s.id === user.id);
      if (!isSupervisor) {
        return NextResponse.json({ error: "Sem permissão para ver este time" }, { status: 403 });
      }
    } else {
      // Colaboradores só podem ver seu próprio time
      if (user.teamId !== teamId) {
        return NextResponse.json({ error: "Sem permissão para ver este time" }, { status: 403 });
      }
    }

    return NextResponse.json({ team });
  } catch (error) {
    console.error("Erro ao buscar time:", error);
    return NextResponse.json({ error: "Erro ao buscar time" }, { status: 500 });
  }
}

// PUT /api/teams/[id] - Atualizar time
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const decoded = await verifyToken(req);
    if (!decoded) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const userId = typeof decoded === 'string' ? undefined : decoded.id;
    if (!userId) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // Apenas SUPER_ADMIN e COMPANY_ADMIN podem editar times
    if (user.role !== "SUPER_ADMIN" && user.role !== "COMPANY_ADMIN") {
      return NextResponse.json({ error: "Sem permissão para editar times" }, { status: 403 });
    }

    const teamId = parseInt((await params).id);
    const existingTeam = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!existingTeam) {
      return NextResponse.json({ error: "Time não encontrado" }, { status: 404 });
    }

    // COMPANY_ADMIN só pode editar times da própria empresa
    if (user.role === "COMPANY_ADMIN" && existingTeam.companyId !== user.companyId) {
      return NextResponse.json({ error: "Sem permissão para editar este time" }, { status: 403 });
    }

    const body = await req.json();
    const { name, description, supervisorIds } = body;

    let updateData: any = {
      ...(name && { name }),
      ...(description !== undefined && { description }),
    };

    // Atualizar supervisores se fornecido
    if (supervisorIds !== undefined) {
      // Verificar se os supervisores existem e pertencem à empresa
      if (supervisorIds.length > 0) {
        const supervisors = await prisma.user.findMany({
          where: {
            id: { in: supervisorIds },
            companyId: existingTeam.companyId,
          },
        });

        if (supervisors.length !== supervisorIds.length) {
          return NextResponse.json({ error: "Um ou mais supervisores são inválidos" }, { status: 400 });
        }

        // Atualizar role dos novos supervisores
        await prisma.user.updateMany({
          where: { id: { in: supervisorIds } },
          data: { role: "SUPERVISOR" },
        });
      }

      // Buscar supervisores E membros atuais para cálculo
      const currentTeam = await prisma.team.findUnique({
        where: { id: teamId },
        include: { 
            supervisors: true, 
            members: true 
        },
      });

      const currentSupervisorIds = currentTeam?.supervisors.map(s => s.id) || [];
      const removedSupervisorIds = currentSupervisorIds.filter(id => !supervisorIds.includes(id));

      // Reverter role dos supervisores removidos (se não supervisionam outros times)
      for (const supervisorId of removedSupervisorIds) {
        const otherTeams = await prisma.team.count({
          where: {
            id: { not: teamId },
            supervisors: { some: { id: supervisorId } },
          },
        });

        if (otherTeams === 0) {
          await prisma.user.update({
            where: { id: supervisorId },
            data: { role: "COLLABORATOR" },
          });
        }
      }

      updateData.supervisors = {
        set: supervisorIds.map((id: number) => ({ id })),
      };

      // Auto-adicionar supervisores aos membros
      const currentMemberIds = currentTeam?.members.map(m => m.id) || [];
      const newMemberIds = [...new Set([...currentMemberIds, ...supervisorIds])];
      
      updateData.members = {
        set: newMemberIds.map((id: number) => ({ id })),
      };

      // Atualizar teamId dos supervisores
      await prisma.user.updateMany({
        where: { id: { in: supervisorIds } },
        data: { teamId },
      });
    }

    const team = await prisma.team.update({
      where: { id: teamId },
      data: updateData,
      include: {
        company: { select: { id: true, name: true } },
        supervisors: { select: { id: true, name: true, email: true, role: true } },
        members: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    return NextResponse.json({ team });
  } catch (error) {
    console.error("Erro ao atualizar time:", error);
    return NextResponse.json({ error: "Erro ao atualizar time" }, { status: 500 });
  }
}

// DELETE /api/teams/[id] - Deletar time
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const decoded = await verifyToken(req);
    if (!decoded) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const userId = typeof decoded === 'string' ? undefined : decoded.id;
    if (!userId) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // Apenas SUPER_ADMIN e COMPANY_ADMIN podem deletar times
    if (user.role !== "SUPER_ADMIN" && user.role !== "COMPANY_ADMIN") {
      return NextResponse.json({ error: "Sem permissão para deletar times" }, { status: 403 });
    }

    const teamId = parseInt((await params).id);
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: { members: true },
    });

    if (!team) {
      return NextResponse.json({ error: "Time não encontrado" }, { status: 404 });
    }

    // COMPANY_ADMIN só pode deletar times da própria empresa
    if (user.role === "COMPANY_ADMIN" && team.companyId !== user.companyId) {
      return NextResponse.json({ error: "Sem permissão para deletar este time" }, { status: 403 });
    }

    // Remover membros do time antes de deletar
    if (team.members.length > 0) {
      await prisma.user.updateMany({
        where: { teamId },
        data: { teamId: null },
      });
    }

    // Buscar supervisores do time
    const teamWithSupervisors = await prisma.team.findUnique({
      where: { id: teamId },
      include: { supervisors: true },
    });

    // Reverter role dos supervisores (se não supervisionam outros times)
    if (teamWithSupervisors?.supervisors) {
      for (const supervisor of teamWithSupervisors.supervisors) {
        const otherTeams = await prisma.team.count({
          where: {
            id: { not: teamId },
            supervisors: { some: { id: supervisor.id } },
          },
        });

        if (otherTeams === 0) {
          await prisma.user.update({
            where: { id: supervisor.id },
            data: { role: "COLLABORATOR" },
          });
        }
      }
    }

    await prisma.team.delete({
      where: { id: teamId },
    });

    return NextResponse.json({ message: "Time deletado com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar time:", error);
    return NextResponse.json({ error: "Erro ao deletar time" }, { status: 500 });
  }
}
