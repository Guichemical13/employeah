"use client";
import { useEffect, useState, useRef, useCallback } from "react";

export function useNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchRef = useRef<number>(0);
  const isActiveRef = useRef(true);
  const hasUnreadRef = useRef(false);

  const fetchUnreadCount = useCallback(async (force = false) => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) return;
    
    // Evita requests muito frequentes (mínimo de 5 segundos entre requests)
    const now = Date.now();
    if (!force && now - lastFetchRef.current < 5000) {
      return;
    }
    
    // Só faz request se a página estiver visível (exceto quando forçado)
    if (!force && !isActiveRef.current) {
      return;
    }
    
    try {
      const res = await fetch("/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const notifications = await res.json();
        const newUnreadCount = notifications.filter((n: any) => !n.read).length;
        const previousHadUnread = hasUnreadRef.current;
        
        setUnreadCount(newUnreadCount);
        hasUnreadRef.current = newUnreadCount > 0;
        lastFetchRef.current = now;
        
        // Se o estado de "tem não lidas" mudou, reconfigura o intervalo
        if (previousHadUnread !== hasUnreadRef.current) {
          setupInterval();
        }
      }
    } catch (error) {
      console.error("Erro ao buscar notificações:", error);
    }
  }, []);

  const setupInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    const interval = hasUnreadRef.current ? 90000 : 300000; // 1.5min se tem não lidas, 5min se não tem
    intervalRef.current = setInterval(() => {
      if (isActiveRef.current) {
        fetchUnreadCount();
      }
    }, interval);
  }, [fetchUnreadCount]);

  useEffect(() => {
    // Fetch inicial
    fetchUnreadCount(true);
    
    // Listener para visibilidade da página
    const handleVisibilityChange = () => {
      isActiveRef.current = !document.hidden;
      
      if (isActiveRef.current) {
        // Quando a página volta a ficar visível, atualiza imediatamente
        fetchUnreadCount(true);
        // Reinicia o intervalo
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        // Reinicia o intervalo com configuração otimizada
        setupInterval();
      } else {
        // Quando a página fica oculta, para o intervalo
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    };

    // Configura o listener de visibilidade
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Intervalo inicial com configuração otimizada
    setupInterval();
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchUnreadCount, setupInterval]);

  const refreshNotifications = useCallback(async () => {
    await fetchUnreadCount(true);
  }, [fetchUnreadCount]);

  return { unreadCount, setUnreadCount, refreshNotifications };
}
