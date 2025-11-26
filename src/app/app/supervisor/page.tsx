"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SidebarMenu from "@/components/SidebarMenu";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, BarChart3 } from "lucide-react";
import TeamManagementTab from "@/components/TeamManagementTab";
import ForcePasswordChangeModal from "@/components/ForcePasswordChangeModal";
import RewardsTab from "../rewards";
import ComplimentsTab from "../compliments";
import NotificationsTab from "../notifications";
import SettingsTab from "../settings";
import UsersTab from "../admin/users";
import ItemsTab from "../admin/items";
import CategoriesTab from "../admin/categories";
import PointsTab from "../admin/points";
import ElogiosTab from "../admin/elogios";

interface Team {
  id: number;
  name: string;
  description?: string;
  companyId: number;
  members: any[];
  company: {
    id: number;
    name: string;
  };
}

export default function SupervisorPanel() {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [tab, setTab] = useState("dashboard");
  const [showForcePasswordModal, setShowForcePasswordModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then(async (res) => {
        if (!res.ok) {
          router.push("/login");
        } else {
          const data = await res.json();
          setUser(data.user);

          // Verificar se é supervisor
          if (data.user.role !== "SUPERVISOR") {
            // Redireciona para a rota apropriada baseada na role
            if (data.user.role === "SUPER_ADMIN" || data.user.role === "COMPANY_ADMIN") {
              router.push("/app/admin");
            } else {
              router.push("/app");
            }
            return;
          }

          setIsAuthenticated(true);
          if (data.user.mustChangePassword) {
            setShowForcePasswordModal(true);
          }

          // Carregar times do supervisor
          loadTeams(token);
        }
      })
      .finally(() => setAuthChecked(true));
  }, [router]);

  const loadTeams = async (token: string) => {
    try {
      const res = await fetch("/api/supervisor/teams", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setTeams(data.teams);
        
        // Selecionar o primeiro time por padrão
        if (data.teams.length > 0) {
          setSelectedTeam(data.teams[0].id);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar times:", error);
    }
  };

  function handleLogout() {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    router.push("/login");
  }

  function handlePasswordChanged() {
    setShowForcePasswordModal(false);
    if (user) setUser({ ...user, mustChangePassword: false });
  }

  if (!authChecked) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  const token = typeof window !== "undefined" 
    ? (localStorage.getItem("token") || sessionStorage.getItem("token")) 
    : "";

  return (
    <div className="min-h-screen bg-gray-50">
      <SidebarMenu
        tab={tab}
        setTab={setTab}
        onLogout={handleLogout}
        showAdminTabs={true}
        userRole={user?.role}
        userProfile={user ? {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          profilePicture: user.profilePicture,
          role: user.role,
          points: user.points,
        } : undefined}
      />
      
      <div className="lg:ml-64 pt-16 lg:pt-0">
        <div className="p-4 lg:p-6">
          {tab === "dashboard" && (
            <>
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Painel de Supervisão</h1>
                <p className="text-gray-600 mt-1">Gerencie seus times e visualize analytics</p>
              </div>

              {teams.length === 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Nenhum Time Atribuído</CardTitle>
                    <CardDescription>
                      Você ainda não está supervisionando nenhum time. Entre em contato com o administrador.
                    </CardDescription>
                  </CardHeader>
                </Card>
              ) : (
                <>
                  {/* Seletor de Times */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {teams.map((team) => (
                      <Card
                        key={team.id}
                        className={`cursor-pointer transition-all hover:shadow-lg ${
                          selectedTeam === team.id ? "ring-2 ring-blue-500" : ""
                        }`}
                        onClick={() => setSelectedTeam(team.id)}
                      >
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            {team.name}
                          </CardTitle>
                          {team.description && (
                            <CardDescription>{team.description}</CardDescription>
                          )}
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-1 text-gray-600">
                              <Building2 className="w-4 h-4" />
                              <span>{team.company.name}</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-600">
                              <Users className="w-4 h-4" />
                              <span>{team.members.length} membros</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Detalhes do Time Selecionado */}
                  {selectedTeam && (
                    <TeamManagementTab teamId={selectedTeam} />
                  )}
                </>
              )}
            </>
          )}
          
          {tab === "analytics" && selectedTeam && (
            <TeamManagementTab teamId={selectedTeam} />
          )}
          
          {tab === "usuarios" && <UsersTab />}
          {tab === "itens" && <ItemsTab />}
          {tab === "categorias" && <CategoriesTab />}
          {tab === "pontos" && <PointsTab />}
          {tab === "elogios-admin" && <ElogiosTab />}
          {tab === "rewards" && <RewardsTab />}
          {tab === "elogios" && <ComplimentsTab />}
          {tab === "notifications" && <NotificationsTab isAdminView={false} currentUser={user} />}
          {tab === "ajustes" && <SettingsTab />}
        </div>
      </div>

      <ForcePasswordChangeModal
        open={showForcePasswordModal}
        onPasswordChanged={handlePasswordChanged}
        userId={user?.id}
        token={token || ""}
      />
    </div>
  );
}
