"use client";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Image from "next/image";
import {
  LogOut,
  Settings,
  Trophy,
  Handshake,
  LayoutDashboard,
  Users,
  Building2,
  Bell,
  Menu,
  X,
  Coins,
  Heart,
  Palette,
  BarChart3,
} from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { useBranding } from "@/hooks/useBranding";
import { useState, useEffect } from "react";
import LogoutSurveyModal from "./LogoutSurveyModal";

export type SidebarTab =
  | "central"
  | "rewards"
  | "elogios"
  | "ajustes"
  | "notifications"
  | "empresas"
  | "categorias"
  | "usuarios"
  | "itens"
  | "geral"
  | "pontos"
  | "elogios-admin"
  | "branding"
  | "surveys";

interface SidebarMenuProps {
  tab: string;
  setTab: (t: string) => void;
  onLogout: () => void;
  showAdminTabs?: boolean;
  userRole?: string;
}

export default function SidebarMenu({
  tab,
  setTab,
  onLogout,
  showAdminTabs,
  userRole,
}: SidebarMenuProps) {
  const { unreadCount } = useNotifications();
  const { branding, loading } = useBranding();
  const [showSurvey, setShowSurvey] = useState(false);
  const [hasPendingSurvey, setHasPendingSurvey] = useState(false);

  useEffect(() => {
    if (userRole !== "SUPER_ADMIN") {
      checkPendingSurvey();
    }
  }, [userRole]);

  const checkPendingSurvey = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) return;

      const res = await fetch("/api/surveys/random", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setHasPendingSurvey(!!(data && data.survey));
      }
    } catch (error) {
      console.error("Erro ao verificar survey pendente:", error);
    }
  };

  const handleLogoutClick = () => {
    if (userRole === "SUPER_ADMIN") {
      onLogout();
      return;
    }

    if (hasPendingSurvey) {
      setShowSurvey(true);
    } else {
      onLogout();
    }
  };

  const handleSurveyComplete = () => {
    setShowSurvey(false);
    setHasPendingSurvey(false);
    onLogout();
  };

  const handleSurveySkip = () => {
    setShowSurvey(false);
    onLogout();
  };

  const [isOpen, setIsOpen] = useState(false);

  const handleTabChange = (newTab: string) => {
    setTab(newTab);
    setIsOpen(false);
  };

  const getButtonStyle = (isActive: boolean) => {
    if (isActive) {
      return {
        backgroundColor: branding?.primaryColor || '#FFFFFF',
        color: branding?.sidebarTextColor === '#FFFFFF' ? '#000000' : branding?.primaryColor || '#5a5ad6',
      };
    }
    return {
      color: branding?.sidebarTextColor || '#374151',
    };
  };

  const getButtonClass = (isActive: boolean) => {
    const borderRadius = branding?.buttonStyle === 'pill' ? 'rounded-full' : 
                        branding?.buttonStyle === 'square' ? 'rounded-none' : 
                        'rounded-lg';
    
    return `justify-start text-base font-medium w-full flex gap-2 p-3 transition-all ${borderRadius} ${
      isActive ? 'shadow-md' : 'hover:bg-white/10'
    }`;
  };

  const SidebarContent = () => (
    <div 
      className="h-full flex flex-col"
      style={{ 
        backgroundColor: branding?.sidebarColor || '#d6d3f5',
        color: branding?.sidebarTextColor || '#000000'
      }}
    >
      <div className="flex flex-col items-center py-6 border-b" style={{ borderColor: `${branding?.sidebarTextColor || '#bcb8e6'}30` }}>
        <div className="flex items-center gap-3">
          <Image src="/logo.svg" alt="EmploYEAH!" width={40} height={40} />
          {branding?.logoUrl && (
            <>
              <div className="h-8 w-px" style={{ backgroundColor: `${branding.sidebarTextColor}40` }}></div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={branding.logoUrl} 
                alt="Logo da Empresa" 
                width={40} 
                height={40}
                className="object-contain max-w-[40px] max-h-[40px]"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </>
          )}
        </div>
        <h1 className="text-base font-bold mt-3" style={{ color: branding?.primaryColor || '#5a5ad6' }}>
          {branding?.displayName || 'EmploYEAH!'}
        </h1>
      </div>
      <div className="flex-1 flex flex-col justify-center px-2">
        <div className="flex flex-col gap-2 p-2 w-full">
          {showAdminTabs ? (
            <>
              {(userRole === "SUPER_ADMIN" || userRole === "COMPANY_ADMIN") && (
                <button
                  onClick={() => handleTabChange("geral")}
                  className={getButtonClass(tab === "geral")}
                  style={getButtonStyle(tab === "geral")}
                >
                  <LayoutDashboard size={18} /> Geral
                </button>
              )}
              {userRole === "SUPER_ADMIN" && (
                <button
                  onClick={() => handleTabChange("empresas")}
                  className={`justify-start text-base font-medium w-full flex gap-2 p-3 rounded-lg transition-colors ${
                    tab === "empresas" 
                      ? "bg-white text-[#5a5ad6] shadow-sm" 
                      : "text-gray-700 hover:bg-white/50"
                  }`}
                >
                  <Building2 size={18} /> Empresas
                </button>
              )}
              <button
                onClick={() => handleTabChange("usuarios")}
                className={`justify-start text-base font-medium w-full flex gap-2 p-3 rounded-lg transition-colors ${
                  tab === "usuarios" 
                    ? "bg-white text-[#5a5ad6] shadow-sm" 
                    : "text-gray-700 hover:bg-white/50"
                }`}
              >
                <Users size={18} /> Usuários
              </button>
              <button
                onClick={() => handleTabChange("itens")}
                className={`justify-start text-base font-medium w-full flex gap-2 p-3 rounded-lg transition-colors ${
                  tab === "itens" 
                    ? "bg-white text-[#5a5ad6] shadow-sm" 
                    : "text-gray-700 hover:bg-white/50"
                }`}
              >
                <Trophy size={18} /> Itens
              </button>
              <button
                onClick={() => handleTabChange("categorias")}
                className={`justify-start text-base font-medium w-full flex gap-2 p-3 rounded-lg transition-colors ${
                  tab === "categorias" 
                    ? "bg-white text-[#5a5ad6] shadow-sm" 
                    : "text-gray-700 hover:bg-white/50"
                }`}
              >
                <LayoutDashboard size={18} /> Categorias
              </button>
              <button
                onClick={() => handleTabChange("pontos")}
                className={`justify-start text-base font-medium w-full flex gap-2 p-3 rounded-lg transition-colors ${
                  tab === "pontos" 
                    ? "bg-white text-[#5a5ad6] shadow-sm" 
                    : "text-gray-700 hover:bg-white/50"
                }`}
              >
                <Coins size={18} /> Gestão de Pontos
              </button>
              <button
                onClick={() => handleTabChange("elogios-admin")}
                className={`justify-start text-base font-medium w-full flex gap-2 p-3 rounded-lg transition-colors ${
                  tab === "elogios-admin" 
                    ? "bg-white text-[#5a5ad6] shadow-sm" 
                    : "text-gray-700 hover:bg-white/50"
                }`}
              >
                <Heart size={18} /> Mural de Elogios
              </button>
              {(userRole === "COMPANY_ADMIN" || userRole === "SUPER_ADMIN") && (
                <button
                  onClick={() => handleTabChange("branding")}
                  className={`justify-start text-base font-medium w-full flex gap-2 p-3 rounded-lg transition-colors ${
                    tab === "branding" 
                      ? "bg-white text-[#5a5ad6] shadow-sm" 
                      : "text-gray-700 hover:bg-white/50"
                  }`}
                >
                  <Palette size={18} /> Branding
                </button>
              )}
              {userRole === "SUPER_ADMIN" && (
                <button
                  onClick={() => handleTabChange("surveys")}
                  className={`justify-start text-base font-medium w-full flex gap-2 p-3 rounded-lg transition-colors ${
                    tab === "surveys" 
                      ? "bg-white text-[#5a5ad6] shadow-sm" 
                      : "text-gray-700 hover:bg-white/50"
                  }`}
                >
                  <BarChart3 size={18} /> Analytics Surveys
                </button>
              )}
              <button
                onClick={() => handleTabChange("notifications")}
                className={`justify-start text-base font-medium w-full flex gap-2 p-3 rounded-lg transition-colors relative ${
                  tab === "notifications" 
                    ? "bg-white text-[#5a5ad6] shadow-sm" 
                    : "text-gray-700 hover:bg-white/50"
                }`}
              >
                <Bell size={18} /> Notificações
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-5 text-center leading-none">
                    {unreadCount}
                  </span>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleTabChange("central")}
                className={`justify-start text-base font-medium w-full flex gap-2 p-3 rounded-lg transition-colors ${
                  tab === "central" 
                    ? "bg-white text-[#5a5ad6] shadow-sm" 
                    : "text-gray-700 hover:bg-white/50"
                }`}
              >
                <LayoutDashboard size={18} /> Central
              </button>
              <button
                onClick={() => handleTabChange("rewards")}
                className={`justify-start text-base font-medium w-full flex gap-2 p-3 rounded-lg transition-colors ${
                  tab === "rewards" 
                    ? "bg-white text-[#5a5ad6] shadow-sm" 
                    : "text-gray-700 hover:bg-white/50"
                }`}
              >
                <Trophy size={18} /> Recompensas
              </button>
              <button
                onClick={() => handleTabChange("elogios")}
                className={`justify-start text-base font-medium w-full flex gap-2 p-3 rounded-lg transition-colors ${
                  tab === "elogios" 
                    ? "bg-white text-[#5a5ad6] shadow-sm" 
                    : "text-gray-700 hover:bg-white/50"
                }`}
              >
                <Handshake size={18} /> Elogios
              </button>
              <button
                onClick={() => handleTabChange("notifications")}
                className={`justify-start text-base font-medium w-full flex gap-2 p-3 rounded-lg transition-colors relative ${
                  tab === "notifications" 
                    ? "bg-white text-[#5a5ad6] shadow-sm" 
                    : "text-gray-700 hover:bg-white/50"
                }`}
              >
                <Bell size={18} /> Notificações
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-5 text-center leading-none">
                    {unreadCount}
                  </span>
                )}
              </button>
            </>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2 p-4 border-t border-[#bcb8e6]">
        <button
          onClick={() => handleTabChange("ajustes")}
          className={`flex items-center gap-2 text-base font-medium p-3 rounded-lg transition-colors w-full ${
            tab === "ajustes" 
              ? "bg-white text-[#5a5ad6] shadow-sm" 
              : "text-gray-700 hover:bg-white/50"
          }`}
        >
          <Settings size={18} /> Ajustes
        </button>
        <button
          onClick={handleLogoutClick}
          className="flex items-center gap-2 text-base font-medium text-blue-700 hover:bg-blue-50 p-3 rounded-lg transition-colors w-full"
        >
          <LogOut size={18} /> <span className="font-bold">Sair</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-64 lg:flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile Header with Menu Button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 border-b px-4 py-3" 
           style={{ 
             backgroundColor: branding?.sidebarColor || '#d6d3f5',
             borderColor: `${branding?.sidebarTextColor || '#bcb8e6'}50`
           }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/logo.svg" alt="EmploYEAH!" width={32} height={32} />
            <h1 className="text-base font-bold" style={{ color: branding?.primaryColor || '#5a5ad6' }}>
              {branding?.displayName || 'EmploYEAH!'}
            </h1>
          </div>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <button className="p-2 rounded-md transition-colors" 
                      style={{ 
                        backgroundColor: 'transparent',
                        color: branding?.sidebarTextColor || '#5a5ad6'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${branding?.sidebarTextColor || '#bcb8e6'}30`}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                <Menu size={24} />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SidebarContent />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Logout Survey Modal */}
      <LogoutSurveyModal
        open={showSurvey}
        onClose={() => setShowSurvey(false)}
        onComplete={handleSurveyComplete}
        onSkip={handleSurveySkip}
      />
    </>
  );
}
