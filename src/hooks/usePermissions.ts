"use client";
import { useEffect, useState } from "react";

export type PermissionKey =
  | "view_personal_updates"
  | "view_company_updates"
  | "view_team_wall"
  | "send_compliment"
  | "like_compliment_sent_by_self"
  | "like_compliment_sent_by_others"
  | "view_store"
  | "add_items_to_cart"
  | "remove_items_from_cart"
  | "insert_new_items_catalog"
  | "remove_items_catalog"
  | "view_users_menu"
  | "transfer_remove_users"
  | "view_analytics"
  | "view_own_team_analytics"
  | "view_other_teams_analytics"
  | "view_system_surveys"
  | "respond_system_surveys"
  | "configure_own_profile";

interface UsePermissionsReturn {
  permissions: Record<PermissionKey, boolean>;
  hasPermission: (key: PermissionKey) => boolean;
  loading: boolean;
  refetch: () => Promise<void>;
}

export function usePermissions(userId?: number): UsePermissionsReturn {
  const [permissions, setPermissions] = useState<Record<PermissionKey, boolean>>({} as Record<PermissionKey, boolean>);
  const [loading, setLoading] = useState(true);

  const fetchPermissions = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      // Se não tiver userId, usa o endpoint do usuário logado
      const endpoint = "/api/auth/me/permissions";

      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        console.log('[usePermissions] Permissões carregadas:', data.permissions);
        setPermissions(data.permissions || {});
      } else {
        console.error('[usePermissions] Erro ao buscar permissões:', res.status);
      }
    } catch (error) {
      console.error("Erro ao buscar permissões:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
    
    // Adicionar listener para recarregar permissões quando necessário
    const handlePermissionsUpdate = () => {
      fetchPermissions();
    };
    
    window.addEventListener('permissions-updated', handlePermissionsUpdate);
    
    return () => {
      window.removeEventListener('permissions-updated', handlePermissionsUpdate);
    };
  }, []);

  const hasPermission = (key: string): boolean => {
    const value = permissions[key as PermissionKey] ?? false;
    return value;
  };

  return {
    permissions,
    hasPermission,
    loading,
    refetch: fetchPermissions,
  };
}
