"use client";
import React, { useState, useEffect } from 'react';
import ElogiosAdmin from '@/components/ElogiosAdmin';
import SendCompliment from '@/components/SendCompliment';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, MessageCircle, TrendingUp, Users } from 'lucide-react';

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

export default function ElogiosTab() {
  const [stats, setStats] = useState({
    totalElogios: 0,
    totalLikes: 0,
    activeUsers: 0,
    avgElogiosPerUser: 0
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchData();
  }, [refreshKey]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        console.error('Token não encontrado');
        return;
      }

      const [elogiosResponse, usersResponse] = await Promise.all([
        fetch('/api/elogios/admin', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (elogiosResponse.ok && usersResponse.ok) {
        const elogiosData = await elogiosResponse.json();
        const usersData = await usersResponse.json();

        const elogios = elogiosData.elogios || [];
        const usersList = usersData.users || [];

        // Calcular estatísticas
        const totalLikes = elogios.reduce((sum: number, elogio: any) => sum + (elogio.likes || 0), 0);
        
        // Contar usuários únicos que enviaram ou receberam elogios
        const activeUserIds = new Set();
        elogios.forEach((elogio: any) => {
          activeUserIds.add(elogio.fromId);
          activeUserIds.add(elogio.toId);
        });

        const avgElogios = usersList.length > 0 ? Math.round(elogios.length / usersList.length * 100) / 100 : 0;

        setStats({
          totalElogios: elogios.length,
          totalLikes: totalLikes,
          activeUsers: activeUserIds.size,
          avgElogiosPerUser: avgElogios
        });

        setUsers(usersList);
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDataChange = () => {
    setRefreshKey(prev => prev + 1); // Força re-fetch dos dados
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mural de Elogios</h1>
          <p className="text-muted-foreground">
            Gerencie os elogios da empresa e promova o reconhecimento entre funcionários
          </p>
        </div>
        
        {/* Botão para enviar elogio */}
        <SendCompliment 
          users={users}
          onSuccess={handleDataChange}
        />
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total de Elogios"
          value={loading ? "..." : stats.totalElogios}
          description="Elogios enviados na empresa"
          icon={<Heart className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Total de Curtidas"
          value={loading ? "..." : stats.totalLikes}
          description="Likes nos elogios"
          icon={<MessageCircle className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Usuários Ativos"
          value={loading ? "..." : stats.activeUsers}
          description="Enviaram ou receberam elogios"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Média por Usuário"
          value={loading ? "..." : stats.avgElogiosPerUser}
          description="Elogios por funcionário"
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      {/* Componente do Mural de Elogios */}
      <ElogiosAdmin 
        isAdmin={true} 
        onElogioDeleted={handleDataChange}
      />
    </div>
  );
}
