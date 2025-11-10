import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, requireRole } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const payload: any = await verifyToken(req);
    if (!payload) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    requireRole(payload, ["SUPER_ADMIN"]);

    const surveys = await prisma.survey.findMany({
      include: {
        _count: {
          select: { responses: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ surveys });
  } catch (error: any) {
    console.error("[GET /api/surveys/admin] Error:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao listar pesquisas" },
      { status: 403 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload: any = await verifyToken(req);
    if (!payload) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    requireRole(payload, ["SUPER_ADMIN"]);

    const body = await req.json();
    const { type, question, options } = body;

    if (!type || !question) {
      return NextResponse.json(
        { error: "type e question são obrigatórios" },
        { status: 400 }
      );
    }

    const survey = await prisma.survey.create({
      data: {
        type,
        question,
        options: options ? JSON.stringify(options) : null,
        isActive: true,
      },
    });

    return NextResponse.json({ survey });
  } catch (error: any) {
    console.error("[POST /api/surveys/admin] Error:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao criar pesquisa" },
      { status: 500 }
    );
  }
}
