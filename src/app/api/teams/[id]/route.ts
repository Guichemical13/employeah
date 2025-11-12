import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "@/lib/auth-utils";

const prisma = new PrismaClient();

// GET /api/teams/[id] - Buscar time específico
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Token não fornecido" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const teamId = parseInt(params.id);
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        company: { select: { id: true, name: true } },
        supervisor: { select: { id: true, name: true, email: true } },
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
      if (team.supervisorId !== user.id) {
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
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Token não fornecido" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // Apenas SUPER_ADMIN e COMPANY_ADMIN podem editar times
    if (user.role !== "SUPER_ADMIN" && user.role !== "COMPANY_ADMIN") {
      return NextResponse.json({ error: "Sem permissão para editar times" }, { status: 403 });
    }

    const teamId = parseInt(params.id);
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
    const { name, description, supervisorId } = body;

    // Verificar se o novo supervisor existe e pertence à empresa
    if (supervisorId !== undefined && supervisorId !== existingTeam.supervisorId) {
      if (supervisorId !== null) {
        const supervisor = await prisma.user.findUnique({
          where: { id: supervisorId },
        });

        if (!supervisor || supervisor.companyId !== existingTeam.companyId) {
          return NextResponse.json({ error: "Supervisor inválido ou não pertence à empresa" }, { status: 400 });
        }

        // Verificar se o supervisor já gerencia outro time
        const otherTeam = await prisma.team.findFirst({
          where: { 
            supervisorId,
            id: { not: teamId }
          },
        });

        if (otherTeam) {
          return NextResponse.json({ error: "Este supervisor já gerencia outro time" }, { status: 400 });
        }

        // Atualizar role do novo supervisor
        await prisma.user.update({
          where: { id: supervisorId },
          data: { role: "SUPERVISOR" },
        });
      }

      // Se estiver removendo supervisor, reverter role do anterior
      if (existingTeam.supervisorId && supervisorId === null) {
        await prisma.user.update({
          where: { id: existingTeam.supervisorId },
          data: { role: "COLLABORATOR" },
        });
      }
    }

    const team = await prisma.team.update({
      where: { id: teamId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(supervisorId !== undefined && { supervisorId }),
      },
      include: {
        company: { select: { id: true, name: true } },
        supervisor: { select: { id: true, name: true, email: true } },
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
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Token não fornecido" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // Apenas SUPER_ADMIN e COMPANY_ADMIN podem deletar times
    if (user.role !== "SUPER_ADMIN" && user.role !== "COMPANY_ADMIN") {
      return NextResponse.json({ error: "Sem permissão para deletar times" }, { status: 403 });
    }

    const teamId = parseInt(params.id);
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

    // Reverter role do supervisor
    if (team.supervisorId) {
      await prisma.user.update({
        where: { id: team.supervisorId },
        data: { role: "COLLABORATOR" },
      });
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
