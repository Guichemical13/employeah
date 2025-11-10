import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const payload: any = await verifyToken(req);
    if (!payload) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    if (payload.role === "SUPER_ADMIN") {
      return NextResponse.json({ error: "SUPER_ADMIN não pode responder surveys" }, { status: 403 });
    }

    const userId = payload.id;
    const companyId = payload.companyId;

    if (!companyId) {
      return NextResponse.json(
        { error: "Usuário sem empresa associada" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { surveyId, response } = body;

    if (!surveyId || !response) {
      return NextResponse.json(
        { error: "surveyId e response são obrigatórios" },
        { status: 400 }
      );
    }

    const existing = await prisma.surveyResponse.findUnique({
      where: {
        surveyId_userId: {
          surveyId: parseInt(surveyId),
          userId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Pesquisa já respondida" },
        { status: 400 }
      );
    }

    const surveyResponse = await prisma.surveyResponse.create({
      data: {
        surveyId: parseInt(surveyId),
        userId,
        companyId,
        response: JSON.stringify(response),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Resposta salva com sucesso!",
      surveyResponse,
    });
  } catch (error: any) {
    console.error("[POST /api/surveys/respond] Error:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao salvar resposta" },
      { status: 500 }
    );
  }
}
