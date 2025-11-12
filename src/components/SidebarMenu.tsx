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
  UserCircle2,
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
  | "surveys"
  | "times";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  username?: string;
  profilePicture?: string;
  role: string;
  points: number;
}

interface SidebarMenuProps {
  tab: string;
  setTab: (t: string) => void;
  onLogout: () => void;
  showAdminTabs?: boolean;
  userRole?: string;
  userProfile?: UserProfile;
}

export default function SidebarMenu({
  tab,
  setTab,
  onLogout,
  showAdminTabs,
  userRole,
  userProfile,
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
        backgroundColor: branding?.sidebarColor || '#03BBAF',
        color: branding?.sidebarTextColor || '#000000'
      }}
    >
      <div className="flex flex-col items-center py-6 border-b" style={{ borderColor: `${branding?.sidebarTextColor || '#bcb8e6'}30` }}>
        <div className="w-full flex justify-center items-center">
          {branding?.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={branding.logoUrl}
              alt="Logo da Empresa"
              className="w-full object-contain max-h-20"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <Image src="/logo.svg" alt="EmploYEAH!" width={40} height={40} />
          )}
        </div>
        <h1 className="text-base font-bold mt-3" style={{ color: branding?.primaryColor || '#ffffff' , fontWeight: 'bold' }}>
          {branding?.displayName || 'EmploYEAH!'}
        </h1>
      </div>
      
      {/* Perfil do Usuário */}
      {userProfile && (
        <div className="flex flex-col items-center py-4 px-4 border-b" style={{ borderColor: `${branding?.sidebarTextColor || '#bcb8e6'}30` }}>
          <div className="relative w-20 h-20 mb-3">
            {userProfile.profilePicture ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={userProfile.profilePicture}
                alt={userProfile.name}
                className="w-full h-full rounded-full object-cover border-2"
                style={{ borderColor: branding?.primaryColor || '#ffffff' }}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                  (e.currentTarget.nextElementSibling as HTMLElement)?.classList.remove('hidden');
                }}
              />
            ) : null}
            <UserCircle2 
              size={80} 
              className={userProfile.profilePicture ? "hidden" : ""}
              style={{ color: branding?.primaryColor || '#ffffff' }}
            />
          </div>
          <h2 className="text-lg font-bold text-center" style={{ color: branding?.sidebarTextColor || '#ffffff' }}>
            {userProfile.name}
          </h2>
          {userProfile.username && (
            <p className="text-sm opacity-80 text-center" style={{ color: branding?.sidebarTextColor || '#ffffff' }}>
              @{userProfile.username}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2 px-3 py-1 rounded-full" style={{ backgroundColor: `${branding?.primaryColor || '#ffffff'}20` }}>
            <Coins size={16} style={{ color: branding?.primaryColor || '#ffffff' }} />
            <span className="text-sm font-bold" style={{ color: branding?.primaryColor || '#ffffff' }}>
              {userProfile.points} pts
            </span>
          </div>
        </div>
      )}
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
                  className={getButtonClass(tab === "empresas")}
                  style={getButtonStyle(tab === "empresas")}
                >
                  <Building2 size={18} /> Empresas
                </button>
              )}
              {(userRole === "SUPER_ADMIN" || userRole === "COMPANY_ADMIN") && (
                <button
                  onClick={() => handleTabChange("usuarios")}
                  className={getButtonClass(tab === "usuarios")}
                  style={getButtonStyle(tab === "usuarios")}
                >
                  <Users size={18} /> Usuários
                </button>
              )}
              {(userRole === "SUPER_ADMIN" || userRole === "COMPANY_ADMIN") && (
                <button
                  onClick={() => handleTabChange("times")}
                  className={getButtonClass(tab === "times")}
                  style={getButtonStyle(tab === "times")}
                >
                  <Users size={18} /> Times
                </button>
              )}
              {(userRole === "SUPER_ADMIN" || userRole === "COMPANY_ADMIN") && (
                <button
                  onClick={() => handleTabChange("itens")}
                  className={getButtonClass(tab === "itens")}
                  style={getButtonStyle(tab === "itens")}
                >
                  <Trophy size={18} /> Itens
                </button>
              )}
              {(userRole === "SUPER_ADMIN" || userRole === "COMPANY_ADMIN") && (
                <button
                  onClick={() => handleTabChange("categorias")}
                  className={getButtonClass(tab === "categorias")}
                  style={getButtonStyle(tab === "categorias")}
                >
                  <LayoutDashboard size={18} /> Categorias
                </button>
              )}
              {(userRole === "SUPER_ADMIN" || userRole === "COMPANY_ADMIN") && (
                <button
                  onClick={() => handleTabChange("pontos")}
                  className={getButtonClass(tab === "pontos")}
                  style={getButtonStyle(tab === "pontos")}
                >
                  <Coins size={18} /> Gestão de Pontos
                </button>
              )}
              {(userRole === "SUPER_ADMIN" || userRole === "COMPANY_ADMIN") && (
                <button
                  onClick={() => handleTabChange("elogios-admin")}
                  className={getButtonClass(tab === "elogios-admin")}
                  style={getButtonStyle(tab === "elogios-admin")}
                >
                  <Heart size={18} /> Mural de Elogios
                </button>
              )}
              {(userRole === "COMPANY_ADMIN" || userRole === "SUPER_ADMIN") && (
                <button
                  onClick={() => handleTabChange("branding")}
                  className={getButtonClass(tab === "branding")}
                  style={getButtonStyle(tab === "branding")}
                >
                  <Palette size={18} /> Branding
                </button>
              )}
              {userRole === "SUPER_ADMIN" && (
                <button
                  onClick={() => handleTabChange("surveys")}
                  className={getButtonClass(tab === "surveys")}
                  style={getButtonStyle(tab === "surveys")}
                >
                  <BarChart3 size={18} /> Surveys - Sistema
                </button>
              )}
              <button
                onClick={() => handleTabChange("notifications")}
                className={getButtonClass(tab === "notifications") + " relative"}
                style={getButtonStyle(tab === "notifications")}
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
                className={getButtonClass(tab === "central")}
                style={getButtonStyle(tab === "central")}
              >
                <LayoutDashboard size={18} /> Central
              </button>
              <button
                onClick={() => handleTabChange("rewards")}
                className={getButtonClass(tab === "rewards")}
                style={getButtonStyle(tab === "rewards")}
              >
                <Trophy size={18} /> Recompensas
              </button>
              <button
                onClick={() => handleTabChange("elogios")}
                className={getButtonClass(tab === "elogios")}
                style={getButtonStyle(tab === "elogios")}
              >
                <Handshake size={18} /> Elogios
              </button>
              <button
                onClick={() => handleTabChange("notifications")}
                className={getButtonClass(tab === "notifications") + " relative"}
                style={getButtonStyle(tab === "notifications")}
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
      <div className="flex flex-col gap-2 p-4 border-t" style={{ borderColor: `${branding?.sidebarTextColor || '#bcb8e6'}30` }}>
        <button
          onClick={() => handleTabChange("ajustes")}
          className={getButtonClass(tab === "ajustes")}
          style={getButtonStyle(tab === "ajustes")}
        >
          <Settings size={18} /> Ajustes
        </button>
        <button
          onClick={handleLogoutClick}
          className={getButtonClass(false)}
          style={{
            color: branding?.sidebarTextColor || '#374151',
            fontWeight: 'bold'
          }}
        >
          <LogOut size={18} /> Sair
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
