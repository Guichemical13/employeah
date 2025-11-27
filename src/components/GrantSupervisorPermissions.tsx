"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function GrantSupervisorPermissions() {
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function grantCatalogPermissions() {
    if (!userId || isNaN(Number(userId))) {
      setMessage("Por favor, insira um ID de usuário válido");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");

      // Dar permissão para inserir itens
      const res1 = await fetch("/api/permissions/set", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: Number(userId),
          permission: "insert_new_items_catalog",
          value: true,
        }),
      });

      // Dar permissão para remover itens
      const res2 = await fetch("/api/permissions/set", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: Number(userId),
          permission: "remove_items_catalog",
          value: true,
        }),
      });

      if (res1.ok && res2.ok) {
        setMessage("✅ Permissões concedidas com sucesso! O supervisor agora pode criar/editar/remover categorias e itens.");
      } else {
        const error1 = await res1.json();
        setMessage(`❌ Erro: ${error1.error || 'Erro ao conceder permissões'}`);
      }
    } catch (error) {
      setMessage("❌ Erro ao conceder permissões");
    }

    setLoading(false);
  }

  async function revokeCatalogPermissions() {
    if (!userId || isNaN(Number(userId))) {
      setMessage("Por favor, insira um ID de usuário válido");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");

      // Remover permissão para inserir itens
      const res1 = await fetch("/api/permissions/set", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: Number(userId),
          permission: "insert_new_items_catalog",
          value: false,
        }),
      });

      // Remover permissão para remover itens
      const res2 = await fetch("/api/permissions/set", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: Number(userId),
          permission: "remove_items_catalog",
          value: false,
        }),
      });

      if (res1.ok && res2.ok) {
        setMessage("✅ Permissões revogadas com sucesso!");
      } else {
        const error1 = await res1.json();
        setMessage(`❌ Erro: ${error1.error || 'Erro ao revogar permissões'}`);
      }
    } catch (error) {
      setMessage("❌ Erro ao revogar permissões");
    }

    setLoading(false);
  }

  return (
    <Card className="max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Conceder Permissões de Catálogo ao Supervisor</CardTitle>
        <CardDescription>
          Permite que supervisores possam criar, editar e remover categorias e itens da loja
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="userId">ID do Usuário (Supervisor)</Label>
          <Input
            id="userId"
            type="number"
            placeholder="Ex: 1"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
          <p className="text-sm text-gray-500">
            Você pode encontrar o ID do usuário na página de gestão de usuários
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={grantCatalogPermissions}
            disabled={loading}
            className="flex-1"
          >
            Conceder Permissões
          </Button>
          <Button
            onClick={revokeCatalogPermissions}
            disabled={loading}
            variant="outline"
            className="flex-1"
          >
            Revogar Permissões
          </Button>
        </div>

        {message && (
          <div className={`p-4 rounded-lg ${message.startsWith('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {message}
          </div>
        )}

        <div className="border-t pt-4 mt-6">
          <h4 className="font-semibold mb-2">Permissões concedidas:</h4>
          <ul className="space-y-1 text-sm text-gray-600">
            <li>✓ Criar categorias</li>
            <li>✓ Editar categorias</li>
            <li>✓ Remover categorias</li>
            <li>✓ Criar itens</li>
            <li>✓ Editar itens</li>
            <li>✓ Remover itens</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
