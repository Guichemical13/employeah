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

    const responses = await prisma.surveyResponse.findMany({
      include: {
        survey: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
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
      orderBy: { createdAt: "desc" },
    });

    const parsedResponses = responses.map((r: any) => ({
      ...r,
      response: JSON.parse(r.response),
      survey: {
        ...r.survey,
        options: r.survey.options ? JSON.parse(r.survey.options) : null,
      },
    }));

    return NextResponse.json({ responses: parsedResponses });
  } catch (error: any) {
    console.error("[GET /api/surveys/responses] Error:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao buscar respostas" },
      { status: 403 }
    );
  }
}
