"use client";
import CompaniesTab from "./companies";
import UsersTab from "./users";
import ItemsTab from "./items";
import SidebarMenu from "@/components/SidebarMenu";
import SettingsTab from "../settings";
import NotificationsTab from "../notifications";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CategoriesTab from "./categories";
import ForcePasswordChangeModal from "@/components/ForcePasswordChangeModal";
import GeralTab from "./geral";

export default function AdminPanel() {
    const [tab, setTab] = useState<string>("");
    const [authChecked, setAuthChecked] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [showForcePasswordModal, setShowForcePasswordModal] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }
        // Valida token no backend
        fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
            .then(async res => {
                if (!res.ok) {
                    router.push("/login");
                } else {
                    const data = await res.json();
                    setUser(data.user);
                    setIsAuthenticated(true);
                    // Define a tab padrão após saber o role
                    if (data.user.role === "SUPER_ADMIN" || data.user.role === "COMPANY_ADMIN") {
                        setTab("geral");
                    } else {
                        setTab("usuarios");
                    }
                    if (data.user.role !== "SUPER_ADMIN" && data.user.mustChangePassword) {
                        setShowForcePasswordModal(true);
                    }
                }
            })
            .finally(() => setAuthChecked(true));
    }, [router]);

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

    const token = typeof window !== "undefined" ? (localStorage.getItem("token") || sessionStorage.getItem("token")) : "";

    return (
        <div className="min-h-screen bg-gray-50">
            <SidebarMenu tab={tab} setTab={setTab} onLogout={handleLogout} showAdminTabs userRole={user?.role} />
            <div className="lg:ml-64 pt-16 lg:pt-0">
                <div className="p-4 lg:p-6">
                    <div className="w-full">
                        {tab === "geral" && <GeralTab user={user} />}
                        {tab === "empresas" && user?.role === "SUPER_ADMIN" && <CompaniesTab />}
                        {tab === "usuarios" && <UsersTab />}
                        {tab === "itens" && <ItemsTab />}
                        {tab === "ajustes" && <SettingsTab />}
                        {tab === "categorias" && <CategoriesTab />}
                        {tab === "notifications" && <NotificationsTab isAdminView={true} currentUser={user} />}
                    </div>
                </div>
            </div>
            {user && user.role !== "SUPER_ADMIN" && (
                <ForcePasswordChangeModal
                    open={showForcePasswordModal}
                    onPasswordChanged={handlePasswordChanged}
                    userId={user.id}
                    token={token || ""}
                />
            )}
        </div>
    );
}
