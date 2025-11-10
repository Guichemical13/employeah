import { useState, useEffect } from "react";

interface CompanyBranding {
  logoUrl?: string;
  displayName?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  sidebarColor: string;
  sidebarTextColor: string;
  buttonStyle: string;
  fontFamily: string;
  customCss?: string;
}

export function useBranding() {
  const [branding, setBranding] = useState<CompanyBranding | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        
        if (!token) {
          setLoading(false);
          return;
        }

        // Buscar dados do usuário
        const userRes = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!userRes.ok) {
          setLoading(false);
          return;
        }

        const userData = await userRes.json();
        
        if (!userData.user?.companyId) {
          setLoading(false);
          return;
        }

        // Buscar branding da empresa
        const brandingRes = await fetch(`/api/companies/${userData.user.companyId}/branding`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!brandingRes.ok) {
          setLoading(false);
          return;
        }

        const brandingData = await brandingRes.json();
        setBranding(brandingData);

        // Aplicar CSS customizado se existir
        if (brandingData.customCss) {
          const styleId = "custom-branding-css";
          let styleElement = document.getElementById(styleId) as HTMLStyleElement;
          
          if (!styleElement) {
            styleElement = document.createElement("style");
            styleElement.id = styleId;
            document.head.appendChild(styleElement);
          }
          
          styleElement.textContent = brandingData.customCss;
        }

        // Aplicar font family ao body
        if (brandingData.fontFamily) {
          document.documentElement.style.setProperty('--font-family', brandingData.fontFamily);
        }

      } catch (error) {
        console.error("Erro ao buscar branding:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBranding();
  }, []);

  return { branding, loading };
}
