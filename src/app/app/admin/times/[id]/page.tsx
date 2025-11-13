"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Users, TrendingUp, Award, Target, UserPlus, UserMinus } from "lucide-react";
import { Team, User, PointTransaction, Elogio } from "@/types/models";

interface TeamAnalytics {
  totalMembers: number;
  totalPoints: number;
  averagePoints: number;
  totalElogios: number;
  topPerformers: Array<{
    user: User;
    points: number;
    elogios: number;
  }>;
  recentActivities: Array<{
    type: 'points' | 'elogio' | 'member_added' | 'member_removed';
    description: string;
    date: string;
    userName?: string;
  }>;
}

export default function TeamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = params?.id as string;

  const [team, setTeam] = useState<Team | null>(null);
  const [analytics, setAnalytics] = useState<TeamAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (teamId) {
      fetchTeamDetails();
      fetchTeamAnalytics();
    }
  }, [teamId]);

  const fetchTeamDetails = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`/api/teams/${teamId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setTeam(data.team);
      }
    } catch (error) {
      console.error("Erro ao buscar detalhes do time:", error);
    }
  };

  const fetchTeamAnalytics = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`/api/teams/${teamId}/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error("Erro ao buscar analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Time não encontrado</h2>
          <Button onClick={() => router.push("/app/admin")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push("/app/admin")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{team.name}</h1>
            <p className="text-muted-foreground mt-1">
              {team.description || "Sem descrição"}
            </p>
            {team.company && (
              <Badge variant="outline" className="mt-2">
                {team.company.name}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Membros</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalMembers}</div>
              <p className="text-xs text-muted-foreground">
                Membros ativos no time
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Pontos</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalPoints}</div>
              <p className="text-xs text-muted-foreground">
                Pontos acumulados pelo time
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Média de Pontos</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.averagePoints.toFixed(0)}</div>
              <p className="text-xs text-muted-foreground">
                Por membro
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Elogios</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalElogios}</div>
              <p className="text-xs text-muted-foreground">
                Elogios recebidos
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="members" className="space-y-4">
        <TabsList>
          <TabsTrigger value="members">Membros</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="activities">Atividades Recentes</TabsTrigger>
        </TabsList>

        {/* Membros Tab */}
        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Membros do Time</CardTitle>
              <CardDescription>
                Lista de todos os membros e supervisores
              </CardDescription>
            </CardHeader>
            <CardContent>
              {team.supervisors && team.supervisors.length > 0 && (
                <div className="mb-4 p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-3">
                    Supervisor{team.supervisors.length > 1 ? 'es' : ''} ({team.supervisors.length})
                  </h3>
                  <div className="space-y-3">
                    {team.supervisors.map((supervisor) => (
                      <div key={supervisor.id} className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="font-semibold text-primary">
                            {supervisor.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{supervisor.name}</p>
                          <p className="text-sm text-muted-foreground">{supervisor.email}</p>
                        </div>
                        <Badge>SUPERVISOR</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {team.members && team.members.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-right">Pontos</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {team.members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">{member.name}</TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>
                          <Badge variant={member.role === 'SUPERVISOR' ? 'default' : 'secondary'}>
                            {member.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {member.points || 0}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum membro no time ainda.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performers</CardTitle>
              <CardDescription>
                Membros com melhor desempenho
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analytics?.topPerformers && analytics.topPerformers.length > 0 ? (
                <div className="space-y-4">
                  {analytics.topPerformers.map((performer, index) => (
                    <div key={performer.user.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <span className="text-lg font-bold text-primary">#{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{performer.user.name}</p>
                        <p className="text-sm text-muted-foreground">{performer.user.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{performer.points} pts</p>
                        <p className="text-sm text-muted-foreground">{performer.elogios} elogios</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Dados de performance não disponíveis ainda.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activities Tab */}
        <TabsContent value="activities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Atividades Recentes</CardTitle>
              <CardDescription>
                Histórico de ações do time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analytics?.recentActivities && analytics.recentActivities.length > 0 ? (
                <div className="space-y-3">
                  {analytics.recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-0">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        activity.type === 'points' ? 'bg-green-500/10' :
                        activity.type === 'elogio' ? 'bg-blue-500/10' :
                        activity.type === 'member_added' ? 'bg-purple-500/10' :
                        'bg-red-500/10'
                      }`}>
                        {activity.type === 'points' && <TrendingUp className="h-4 w-4 text-green-500" />}
                        {activity.type === 'elogio' && <Award className="h-4 w-4 text-blue-500" />}
                        {activity.type === 'member_added' && <UserPlus className="h-4 w-4 text-purple-500" />}
                        {activity.type === 'member_removed' && <UserMinus className="h-4 w-4 text-red-500" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{activity.description}</p>
                        {activity.userName && (
                          <p className="text-xs text-muted-foreground">{activity.userName}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(activity.date).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma atividade recente.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
