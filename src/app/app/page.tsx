"use client";
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
    <div className="min-h-screen bg-gray-50">
      <SidebarMenu 
        tab={tab} 
        setTab={setTab} 
        onLogout={handleLogout}
        userProfile={user ? {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          profilePicture: user.profilePicture,
          role: user.role,
          points: user.points
        } : undefined}
      />
      <div className="lg:ml-64 pt-16 lg:pt-0">
        <div className="p-4 lg:p-6">
          <div className="w-full">
            {tab === "central" && <CentralTab />}
            {tab === "rewards" && <RewardsTab />}
            {tab === "elogios" && <ComplimentsTab />}
            {tab === "notifications" && <NotificationsTab isAdminView={false} currentUser={user} />}
            {tab === "ajustes" && <SettingsTab />}
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
