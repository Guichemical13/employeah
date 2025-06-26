"use client";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import CentralTab from "./central";
import RewardsTab from "./rewards";
import ComplimentsTab from "./compliments";
import SettingsTab from "./settings";
import NotificationsTab from "./notifications";
import { useEffect, useState } from "react";
import SidebarMenu from "@/components/SidebarMenu";
import { useRouter } from "next/navigation";
import ForcePasswordChangeModal from "@/components/ForcePasswordChangeModal";

export default function Dashboard() {
  const [tab, setTab] = useState("central");
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showForcePasswordModal, setShowForcePasswordModal] = useState(false);
  const router = useRouter();

  function handleLogout() {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    router.push("/login");
  }

  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then(async res => {
        if (!res.ok) {
          router.push("/login");
        } else {
          const data = await res.json();
          setUser(data.user);
          setIsAuthenticated(true);
          if (data.user.role !== "SUPER_ADMIN" && data.user.mustChangePassword) {
            setShowForcePasswordModal(true);
          }
        }
      })
      .finally(() => setAuthChecked(true));
  }, [router]);

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
    <div className="min-h-screen flex bg-gray-50">
      <SidebarMenu tab={tab} setTab={setTab} onLogout={handleLogout} />
      <div className="flex-1 p-4">
        <Tabs value={tab} onValueChange={setTab} orientation="vertical" className="flex gap-8">
          <div className="flex-1">
            <TabsContent value="central">
              <CentralTab />
            </TabsContent>
            <TabsContent value="rewards">
              <RewardsTab />
            </TabsContent>
            <TabsContent value="elogios">
              <ComplimentsTab />
            </TabsContent>
            <TabsContent value="notifications">
              <NotificationsTab isAdminView={false} currentUser={user} />
            </TabsContent>
            <TabsContent value="ajustes">
              <SettingsTab />
            </TabsContent>
          </div>
        </Tabs>
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
