"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Bell, BellRing, Check } from "lucide-react";

type Notification = {
  id: number;
  message: string;
  read: boolean;
  createdAt: string;
  userId: number;
  user?: {
    name: string;
    email: string;
    companyId?: number;
  };
};

interface NotificationsTabProps {
  isAdminView?: boolean;
  currentUser?: any;
}

export default function NotificationsTab({ isAdminView = false, currentUser }: NotificationsTabProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    try {
      const res = await fetch("/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
        setUnreadCount(data.filter((n: Notification) => !n.read).length);
      }
    } catch (error) {
      console.error("Erro ao buscar notificações:", error);
    }
    setLoading(false);
  }

  async function markAllAsRead() {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Erro ao marcar como lidas:", error);
    }
  }

  async function markAsRead(id: number) {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setNotifications(prev => 
          prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Erro ao marcar notificação como lida:", error);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="font-bold text-lg">Notificações</div>
        <div className="text-gray-400">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="font-bold text-lg flex items-center gap-2">
          <Bell size={20} />
          Notificações
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-5 text-center">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead} variant="outline" size="sm">
            <Check size={16} className="mr-1" />
            Marcar todas como lidas
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-8">
          <Bell size={48} className="mx-auto text-gray-300 mb-4" />
          <div className="text-gray-400">Nenhuma notificação encontrada.</div>
        </div>
      ) : (
        <ul className="space-y-3">
          {notifications.map((notification) => (
            <li
              key={notification.id}
              className={`bg-white rounded-lg shadow p-4 border-l-4 ${
                notification.read ? "border-gray-300" : "border-blue-500"
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className={`${notification.read ? "text-gray-600" : "text-gray-900 font-medium"}`}>
                    {notification.read ? (
                      <Bell size={16} className="inline mr-2 text-gray-400" />
                    ) : (
                      <BellRing size={16} className="inline mr-2 text-blue-500" />
                    )}
                    {notification.message}
                  </div>
                  {isAdminView && notification.user && notification.userId !== currentUser?.id && (
                    <div className="text-xs text-gray-500 mt-1">
                      Usuário: {notification.user.name} ({notification.user.email})
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-2">
                    {new Date(notification.createdAt).toLocaleString("pt-BR")}
                  </div>
                </div>
                {!notification.read && (
                  <Button
                    onClick={() => markAsRead(notification.id)}
                    variant="ghost"
                    size="sm"
                    className="ml-2"
                  >
                    <Check size={14} />
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
