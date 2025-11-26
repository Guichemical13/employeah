"use client";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Permission {
  id: number;
  userId: number;
  permission: string;
  value: boolean;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface UserPermissionsModalProps {
  open: boolean;
  onClose: () => void;
  userId: number;
  userName: string;
  userRole: string;
}

const PERMISSION_LABELS: Record<string, { label: string; description: string; category: string }> = {
  // Atualizações
  view_personal_updates: { label: "Atualizações pessoais", description: "Visualizar próprias atualizações e notificações", category: "Visualizações" },
  view_company_updates: { label: "Atualizações da empresa", description: "Visualizar atualizações corporativas", category: "Visualizações" },
  
  // Elogios
  view_team_wall: { label: "Visualizar mural de elogios", description: "Acessar mural de elogios da equipe", category: "Elogios" },
  send_compliment: { label: "Enviar elogio", description: "Enviar elogios para outros usuários", category: "Elogios" },
  like_compliment_sent_by_self: { label: "Apagar elogio enviado por si", description: "Remover elogios enviados por você", category: "Elogios" },
  like_compliment_sent_by_others: { label: "Apagar elogio enviado por terceiro", description: "Moderar e remover elogios de outros", category: "Elogios" },
  
  // Loja
  view_store: { label: "Visualizar Loja", description: "Acessar catálogo de recompensas", category: "Loja" },
  add_items_to_cart: { label: "Adicionar itens no carrinho próprio", description: "Adicionar itens ao seu carrinho", category: "Loja" },
  remove_items_from_cart: { label: "Apagar itens no carrinho próprio", description: "Remover itens do seu carrinho", category: "Loja" },
  insert_new_items_catalog: { label: "Inserir novos itens no catálogo", description: "Adicionar produtos à loja", category: "Loja" },
  remove_items_catalog: { label: "Remover itens do catálogo", description: "Remover produtos da loja", category: "Loja" },
  
  // Gestão
  view_users_menu: { label: "Visualizar menu de Usuários", description: "Acessar menu de gerenciamento de usuários", category: "Gestão" },
  transfer_remove_users: { label: "Inserir/remover usuários", description: "Gerenciar usuários do sistema", category: "Gestão" },
  
  // Analytics
  view_analytics: { label: "Visualizar menu Analytics", description: "Acessar relatórios e métricas", category: "Analytics" },
  view_own_team_analytics: { label: "Analytics - dados próprios", description: "Ver analytics pessoais e do próprio time", category: "Analytics" },
  view_other_teams_analytics: { label: "Analytics - dados de outros times", description: "Ver analytics de outros times da empresa", category: "Analytics" },
};

export default function UserPermissionsModal({
  open,
  onClose,
  userId,
  userName,
  userRole,
}: UserPermissionsModalProps) {
  const [originalPermissions, setOriginalPermissions] = useState<Permission[]>([]);
  const [localPermissions, setLocalPermissions] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (open && userId) {
      loadPermissions();
    }
  }, [open, userId]);

  const loadPermissions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(`/api/users/${userId}/permissions`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setOriginalPermissions(data.permissions || []);
        
        // Construir mapa local de permissões
        const permMap: Record<string, boolean> = {};
        (data.permissions || []).forEach((p: Permission) => {
          permMap[p.permission] = p.value;
        });
        setLocalPermissions(permMap);
        setHasChanges(false);
      }
    } catch (error) {
      console.error("Erro ao carregar permissões:", error);
      toast.error("Erro ao carregar permissões");
    } finally {
      setLoading(false);
    }
  };

  const handleLocalChange = (permission: string, value: boolean) => {
    setLocalPermissions(prev => ({
      ...prev,
      [permission]: value,
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      
      // Identificar mudanças
      const changes: Array<{ permission: string; value: boolean }> = [];
      
      Object.entries(localPermissions).forEach(([permission, value]) => {
        const original = originalPermissions.find(p => p.permission === permission);
        if (!original || original.value !== value) {
          changes.push({ permission, value });
        }
      });

      if (changes.length === 0) {
        toast.info("Nenhuma alteração para salvar");
        setSaving(false);
        return;
      }

      // Usar API batch para salvar todas as mudanças de uma vez
      const res = await fetch(`/api/users/${userId}/permissions/batch`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ permissions: changes }),
      });

      if (res.ok) {
        toast.success(`${changes.length} permissão(ões) atualizada(s) com sucesso`);
        setHasChanges(false);
        await loadPermissions();
        
        // Disparar evento para atualizar permissões em outros componentes
        window.dispatchEvent(new Event('permissions-updated'));
      } else {
        const data = await res.json();
        toast.error(data.error || "Erro ao atualizar permissões");
      }
    } catch (error) {
      console.error("Erro ao salvar permissões:", error);
      toast.error("Erro ao salvar permissões");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Restaurar permissões originais
    const permMap: Record<string, boolean> = {};
    originalPermissions.forEach((p: Permission) => {
      permMap[p.permission] = p.value;
    });
    setLocalPermissions(permMap);
    setHasChanges(false);
    onClose();
  };

  const getPermissionValue = (permissionKey: string): boolean => {
    return localPermissions[permissionKey] ?? false;
  };

  const isCustomPermission = (permissionKey: string): boolean => {
    return originalPermissions.some(p => p.permission === permissionKey);
  };

  const groupedPermissions = Object.entries(PERMISSION_LABELS).reduce((acc, [key, data]) => {
    if (!acc[data.category]) {
      acc[data.category] = [];
    }
    acc[data.category].push({ key, ...data });
    return acc;
  }, {} as Record<string, Array<{ key: string; label: string; description: string }>>);

  return (
    <Dialog open={open} onOpenChange={hasChanges ? undefined : onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerenciar Permissões</DialogTitle>
          <DialogDescription>
            Usuário: <strong>{userName}</strong> | Role: <Badge>{userRole}</Badge>
            {hasChanges && (
              <Badge variant="outline" className="ml-2 text-orange-600 border-orange-600">
                Alterações não salvas
              </Badge>
            )}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
            <span className="ml-2 text-gray-500">Carregando permissões...</span>
          </div>
        ) : (
          <Tabs defaultValue={Object.keys(groupedPermissions)[0]} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              {Object.keys(groupedPermissions).map((category) => (
                <TabsTrigger key={category} value={category}>
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(groupedPermissions).map(([category, perms]) => (
              <TabsContent key={category} value={category} className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{category}</CardTitle>
                    <CardDescription>
                      Gerencie as permissões de {category.toLowerCase()} para este usuário
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {perms.map(({ key, label, description }) => {
                      const currentValue = getPermissionValue(key);
                      const isCustom = isCustomPermission(key);

                      return (
                        <div
                          key={key}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex-1 pr-4">
                            <div className="flex items-center gap-2 mb-1">
                              <Label htmlFor={key} className="font-semibold cursor-pointer text-base">
                                {label}
                              </Label>
                              {isCustom && (
                                <Badge variant="outline" className="text-xs">
                                  Customizado
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">{description}</p>
                          </div>
                          <Switch
                            id={key}
                            checked={currentValue}
                            onCheckedChange={(checked: boolean) => handleLocalChange(key, checked)}
                            disabled={saving}
                          />
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        )}

        <DialogFooter className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {hasChanges && "Você tem alterações não salvas"}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel} disabled={saving}>
              {hasChanges ? "Cancelar" : "Fechar"}
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={!hasChanges || saving}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Alterações"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
