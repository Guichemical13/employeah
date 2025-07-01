"use client";
import React, { useState, useEffect } from 'react';
import PointsManagement from '@/components/PointsManagement';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Coins, TrendingUp, Users, DollarSign } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

function StatsCard({ title, value, description, icon, trend }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {trend && (
          <div className={`text-xs flex items-center mt-1 ${
            trend.isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            <TrendingUp className="h-3 w-3 mr-1" />
            {trend.isPositive ? '+' : ''}{trend.value}% desde o mês passado
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function PointsTab() {
  const [stats, setStats] = useState({
    totalPointsDistributed: 0,
    totalUsers: 0,
    avgPointsPerUser: 0,
    totalTransactions: 0
  });
  const [loading, setLoading] = useState(true);
  const [debugData, setDebugData] = useState<any>(null);

  useEffect(() => {
    fetchStats();
    fetchDebugData(); // Adicionar debug
  }, []);

  const fetchDebugData = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        console.error('Token não encontrado para debug');
        return;
      }

      const response = await fetch('/api/debug/data', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDebugData(data);
        console.log('Debug data:', data);
      } else {
        const errorText = await response.text();
        console.error('Erro no debug:', response.status, errorText);
      }
    } catch (error) {
      console.error('Erro ao buscar debug data:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        console.error('Token não encontrado para stats');
        return;
      }

      // Buscar estatísticas gerais de pontos
      const [usersResponse, transactionsResponse] = await Promise.all([
        fetch('/api/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/points/admin', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (usersResponse.ok && transactionsResponse.ok) {
        const usersData = await usersResponse.json();
        const transactionsData = await transactionsResponse.json();

        const users = usersData.users || [];
        const transactions = transactionsData.transactions || [];

        const totalPoints = users.reduce((sum: number, user: any) => sum + (user.points || 0), 0);
        const avgPoints = users.length > 0 ? Math.round(totalPoints / users.length) : 0;

        setStats({
          totalPointsDistributed: totalPoints,
          totalUsers: users.length,
          avgPointsPerUser: avgPoints,
          totalTransactions: transactions.length
        });
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePointsUpdated = () => {
    fetchStats(); // Atualizar estatísticas quando pontos são modificados
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestão de Pontos</h1>
        <p className="text-muted-foreground">
          Gerencie os pontos dos funcionários e acompanhe as estatísticas da empresa
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total de Pontos"
          value={loading ? "..." : stats.totalPointsDistributed.toLocaleString()}
          description="Pontos distribuídos na empresa"
          icon={<Coins className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Funcionários"
          value={loading ? "..." : stats.totalUsers}
          description="Total de usuários ativos"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Média por Funcionário"
          value={loading ? "..." : stats.avgPointsPerUser}
          description="Pontos médios por pessoa"
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Transações Admin"
          value={loading ? "..." : stats.totalTransactions}
          description="Operações realizadas"
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      {/* Componente de Gestão de Pontos */}
      <PointsManagement onSuccess={handlePointsUpdated} />
    </div>
  );
}
