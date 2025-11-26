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
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { useBranding } from "@/hooks/useBranding";
import { usePermissions } from "@/hooks/usePermissions";
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
  const { hasPermission, loading: permissionsLoading } = usePermissions();
  const [showSurvey, setShowSurvey] = useState(false);
  const [hasPendingSurvey, setHasPendingSurvey] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(true);

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
        backgroundColor: `${branding?.primaryColor || '#FFFFFF'}20`,
        color: '#FFFFFF',
        borderLeft: `4px solid ${branding?.primaryColor || '#FFFFFF'}`,
      };
    }
    return {
      color: branding?.sidebarTextColor || '#374151',
      borderLeft: '4px solid transparent',
    };
  };

  const getButtonClass = (isActive: boolean) => {
    const borderRadius = branding?.buttonStyle === 'pill' ? 'rounded-r-full' : 
                        branding?.buttonStyle === 'square' ? 'rounded-none' : 
                        'rounded-r-md';
    
    return `justify-start text-sm font-medium w-full flex items-center gap-2 py-2 px-3 transition-all ${borderRadius} ${
      isActive ? '' : 'hover:bg-white/10'
    }`;
  };

  const SidebarContent = () => (
    <div 
      className="h-full flex flex-col"
      style={{ 
        backgroundColor: branding?.sidebarColor || '#03BBAF',
        color: branding?.sidebarTextColor || '#000000',
        boxShadow: '2px 0px 10px 0px rgba(43, 43, 43, 0.4)',
      }}
    >
      <div className="flex flex-col items-center py-4 px-3 border-b" style={{ borderColor: `${branding?.sidebarTextColor || '#bcb8e6'}30` }}>
        <div className="w-full flex justify-center items-center">
          {branding?.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={branding.logoUrl}
              alt="Logo da Empresa"
              className="w-full object-contain max-h-16"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <Image src="/logo.svg" alt="EmploYEAH!" width={48} height={48} />
          )}
        </div>
        <h1 className="text-base font-bold mt-2" style={{ color: branding?.primaryColor || '#ffffff' , fontWeight: 'bold' }}>
          {branding?.displayName || 'EmploYEAH!'}
        </h1>
      </div>
      
      {/* Perfil do Usuário - Centralizado */}
      {userProfile && (
        <div className="flex flex-col items-center py-4 px-3 border-b" style={{ borderColor: `${branding?.sidebarTextColor || '#bcb8e6'}30` }}>
          <div className="relative w-16 h-16 flex-shrink-0">
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
              size={64} 
              className={userProfile.profilePicture ? "hidden" : ""}
              style={{ color: branding?.primaryColor || '#ffffff' }}
            />
          </div>
          <h2 className="text-sm font-bold mt-2 text-center" style={{ color: branding?.sidebarTextColor || '#ffffff' }}>
            {userProfile.name}
          </h2>
          {userProfile.username && (
            <p className="text-xs opacity-70 text-center" style={{ color: branding?.sidebarTextColor || '#ffffff' }}>
              @{userProfile.username}
            </p>
          )}
          <div className="flex items-center gap-1 mt-2 px-3 py-1 rounded-full" style={{ backgroundColor: `${branding?.primaryColor || '#ffffff'}20` }}>
            <Coins size={14} style={{ color: branding?.primaryColor || '#ffffff' }} />
            <span className="text-xs font-semibold" style={{ color: branding?.primaryColor || '#ffffff' }}>
              {userProfile.points} pts
            </span>
          </div>
        </div>
      )}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        <div className="flex flex-col gap-1 w-full">
          {showAdminTabs ? (
            <>
              {/* PAINEL - Para SUPER_ADMIN e COMPANY_ADMIN */}
              {(userRole === "SUPER_ADMIN" || userRole === "COMPANY_ADMIN") && (
                <div className="mb-0.5">
                  <div className="px-2 py-0.5">
                    <span className="text-xs uppercase tracking-wide font-semibold opacity-60" style={{ color: branding?.sidebarTextColor || '#374151' }}>
                      Painel
                    </span>
                  </div>
                  <button
                    onClick={() => handleTabChange("geral")}
                    className={getButtonClass(tab === "geral")}
                    style={getButtonStyle(tab === "geral")}
                  >
                    <LayoutDashboard size={16} /> <span>Geral</span>
                  </button>
                  
                  {userRole === "SUPER_ADMIN" && (
                    <button
                      onClick={() => handleTabChange("empresas")}
                      className={getButtonClass(tab === "empresas")}
                      style={getButtonStyle(tab === "empresas")}
                    >
                      <Building2 size={16} /> <span>Empresas</span>
                    </button>
                  )}
                </div>
              )}

              {/* PAINEL - Para SUPERVISOR */}
              {userRole === "SUPERVISOR" && (
                <div className="mb-0.5">
                  <div className="px-2 py-0.5">
                    <span className="text-xs uppercase tracking-wide font-semibold opacity-60" style={{ color: branding?.sidebarTextColor || '#374151' }}>
                      Painel
                    </span>
                  </div>
                  <button
                    onClick={() => handleTabChange("dashboard")}
                    className={getButtonClass(tab === "dashboard")}
                    style={getButtonStyle(tab === "dashboard")}
                  >
                    <LayoutDashboard size={16} /> <span>Painel</span>
                  </button>
                  {hasPermission('view_analytics') && (
                    <button
                      onClick={() => handleTabChange("analytics")}
                      className={getButtonClass(tab === "analytics")}
                      style={getButtonStyle(tab === "analytics")}
                    >
                      <BarChart3 size={16} /> <span>Analytics</span>
                    </button>
                  )}
                </div>
              )}
              
              {/* GESTÃO - Colapsável */}
              {(
                hasPermission('view_users_menu') ||
                hasPermission('insert_new_items_catalog') ||
                hasPermission('remove_items_catalog') ||
                hasPermission('transfer_remove_users') ||
                hasPermission('like_compliment_sent_by_others') ||
                userRole === "SUPER_ADMIN" ||
                userRole === "COMPANY_ADMIN"
              ) && (
                <div className="mb-0.5">
                  <button
                    onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
                    className="justify-start font-semibold w-full flex items-center gap-2 px-2 py-0.5 transition-colors"
                    style={{ 
                      color: branding?.sidebarTextColor || '#374151',
                    }}
                  >
                    {isAdminMenuOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    <span className="text-xs uppercase tracking-wide opacity-60">Gestão</span>
                  </button>
                  
                  {isAdminMenuOpen && (
                    <div className="flex flex-col gap-0.5">
                      {hasPermission('view_users_menu') && (
                        <button
                          onClick={() => handleTabChange("usuarios")}
                          className={getButtonClass(tab === "usuarios")}
                          style={getButtonStyle(tab === "usuarios")}
                        >
                          <Users size={16} /> <span>Usuários</span>
                        </button>
                      )}
                      {(userRole === "SUPER_ADMIN" || userRole === "COMPANY_ADMIN") && (
                        <button
                          onClick={() => handleTabChange("times")}
                          className={getButtonClass(tab === "times")}
                          style={getButtonStyle(tab === "times")}
                        >
                          <Users size={16} /> <span>Times</span>
                        </button>
                      )}
                      {(hasPermission('insert_new_items_catalog') || hasPermission('remove_items_catalog')) && (
                        <button
                          onClick={() => handleTabChange("itens")}
                          className={getButtonClass(tab === "itens")}
                          style={getButtonStyle(tab === "itens")}
                        >
                          <Trophy size={16} /> <span>Itens</span>
                        </button>
                      )}
                      {(hasPermission('insert_new_items_catalog') || hasPermission('remove_items_catalog')) && (
                        <button
                          onClick={() => handleTabChange("categorias")}
                          className={getButtonClass(tab === "categorias")}
                          style={getButtonStyle(tab === "categorias")}
                        >
                          <LayoutDashboard size={16} /> <span>Categorias</span>
                        </button>
                      )}
                      {hasPermission('transfer_remove_users') && (
                        <button
                          onClick={() => handleTabChange("pontos")}
                          className={getButtonClass(tab === "pontos")}
                          style={getButtonStyle(tab === "pontos")}
                        >
                          <Coins size={16} /> <span>Pontos</span>
                        </button>
                      )}
                      {hasPermission('like_compliment_sent_by_others') && (
                        <button
                          onClick={() => handleTabChange("elogios-admin")}
                          className={getButtonClass(tab === "elogios-admin")}
                          style={getButtonStyle(tab === "elogios-admin")}
                        >
                          <Heart size={16} /> <span>Elogios</span>
                        </button>
                      )}
                      {(userRole === "SUPER_ADMIN" || userRole === "COMPANY_ADMIN") && (
                        <button
                          onClick={() => handleTabChange("branding")}
                          className={getButtonClass(tab === "branding")}
                          style={getButtonStyle(tab === "branding")}
                        >
                          <Palette size={16} /> <span>Branding</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {/* PESSOAL - Para SUPERVISOR */}
              {userRole === "SUPERVISOR" && (
                <div className="mb-0.5">
                  <div className="px-2 py-0.5">
                    <span className="text-xs uppercase tracking-wide font-semibold opacity-60" style={{ color: branding?.sidebarTextColor || '#374151' }}>
                      Pessoal
                    </span>
                  </div>
                  {hasPermission('view_team_wall') && (
                    <button
                      onClick={() => handleTabChange("elogios")}
                      className={getButtonClass(tab === "elogios")}
                      style={getButtonStyle(tab === "elogios")}
                    >
                      <Handshake size={16} /> <span>Elogios</span>
                    </button>
                  )}
                  {hasPermission('view_store') && (
                    <button
                      onClick={() => handleTabChange("rewards")}
                      className={getButtonClass(tab === "rewards")}
                      style={getButtonStyle(tab === "rewards")}
                    >
                      <Trophy size={16} /> <span>Recompensas</span>
                    </button>
                  )}
                </div>
              )}
              
              {/* SISTEMA */}
              <div className="mb-0.5">
                <div className="px-2 py-0.5">
                  <span className="text-xs uppercase tracking-wide font-semibold opacity-60" style={{ color: branding?.sidebarTextColor || '#374151' }}>
                    Sistema
                  </span>
                </div>
                {userRole === "SUPER_ADMIN" && (
                  <button
                    onClick={() => handleTabChange("surveys")}
                    className={getButtonClass(tab === "surveys")}
                    style={getButtonStyle(tab === "surveys")}
                  >
                    <BarChart3 size={16} /> <span>Surveys</span>
                  </button>
                )}
                
                <button
                  onClick={() => handleTabChange("notifications")}
                  className={getButtonClass(tab === "notifications") + " relative"}
                  style={getButtonStyle(tab === "notifications")}
                >
                  <Bell size={16} /> <span>Notificações</span>
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-4 text-center leading-none">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </div>
            </>
          ) : (
            <>
              {/* MENU para SUPERVISOR */}
              {userRole === "SUPERVISOR" ? (
                <>
                  <div className="mb-0.5">
                    <div className="px-2 py-0.5">
                      <span className="text-xs uppercase tracking-wide font-semibold opacity-60" style={{ color: branding?.sidebarTextColor || '#374151' }}>
                        Supervisão
                      </span>
                    </div>
                    <button
                      onClick={() => handleTabChange("dashboard")}
                      className={getButtonClass(tab === "dashboard")}
                      style={getButtonStyle(tab === "dashboard")}
                    >
                      <LayoutDashboard size={16} /> <span>Painel</span>
                    </button>
                    {hasPermission('view_analytics') && (
                      <button
                        onClick={() => handleTabChange("analytics")}
                        className={getButtonClass(tab === "analytics")}
                        style={getButtonStyle(tab === "analytics")}
                      >
                        <BarChart3 size={16} /> <span>Analytics</span>
                      </button>
                    )}
                    {hasPermission('view_users_menu') && (
                      <button
                        onClick={() => handleTabChange("usuarios")}
                        className={getButtonClass(tab === "usuarios")}
                        style={getButtonStyle(tab === "usuarios")}
                      >
                        <Users size={16} /> <span>Usuários</span>
                      </button>
                    )}
                  </div>

                  {/* PESSOAL */}
                  <div className="mb-0.5">
                    <div className="px-2 py-0.5">
                      <span className="text-xs uppercase tracking-wide font-semibold opacity-60" style={{ color: branding?.sidebarTextColor || '#374151' }}>
                        Pessoal
                      </span>
                    </div>
                    {hasPermission('view_team_wall') && (
                      <button
                        onClick={() => handleTabChange("elogios")}
                        className={getButtonClass(tab === "elogios")}
                        style={getButtonStyle(tab === "elogios")}
                      >
                        <Handshake size={16} /> <span>Elogios</span>
                      </button>
                    )}
                    {hasPermission('view_store') && (
                      <button
                        onClick={() => handleTabChange("rewards")}
                        className={getButtonClass(tab === "rewards")}
                        style={getButtonStyle(tab === "rewards")}
                      >
                        <Trophy size={16} /> <span>Recompensas</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleTabChange("notifications")}
                      className={getButtonClass(tab === "notifications") + " relative"}
                      style={getButtonStyle(tab === "notifications")}
                    >
                      <Bell size={16} /> <span>Notificações</span>
                      {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-4 text-center leading-none">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                /* MENU para COLABORADOR */
                <>
                  <div className="mb-0.5">
                    <div className="px-2 py-0.5">
                      <span className="text-xs uppercase tracking-wide font-semibold opacity-60" style={{ color: branding?.sidebarTextColor || '#374151' }}>
                        Menu
                      </span>
                    </div>
                    <button
                      onClick={() => handleTabChange("central")}
                      className={getButtonClass(tab === "central")}
                      style={getButtonStyle(tab === "central")}
                    >
                      <LayoutDashboard size={16} /> <span>Central</span>
                    </button>
                    {hasPermission('view_store') && (
                      <button
                        onClick={() => handleTabChange("rewards")}
                        className={getButtonClass(tab === "rewards")}
                        style={getButtonStyle(tab === "rewards")}
                      >
                        <Trophy size={16} /> <span>Recompensas</span>
                      </button>
                    )}
                    {hasPermission('view_team_wall') && (
                      <button
                        onClick={() => handleTabChange("elogios")}
                        className={getButtonClass(tab === "elogios")}
                        style={getButtonStyle(tab === "elogios")}
                      >
                        <Handshake size={16} /> <span>Elogios</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleTabChange("notifications")}
                      className={getButtonClass(tab === "notifications") + " relative"}
                      style={getButtonStyle(tab === "notifications")}
                    >
                      <Bell size={16} /> <span>Notificações</span>
                      {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-4 text-center leading-none">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
      <div className="bg-white flex ">
        <button
          onClick={() => handleTabChange("ajustes")}
          className="flex-1 flex flex-col items-center justify-center gap-1 py-3 px-2 transition-colors hover:bg-gray-100 border-r border-gray-200"
          style={tab === "ajustes" ? {
            backgroundColor: branding?.primaryColor || '#2b2b2b',
            color: '#ffffff'
          } : {
            color: '#374151'
          }}
        >
          <Settings size={18} />
          <span className="text-xs font-medium">Ajustes</span>
        </button>
        <button
          onClick={handleLogoutClick}
          className="flex-1 flex flex-col items-center justify-center gap-1 py-3 px-2 transition-colors hover:bg-red-50"
          style={{ color: '#ef4444' }}
        >
          <LogOut size={18} />
          <span className="text-xs font-semibold">Sair</span>
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
