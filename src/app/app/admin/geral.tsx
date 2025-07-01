import { useEffect, useState } from "react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card";

export default function GeralTab({ user }: { user: any }) {
    const [stats, setStats] = useState({ companies: 0, users: 0, items: 0 });

    useEffect(() => {
        async function fetchStats() {
            const token = localStorage.getItem("token") || sessionStorage.getItem("token");
            let companies = [];
            let users = [];
            let items = [];
            if (user?.role === "SUPER_ADMIN") {
                [companies, users, items] = await Promise.all([
                    fetch("/api/companies", { headers: { Authorization: `Bearer ${token}` } }).then((r) => (r.ok ? r.json() : [])),
                    fetch("/api/users", { headers: { Authorization: `Bearer ${token}` } }).then((r) => (r.ok ? r.json() : { users: [] })),
                    fetch("/api/items", { headers: { Authorization: `Bearer ${token}` } }).then((r) => (r.ok ? r.json() : [])),
                ]);
            } else if (user?.role === "COMPANY_ADMIN" || user?.role === "ADMIN") {
                // Busca usuários e itens da empresa do admin
                [users, items] = await Promise.all([
                    fetch("/api/users", { headers: { Authorization: `Bearer ${token}` } }).then((r) => (r.ok ? r.json() : { users: [] })),
                    fetch("/api/items", { headers: { Authorization: `Bearer ${token}` } }).then((r) => (r.ok ? r.json() : [])),
                ]);
            }
            setStats({
                companies: Array.isArray(companies) ? companies.length : 0,
                users: Array.isArray(users) ? users.length : (users.users ? users.users.length : 0),
                items: Array.isArray(items) ? items.length : 0,
            });
        }
        fetchStats();
    }, [user]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Geral</h1>
                <p className="text-gray-600">Visão geral do sistema EmploYEAH!</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {user?.role === "SUPER_ADMIN" && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Empresas</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <span className="text-3xl font-bold text-blue-600">{stats.companies}</span>
                        </CardContent>
                    </Card>
                )}
                <Card>
                    <CardHeader>
                        <CardTitle>Usuários/Funcionários</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <span className="text-3xl font-bold text-green-600">{stats.users}</span>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Itens</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <span className="text-3xl font-bold text-purple-600">{stats.items}</span>
                    </CardContent>
                </Card>
            </div>
            
            {user && (
                <Card>
                    <CardHeader>
                        <CardTitle>Informações do Usuário</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <p><strong>Nome:</strong> {user.name}</p>
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Função:</strong> {user.role}</p>
                        {user.role !== "SUPER_ADMIN" && (
                            <p><strong>Pontos:</strong> {user.points || 0}</p>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
