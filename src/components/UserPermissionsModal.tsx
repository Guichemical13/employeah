"use client";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

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
  view_personal_updates: { label: "Ver atualizações pessoais", description: "Visualizar próprias atualizações", category: "Visualizações" },
  view_company_updates: { label: "Ver atualizações da empresa", description: "Visualizar atualizações corporativas", category: "Visualizações" },
  view_team_wall: { label: "Ver mural do time", description: "Acessar mural de elogios", category: "Visualizações" },
  send_compliment: { label: "Enviar elogio", description: "Enviar elogios para outros", category: "Elogios" },
  like_compliment_sent_by_self: { label: "Curtir elogio próprio", description: "Curtir elogios enviados por si", category: "Elogios" },
  like_compliment_sent_by_others: { label: "Curtir elogio de terceiros", description: "Curtir elogios de outros", category: "Elogios" },
  view_store: { label: "Visualizar loja", description: "Acessar catálogo de itens", category: "Loja" },
  add_items_to_cart: { label: "Adicionar itens no carrinho", description: "Adicionar itens ao carrinho próprio", category: "Loja" },
  remove_items_from_cart: { label: "Apagar itens do carrinho", description: "Remover itens do carrinho próprio", category: "Loja" },
  view_users_menu: { label: "Visualizar menu de Usuários", description: "Acessar menu de gerenciamento de usuários", category: "Gestão" },
  transfer_remove_users: { label: "Transferir/remover usuários", description: "Gerenciar usuários do sistema", category: "Gestão" },
  insert_new_items_catalog: { label: "Inserir novos itens no catálogo", description: "Adicionar produtos à loja", category: "Gestão" },
  remove_items_catalog: { label: "Remover itens do catálogo", description: "Remover produtos da loja", category: "Gestão" },
  view_analytics: { label: "Visualizar menu Analytics", description: "Acessar relatórios e métricas", category: "Analytics" },
  view_own_team_analytics: { label: "Analytics - dados próprios", description: "Ver analytics do próprio time", category: "Analytics" },
  view_other_teams_analytics: { label: "Analytics - dados de outros times", description: "Ver analytics de outros times", category: "Analytics" },
  view_system_surveys: { label: "Ver Surveys sobre o sistema", description: "Acessar pesquisas do sistema", category: "Sistema" },
  configure_own_profile: { label: "Configurar seu próprio perfil", description: "Editar dados pessoais", category: "Sistema" },
  respond_system_surveys: { label: "Responder Surveys sobre o sistema", description: "Participar de pesquisas", category: "Sistema" },
};

export default function UserPermissionsModal({
  open,
  onClose,
  userId,
  userName,
  userRole,
}: UserPermissionsModalProps) {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

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
        setPermissions(data.permissions || []);
      }
    } catch (error) {
      console.error("Erro ao carregar permissões:", error);
      toast.error("Erro ao carregar permissões");
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = async (permission: string, value: boolean) => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(`/api/users/${userId}/permissions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ permission, value }),
      });

      if (res.ok) {
        toast.success("Permissão atualizada com sucesso");
        loadPermissions();
      } else {
        toast.error("Erro ao atualizar permissão");
      }
    } catch (error) {
      console.error("Erro ao atualizar permissão:", error);
      toast.error("Erro ao atualizar permissão");
    } finally {
      setSaving(false);
    }
  };

  const getPermissionValue = (permissionKey: string): boolean | undefined => {
    const custom = permissions.find((p) => p.permission === permissionKey);
    return custom !== undefined ? custom.value : undefined;
  };

  const groupedPermissions = Object.entries(PERMISSION_LABELS).reduce((acc, [key, data]) => {
    if (!acc[data.category]) {
      acc[data.category] = [];
    }
    acc[data.category].push({ key, ...data });
    return acc;
  }, {} as Record<string, Array<{ key: string; label: string; description: string }>>);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerenciar Permissões</DialogTitle>
          <DialogDescription>
            Usuário: <strong>{userName}</strong> | Role: <Badge>{userRole}</Badge>
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-gray-500">Carregando permissões...</div>
          </div>
        ) : (
          <Tabs defaultValue={Object.keys(groupedPermissions)[0]} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
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
                  <CardContent className="space-y-4">
                    {perms.map(({ key, label, description }) => {
                      const currentValue = getPermissionValue(key);
                      const isCustom = currentValue !== undefined;

                      return (
                        <div
                          key={key}
                          className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Label htmlFor={key} className="font-semibold cursor-pointer">
                                {label}
                              </Label>
                              {isCustom && (
                                <Badge variant="outline" className="text-xs">
                                  Customizado
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 mt-1">{description}</p>
                          </div>
                          <Checkbox
                            id={key}
                            checked={currentValue ?? false}
                            onCheckedChange={(checked) =>
                              handlePermissionChange(key, checked === true)
                            }
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

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
