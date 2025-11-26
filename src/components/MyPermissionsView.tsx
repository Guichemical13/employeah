"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";

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

export default function MyPermissionsView() {
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch("/api/supervisor/permissions", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setPermissions(data.permissions || {});
      }
    } catch (error) {
      console.error("Erro ao carregar permissões:", error);
    } finally {
      setLoading(false);
    }
  };

  const groupedPermissions = Object.entries(PERMISSION_LABELS).reduce((acc, [key, data]) => {
    if (!acc[data.category]) {
      acc[data.category] = [];
    }
    acc[data.category].push({ key, ...data, value: permissions[key] ?? false });
    return acc;
  }, {} as Record<string, Array<{ key: string; label: string; description: string; value: boolean }>>);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Carregando permissões...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Minhas Permissões</h2>
        <p className="text-gray-600 mt-1">
          Visualize suas permissões no sistema. Contate um administrador para alterações.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Object.entries(groupedPermissions).map(([category, perms]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle>{category}</CardTitle>
              <CardDescription>
                Permissões de {category.toLowerCase()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {perms.map(({ key, label, value }) => (
                <div
                  key={key}
                  className={`flex items-center justify-between p-3 border rounded-lg ${
                    value ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {value ? (
                      <Check className="w-5 h-5 text-green-600" />
                    ) : (
                      <X className="w-5 h-5 text-gray-400" />
                    )}
                    <span className={`text-sm ${value ? "text-gray-900" : "text-gray-500"}`}>
                      {label}
                    </span>
                  </div>
                  <Badge variant={value ? "default" : "outline"}>
                    {value ? "Permitido" : "Negado"}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
