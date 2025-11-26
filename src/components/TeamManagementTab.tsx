"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Users, BarChart3, TrendingUp, Trophy, Heart } from "lucide-react";

interface Team {
  id: number;
  name: string;
  description: string;
  memberCount: number;
  totalPoints: number;
  company: {
    id: number;
    name: string;
  };
}

interface TeamMember {
  id: number;
  name: string;
  email: string;
  username?: string;
  profilePicture?: string;
  role: string;
  points: number;
  createdAt: string;
}

interface TeamAnalytics {
  elogiosRecebidos: number;
  elogiosEnviados: number;
  topMembers: {
    id: number;
    name: string;
    points: number;
    role: string;
  }[];
  recentTransactions: {
    id: number;
    amount: number;
    type: string;
    description?: string;
    createdAt: string;
    user: {
      id: number;
      name: string;
    };
  }[];
}

export default function TeamManagementTab({ teamId }: { teamId: number }) {
  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [analytics, setAnalytics] = useState<TeamAnalytics | null>(null);

  useEffect(() => {
    loadTeamData();
  }, [teamId]);

  const loadTeamData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      
      // Buscar analytics (inclui informações do time)
      const analyticsRes = await fetch(`/api/supervisor/teams/${teamId}/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (analyticsRes.ok) {
        const data = await analyticsRes.json();
        setTeam(data.team);
        setAnalytics(data.analytics);
      }

      // Buscar membros
      const membersRes = await fetch(`/api/supervisor/teams/${teamId}/members`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (membersRes.ok) {
        const data = await membersRes.json();
        setMembers(data.members);
      }
    } catch (error) {
      console.error("Erro ao carregar dados do time:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Carregando...</div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Time não encontrado</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header do Time */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">{team.name}</h2>
          {team.description && (
            <p className="text-gray-600 mt-1">{team.description}</p>
          )}
          <p className="text-sm text-gray-500 mt-2">
            Empresa: <span className="font-semibold">{team.company.name}</span>
          </p>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Membros</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{team.memberCount}</div>
            <p className="text-xs text-muted-foreground">membros ativos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pontos Totais</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{team.totalPoints}</div>
            <p className="text-xs text-muted-foreground">pontos acumulados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Elogios Recebidos</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.elogiosRecebidos || 0}</div>
            <p className="text-xs text-muted-foreground">total recebido</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Elogios Enviados</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.elogiosEnviados || 0}</div>
            <p className="text-xs text-muted-foreground">total enviado</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="members" className="w-full">
        <TabsList>
          <TabsTrigger value="members">Membros</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Membros do Time</CardTitle>
              <CardDescription>
                Lista de todos os membros deste time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {member.profilePicture ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={member.profilePicture}
                          alt={member.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <Users className="w-5 h-5 text-gray-600" />
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-gray-900">{member.name}</div>
                        <div className="text-sm text-gray-500">{member.email}</div>
                        {member.username && (
                          <div className="text-xs text-gray-400">@{member.username}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{member.role}</Badge>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">{member.points}</div>
                        <div className="text-xs text-gray-500">pontos</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Top Membros */}
            <Card>
              <CardHeader>
                <CardTitle>Top 5 Membros</CardTitle>
                <CardDescription>Membros com mais pontos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics?.topMembers.map((member, index) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{member.name}</div>
                          <Badge variant="outline" className="text-xs mt-1">
                            {member.role}
                          </Badge>
                        </div>
                      </div>
                      <div className="font-bold text-lg text-gray-900">
                        {member.points}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Transações Recentes */}
            <Card>
              <CardHeader>
                <CardTitle>Transações Recentes</CardTitle>
                <CardDescription>Últimas 10 transações de pontos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics?.recentTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-start justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">
                          {transaction.user.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {transaction.description || transaction.type}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(transaction.createdAt).toLocaleDateString("pt-BR")}
                        </div>
                      </div>
                      <div
                        className={`font-bold ${
                          transaction.amount >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {transaction.amount >= 0 ? "+" : ""}
                        {transaction.amount}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
