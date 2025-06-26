"use client";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";

export type SidebarTab =
  | "central"
  | "rewards"
  | "elogios"
  | "ajustes"
  | "notifications"
  | "empresas"
  | "categorias"
  | "usuarios"
  | "itens";

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
  
  return (
    <aside className="w-64 h-screen bg-[#d6d3f5] flex flex-col p-0">
      <div className="flex flex-col items-center py-6">
        <Image src="/logo.svg" alt="EmploYEAH!" width={48} height={48} />
        <h1 className="text-lg font-bold text-[#5a5ad6] mt-2">EmploYEAH!</h1>
      </div>
      <div className="flex-1 flex flex-col justify-center">
        <Tabs
          value={tab}
          onValueChange={setTab}
          orientation="vertical"
          className="w-full"
        >
          <TabsList className="flex flex-col gap-2 bg-transparent p-2w-full">
            {showAdminTabs ? (
              <>
                {(userRole === "SUPER_ADMIN" || userRole === "COMPANY_ADMIN") && (
                  <TabsTrigger
                    value="geral"
                    className="justify-start text-base font-medium w-full flex gap-2"
                  >
                    <LayoutDashboard size={18} /> Geral
                  </TabsTrigger>
                )}
                {userRole === "SUPER_ADMIN" && (
                  <TabsTrigger
                    value="empresas"
                    className="justify-start text-base font-medium w-full flex gap-2"
                  >
                    <Building2 size={18} /> Empresas
                  </TabsTrigger>
                )}
                <TabsTrigger
                  value="usuarios"
                  className="justify-start text-base font-medium w-full flex gap-2"
                >
                  <Users size={18} /> Usuários
                </TabsTrigger>
                <TabsTrigger
                  value="itens"
                  className="justify-start text-base font-medium w-full flex gap-2"
                >
                  <Trophy size={18} /> Itens
                </TabsTrigger>
                <TabsTrigger
                  value="categorias"
                  className="justify-start text-base font-medium w-full flex gap-2"
                >
                  <LayoutDashboard size={18} /> Categorias
                </TabsTrigger>
                <TabsTrigger
                  value="notifications"
                  className="justify-start text-base font-medium w-full flex gap-2 relative"
                >
                  <Bell size={18} /> Notificações
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-5 text-center leading-none">
                      {unreadCount}
                    </span>
                  )}
                </TabsTrigger>
              </>
            ) : (
              <>
                <TabsTrigger
                  value="central"
                  className="justify-start text-base font-medium w-full flex gap-2"
                >
                  <LayoutDashboard size={18} /> Central
                </TabsTrigger>
                <TabsTrigger
                  value="rewards"
                  className="justify-start text-base font-medium w-full flex gap-2"
                >
                  <Trophy size={18} /> Recompensas
                </TabsTrigger>
                <TabsTrigger
                  value="elogios"
                  className="justify-start text-base font-medium w-full flex gap-2"
                >
                  <Handshake size={18} /> Elogios
                </TabsTrigger>
                <TabsTrigger
                  value="notifications"
                  className="justify-start text-base font-medium w-full flex gap-2 relative"
                >
                  <Bell size={18} /> Notificações
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-5 text-center leading-none">
                      {unreadCount}
                    </span>
                  )}
                </TabsTrigger>
              </>
            )}
          </TabsList>
        </Tabs>
      </div>
      <div className="flex flex-col gap-2 p-4 border-t border-[#bcb8e6]">
        <button
          onClick={() => setTab("ajustes")}
          className={`flex items-center gap-2 text-base font-medium text-gray-700 hover:text-purple-700 transition ${
            tab === "ajustes" ? "font-bold" : ""
          }`}
        >
          <Settings size={18} /> Ajustes
        </button>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 text-base font-medium text-blue-700 hover:underline bg-transparent border-none cursor-pointer"
          style={{ outline: "none" }}
        >
          <LogOut size={18} /> <b>Sair</b>
        </button>
      </div>
    </aside>
  );
}
