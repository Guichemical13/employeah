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
} from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { useState } from "react";

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
  | "geral";

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
  const [isOpen, setIsOpen] = useState(false);

  const handleTabChange = (newTab: string) => {
    setTab(newTab);
    setIsOpen(false); // Fecha o menu mobile ao selecionar uma aba
  };

  const SidebarContent = () => (
    <div className="h-full bg-[#d6d3f5] flex flex-col">
      <div className="flex flex-col items-center py-6">
        <Image src="/logo.svg" alt="EmploYEAH!" width={48} height={48} />
        <h1 className="text-lg font-bold text-[#5a5ad6] mt-2">EmploYEAH!</h1>
      </div>
      <div className="flex-1 flex flex-col justify-center px-2">
        <div className="flex flex-col gap-2 p-2 w-full">
          {showAdminTabs ? (
            <>
              {(userRole === "SUPER_ADMIN" || userRole === "COMPANY_ADMIN") && (
                <button
                  onClick={() => handleTabChange("geral")}
                  className={`justify-start text-base font-medium w-full flex gap-2 p-3 rounded-lg transition-colors ${
                    tab === "geral" 
                      ? "bg-white text-[#5a5ad6] shadow-sm" 
                      : "text-gray-700 hover:bg-white/50"
                  }`}
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
          onClick={onLogout}
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
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#d6d3f5] border-b border-[#bcb8e6] px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/logo.svg" alt="EmploYEAH!" width={32} height={32} />
            <h1 className="text-base font-bold text-[#5a5ad6]">EmploYEAH!</h1>
          </div>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <button className="p-2 rounded-md hover:bg-[#bcb8e6] transition-colors">
                <Menu size={24} className="text-[#5a5ad6]" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SidebarContent />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </>
  );
}
