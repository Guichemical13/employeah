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
                    fetch("/api/users", { headers: { Authorization: `Bearer ${token}` } }).then((r) => (r.ok ? r.json() : [])),
                    fetch("/api/items", { headers: { Authorization: `Bearer ${token}` } }).then((r) => (r.ok ? r.json() : [])),
                ]);
            } else if (user?.role === "COMPANY_ADMIN") {
                // Busca usuários e itens da empresa do admin
                [users, items] = await Promise.all([
                    fetch("/api/users", { headers: { Authorization: `Bearer ${token}` } }).then((r) => (r.ok ? r.json() : [])),
                    fetch("/api/items", { headers: { Authorization: `Bearer ${token}` } }).then((r) => (r.ok ? r.json() : [])),
                ]);
            }
            setStats({
                companies: companies.length,
                users: users.length,
                items: items.length,
            });
        }
        fetchStats();
    }, [user]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {user?.role === "SUPER_ADMIN" && (
                <Card>
                    <CardHeader>
                        <CardTitle>Empresas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <span className="text-3xl font-bold">{stats.companies}</span>
                    </CardContent>
                </Card>
            )}
            <Card>
                <CardHeader>
                    <CardTitle>Usuários</CardTitle>
                </CardHeader>
                <CardContent>
                    <span className="text-3xl font-bold">{stats.users}</span>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Itens</CardTitle>
                </CardHeader>
                <CardContent>
                    <span className="text-3xl font-bold">{stats.items}</span>
                </CardContent>
            </Card>
        </div>
    );
}
