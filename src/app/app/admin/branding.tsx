"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Palette, Upload, Eye, Save, RotateCcw } from "lucide-react";

export default function BrandingAdmin() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [branding, setBranding] = useState({
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

  useEffect(() => {
    fetchUserAndBranding();
  }, []);

  const fetchUserAndBranding = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      
      // Buscar dados do usuário
      const userRes = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userData = await userRes.json();
      
      if (!userData.user?.companyId) {
        alert("Usuário sem empresa associada");
        return;
      }

      setCompanyId(userData.user.companyId);

      // Buscar branding da empresa
      const brandingRes = await fetch(`/api/companies/${userData.user.companyId}/branding`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const brandingData = await brandingRes.json();
      
      // Garantir que todos os campos sejam strings (não undefined)
      setBranding({
        logoUrl: brandingData.logoUrl || "",
        displayName: brandingData.displayName || "",
        primaryColor: brandingData.primaryColor || "#026876",
        secondaryColor: brandingData.secondaryColor || "#03BBAF",
        accentColor: brandingData.accentColor || "#03A0A",
        sidebarColor: brandingData.sidebarColor || "#1F2937",
        sidebarTextColor: brandingData.sidebarTextColor || "#FFFFFF",
        buttonStyle: brandingData.buttonStyle || "rounded",
        fontFamily: brandingData.fontFamily || "Inter",
        customCss: brandingData.customCss || "",
      });
    } catch (error) {
      console.error("Erro ao carregar branding:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!companyId) return;

    try {
      setSaving(true);
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");

      const res = await fetch(`/api/companies/${companyId}/branding`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(branding),
      });

      if (!res.ok) throw new Error("Erro ao salvar branding");

      alert("✅ Configurações salvas com sucesso!");
      
      // Recarregar a página para aplicar as mudanças
      window.location.reload();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("❌ Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm("Deseja restaurar as configurações padrão?")) {
      setBranding({
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
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#03BBAF]"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#026876]">Personalização White-Label</h1>
          <p className="text-gray-600 mt-2">
            Configure a identidade visual da sua empresa no sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            className="border-gray-300 hover:border-red-500 hover:text-red-500"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Restaurar Padrão
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-[#026876] to-[#03BBAF] hover:from-[#026876]/90 hover:to-[#03BBAF]/90 text-white"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar Configurações
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Logo da Empresa */}
        <Card className="border-2 border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-[#03BBAF]" />
              Logo da Empresa
            </CardTitle>
            <CardDescription>
              Adicione o logo da sua empresa (será exibido ao lado do logo EmploYEAH)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="logoUrl">URL do Logo</Label>
              <Input
                id="logoUrl"
                placeholder="https://exemplo.com/logo.png"
                value={branding.logoUrl || ""}
                onChange={(e) => setBranding({ ...branding, logoUrl: e.target.value })}
                className="h-12"
              />
              <p className="text-xs text-gray-500">
                Recomendado: PNG ou SVG com fundo transparente, dimensões 200x200px
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Nome de Exibição no Menu</Label>
              <Input
                id="displayName"
                placeholder="Ex: Minha Empresa"
                value={branding.displayName || ""}
                onChange={(e) => setBranding({ ...branding, displayName: e.target.value })}
                className="h-12"
              />
              <p className="text-xs text-gray-500">
                Deixe vazio para usar "EmploYEAH!" (padrão). Este nome aparecerá no menu lateral.
              </p>
            </div>
            
            {branding.logoUrl && (
              <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                <img
                  src={branding.logoUrl}
                  alt="Preview do logo"
                  className="h-20 mx-auto object-contain"
                  onError={(e) => {
                    e.currentTarget.src = "/logo.svg";
                    e.currentTarget.alt = "Erro ao carregar logo";
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cores do Sistema */}
        <Card className="border-2 border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-[#03BBAF]" />
              Esquema de Cores
            </CardTitle>
            <CardDescription>
              Personalize as cores principais do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Cor Primária</Label>
                <div className="flex gap-2">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={branding.primaryColor}
                    onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                    className="w-20 h-12 cursor-pointer"
                  />
                  <Input
                    value={branding.primaryColor}
                    onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                    className="flex-1 h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondaryColor">Cor Secundária</Label>
                <div className="flex gap-2">
                  <Input
                    id="secondaryColor"
                    type="color"
                    value={branding.secondaryColor}
                    onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                    className="w-20 h-12 cursor-pointer"
                  />
                  <Input
                    value={branding.secondaryColor}
                    onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                    className="flex-1 h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accentColor">Cor de Destaque</Label>
                <div className="flex gap-2">
                  <Input
                    id="accentColor"
                    type="color"
                    value={branding.accentColor}
                    onChange={(e) => setBranding({ ...branding, accentColor: e.target.value })}
                    className="w-20 h-12 cursor-pointer"
                  />
                  <Input
                    value={branding.accentColor}
                    onChange={(e) => setBranding({ ...branding, accentColor: e.target.value })}
                    className="flex-1 h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sidebarColor">Cor do Menu</Label>
                <div className="flex gap-2">
                  <Input
                    id="sidebarColor"
                    type="color"
                    value={branding.sidebarColor}
                    onChange={(e) => setBranding({ ...branding, sidebarColor: e.target.value })}
                    className="w-20 h-12 cursor-pointer"
                  />
                  <Input
                    value={branding.sidebarColor}
                    onChange={(e) => setBranding({ ...branding, sidebarColor: e.target.value })}
                    className="flex-1 h-12"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sidebarTextColor">Cor do Texto do Menu</Label>
              <div className="flex gap-2">
                <Input
                  id="sidebarTextColor"
                  type="color"
                  value={branding.sidebarTextColor}
                  onChange={(e) => setBranding({ ...branding, sidebarTextColor: e.target.value })}
                  className="w-20 h-12 cursor-pointer"
                />
                <Input
                  value={branding.sidebarTextColor}
                  onChange={(e) => setBranding({ ...branding, sidebarTextColor: e.target.value })}
                  className="flex-1 h-12"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estilos de Interface */}
        <Card className="border-2 border-gray-200">
          <CardHeader>
            <CardTitle>Estilos de Interface</CardTitle>
            <CardDescription>
              Personalize elementos visuais da interface
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="buttonStyle">Estilo dos Botões</Label>
              <Select value={branding.buttonStyle} onValueChange={(value) => setBranding({ ...branding, buttonStyle: value })}>
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rounded">Arredondado (Padrão)</SelectItem>
                  <SelectItem value="square">Quadrado</SelectItem>
                  <SelectItem value="pill">Pill (Muito Arredondado)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fontFamily">Fonte do Sistema</Label>
              <Select value={branding.fontFamily} onValueChange={(value) => setBranding({ ...branding, fontFamily: value })}>
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Inter">Inter (Padrão)</SelectItem>
                  <SelectItem value="Roboto">Roboto</SelectItem>
                  <SelectItem value="Open Sans">Open Sans</SelectItem>
                  <SelectItem value="Poppins">Poppins</SelectItem>
                  <SelectItem value="Montserrat">Montserrat</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* CSS Customizado */}
        <Card className="border-2 border-gray-200">
          <CardHeader>
            <CardTitle>CSS Customizado (Avançado)</CardTitle>
            <CardDescription>
              Adicione CSS personalizado para customizações avançadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder=".custom-button { border-radius: 20px; }"
              value={branding.customCss || ""}
              onChange={(e) => setBranding({ ...branding, customCss: e.target.value })}
              rows={6}
              className="font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-2">
              ⚠️ Cuidado: CSS inválido pode quebrar a interface
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Preview */}
      <Card className="border-2 border-[#03BBAF]/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-[#03BBAF]" />
            Preview das Cores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Primária</p>
              <div
                className="h-20 rounded-lg shadow-lg"
                style={{ backgroundColor: branding.primaryColor }}
              ></div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Secundária</p>
              <div
                className="h-20 rounded-lg shadow-lg"
                style={{ backgroundColor: branding.secondaryColor }}
              ></div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Destaque</p>
              <div
                className="h-20 rounded-lg shadow-lg"
                style={{ backgroundColor: branding.accentColor }}
              ></div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Menu</p>
              <div
                className="h-20 rounded-lg shadow-lg flex items-center justify-center text-sm font-bold"
                style={{
                  backgroundColor: branding.sidebarColor,
                  color: branding.sidebarTextColor,
                }}
              >
                Texto
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
