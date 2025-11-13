import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "@/lib/auth";

const prisma = new PrismaClient();

// GET /api/teams - Listar times
export async function GET(req: NextRequest) {
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
      include: { company: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // SUPER_ADMIN pode ver todos os times
    // COMPANY_ADMIN pode ver apenas times da sua empresa
    // SUPERVISOR pode ver apenas seu time
    let teams;

    if (user.role === "SUPER_ADMIN") {
      teams = await prisma.team.findMany({
        include: {
          company: { select: { id: true, name: true } },
          supervisors: { select: { id: true, name: true, email: true, role: true } },
          members: { select: { id: true, name: true, email: true, role: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    } else if (user.role === "COMPANY_ADMIN") {
      if (!user.companyId) {
        return NextResponse.json({ error: "Admin sem empresa vinculada" }, { status: 403 });
      }

      teams = await prisma.team.findMany({
        where: { companyId: user.companyId },
        include: {
          company: { select: { id: true, name: true } },
          supervisors: { select: { id: true, name: true, email: true, role: true } },
          members: { select: { id: true, name: true, email: true, role: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    } else if (user.role === "SUPERVISOR") {
      teams = await prisma.team.findMany({
        where: { supervisors: { some: { id: user.id } } },
        include: {
          company: { select: { id: true, name: true } },
          supervisors: { select: { id: true, name: true, email: true, role: true } },
          members: { select: { id: true, name: true, email: true, role: true } },
        },
      });
    } else {
      // Colaboradores podem ver seu próprio time
      if (!user.teamId) {
        return NextResponse.json({ teams: [] });
      }

      const team = await prisma.team.findUnique({
        where: { id: user.teamId },
        include: {
          company: { select: { id: true, name: true } },
          supervisors: { select: { id: true, name: true, email: true, role: true } },
          members: { select: { id: true, name: true, email: true, role: true } },
        },
      });

      teams = team ? [team] : [];
    }

    return NextResponse.json({ teams });
  } catch (error) {
    console.error("Erro ao buscar times:", error);
    return NextResponse.json({ error: "Erro ao buscar times" }, { status: 500 });
  }
}

// POST /api/teams - Criar novo time
export async function POST(req: NextRequest) {
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

    // Apenas SUPER_ADMIN e COMPANY_ADMIN podem criar times
    if (user.role !== "SUPER_ADMIN" && user.role !== "COMPANY_ADMIN") {
      return NextResponse.json({ error: "Sem permissão para criar times" }, { status: 403 });
    }

    const body = await req.json();
    const { name, description, companyId, supervisorIds = [] } = body;

    if (!name || !companyId) {
      return NextResponse.json({ error: "Nome e companyId são obrigatórios" }, { status: 400 });
    }

    // COMPANY_ADMIN só pode criar times na própria empresa
    if (user.role === "COMPANY_ADMIN" && user.companyId !== companyId) {
      return NextResponse.json({ error: "Você só pode criar times na sua empresa" }, { status: 403 });
    }

    // Verificar se os supervisores existem e pertencem à empresa
    if (supervisorIds.length > 0) {
      const supervisors = await prisma.user.findMany({
        where: {
          id: { in: supervisorIds },
          companyId,
        },
      });

      if (supervisors.length !== supervisorIds.length) {
        return NextResponse.json({ error: "Um ou mais supervisores são inválidos ou não pertencem à empresa" }, { status: 400 });
      }

      // Atualizar role dos usuários para SUPERVISOR
      await prisma.user.updateMany({
        where: { id: { in: supervisorIds } },
        data: { role: "SUPERVISOR" },
      });
    }

    // Criar time e conectar supervisores e membros automaticamente
    const allMemberIds = [...supervisorIds]; // Supervisores são automaticamente membros
    
    const team = await prisma.team.create({
      data: {
        name,
        description,
        companyId,
        supervisors: supervisorIds.length > 0 ? {
          connect: supervisorIds.map((id: number) => ({ id })),
        } : undefined,
        members: allMemberIds.length > 0 ? {
          connect: allMemberIds.map((id: number) => ({ id })),
        } : undefined,
      },
      include: {
        company: { select: { id: true, name: true } },
        supervisors: { select: { id: true, name: true, email: true, role: true } },
        members: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    // Atualizar teamId dos supervisores
    if (supervisorIds.length > 0) {
      await prisma.user.updateMany({
        where: { id: { in: supervisorIds } },
        data: { teamId: team.id },
      });
    }

    return NextResponse.json({ team }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar time:", error);
    return NextResponse.json({ error: "Erro ao criar time" }, { status: 500 });
  }
}
