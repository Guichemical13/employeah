import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const surveys = await prisma.survey.findMany({
      include: {
        _count: {
          select: { responses: true }
        }
      }
    });

    const responses = await prisma.surveyResponse.findMany({
      select: {
        id: true,
        surveyId: true,
        userId: true,
        companyId: true,
        createdAt: true,
      }
    });

    return NextResponse.json({
      totalSurveys: surveys.length,
      surveys: surveys.map((s: any) => ({
        id: s.id,
        type: s.type,
        question: s.question,
        isActive: s.isActive,
        responseCount: s._count.responses,
      })),
      totalResponses: responses.length,
      responses,
    });
  } catch (error: any) {
    console.error("[GET /api/surveys/debug] Error:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao buscar surveys" },
      { status: 500 }
    );
  }
}
