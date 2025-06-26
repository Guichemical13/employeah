"use client";
import { useEffect, useState } from "react";

export function useNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function fetchUnreadCount() {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) return;
      
      try {
        const res = await fetch("/api/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const notifications = await res.json();
          setUnreadCount(notifications.filter((n: any) => !n.read).length);
        }
      } catch (error) {
        console.error("Erro ao buscar notificações:", error);
      }
    }

    fetchUnreadCount();
    
    // Atualiza a cada 30 segundos
    const interval = setInterval(fetchUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const refreshNotifications = async () => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) return;
    
    try {
      const res = await fetch("/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const notifications = await res.json();
        setUnreadCount(notifications.filter((n: any) => !n.read).length);
      }
    } catch (error) {
      console.error("Erro ao buscar notificações:", error);
    }
  };

  return { unreadCount, setUnreadCount, refreshNotifications };
}
