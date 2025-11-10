import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload: any = await verifyToken(req);
    if (!payload) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { id } = await params;
    const companyId = parseInt(id);
    
    // Verificar se o usuário tem acesso a esta empresa
    if (payload.role !== "SUPER_ADMIN" && payload.companyId !== companyId) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const branding = await prisma.companyBranding.findUnique({
      where: { companyId },
    });

    // Se não existir branding, retornar valores padrão
    if (!branding) {
      return NextResponse.json({
        companyId,
        logoUrl: "",
        displayName: "",
        primaryColor: "#026876",
        secondaryColor: "#03BBAF",
        accentColor: "#03A0A",
        sidebarColor: "#1F2937",
        sidebarTextColor: "#FFFFFF",
        buttonStyle: "rounded",
        fontFamily: "Inter",
        customCss: "",
      });
    }

    // Garantir que campos nulos sejam strings vazias
    return NextResponse.json({
      ...branding,
      logoUrl: branding.logoUrl || "",
      displayName: branding.displayName || "",
      customCss: branding.customCss || "",
    });
  } catch (error: any) {
    console.error("[GET /api/companies/[id]/branding] Error:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao buscar branding" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload: any = await verifyToken(req);
    if (!payload) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { id } = await params;
    const companyId = parseInt(id);

    // Verificar permissões
    if (
      payload.role !== "SUPER_ADMIN" &&
      (payload.role !== "COMPANY_ADMIN" || payload.companyId !== companyId)
    ) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const body = await req.json();
    const {
      logoUrl,
      displayName,
      primaryColor,
      secondaryColor,
      accentColor,
      sidebarColor,
      sidebarTextColor,
      buttonStyle,
      fontFamily,
      customCss,
    } = body;

    // Validar cores (hex format)
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (primaryColor && !hexColorRegex.test(primaryColor)) {
      return NextResponse.json(
        { error: "Cor primária inválida" },
        { status: 400 }
      );
    }

    // Upsert (create or update)
    const branding = await prisma.companyBranding.upsert({
      where: { companyId },
      create: {
        companyId,
        logoUrl,
        displayName,
        primaryColor: primaryColor || "#026876",
        secondaryColor: secondaryColor || "#03BBAF",
        accentColor: accentColor || "#03A0A",
        sidebarColor: sidebarColor || "#1F2937",
        sidebarTextColor: sidebarTextColor || "#FFFFFF",
        buttonStyle: buttonStyle || "rounded",
        fontFamily: fontFamily || "Inter",
        customCss,
      },
      update: {
        logoUrl,
        displayName,
        primaryColor,
        secondaryColor,
        accentColor,
        sidebarColor,
        sidebarTextColor,
        buttonStyle,
        fontFamily,
        customCss,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(branding);
  } catch (error: any) {
    console.error("[PUT /api/companies/[id]/branding] Error:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao atualizar branding" },
      { status: 500 }
    );
  }
}
