import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const payload: any = await verifyToken(req);
    if (!payload) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    if (payload.role === "SUPER_ADMIN") {
      return NextResponse.json({ survey: null, message: "SUPER_ADMIN não responde surveys" });
    }

    const userId = payload.id;

    const answeredSurveys = await prisma.surveyResponse.findMany({
      where: { userId },
      select: { surveyId: true },
    });

    const answeredIds = answeredSurveys.map((r: { surveyId: number }) => r.surveyId);

    const availableSurveys = await prisma.survey.findMany({
      where: {
        isActive: true,
        id: { notIn: answeredIds },
      },
    });

    if (availableSurveys.length === 0) {
      return NextResponse.json({ survey: null, message: "Nenhuma pesquisa disponível" });
    }

    const randomIndex = Math.floor(Math.random() * availableSurveys.length);
    const survey = availableSurveys[randomIndex];

    let parsedSurvey = {
      ...survey,
      options: survey.options ? JSON.parse(survey.options) : null,
    };

    return NextResponse.json({ survey: parsedSurvey });
  } catch (error: any) {
    console.error("[GET /api/surveys/random] Error:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao buscar pesquisa" },
      { status: 500 }
    );
  }
}
