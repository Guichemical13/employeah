"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { Elogio } from "@/types/models";

export default function ComplimentsTab() {
  const [compliments, setCompliments] = useState<Elogio[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [toId, setToId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedCompliment, setSelectedCompliment] = useState<Elogio | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    // Descobre o usuário logado primeiro
    const resMe = await fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } });
    const me = await resMe.json();
    setCurrentUserId(me.user?.id ?? null);
    // Busca todos os usuários
    const res = await fetch("/api/users", { headers: { Authorization: `Bearer ${token}` } });
    const usersList = await res.json();
    setUsers(usersList);
    // Depois de carregar usuários, carrega elogios
    fetchCompliments();
  }

  async function fetchCompliments() {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    console.log("[compliments] token:", token);
    const res = await fetch("/api/elogios", { headers: { Authorization: `Bearer ${token}` } });
    setCompliments(await res.json());
    setLoading(false);
  }

  async function handleSendCompliment() {
    if (!message || !toId) return;
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    console.log("[elogios create] token:", token);
    await fetch("/api/elogios/create", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ message, toId: Number(toId) })
    });
    setMessage("");
    setToId("");
    fetchCompliments();
  }

  async function handleLike(id: number) {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    console.log("[elogios like] token:", token);
    await fetch(`/api/elogios/${id}/like`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchCompliments();
  }

  function handleOpenCompliment(compliment: Elogio) {
    setSelectedCompliment(compliment);
    setOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="font-bold mb-2">Mural de Elogios</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-400 col-span-2">Carregando...</div>
        ) : compliments.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-400 col-span-2">Nenhum elogio encontrado.</div>
        ) : (
          compliments.map((elogio) => {
            const fromUser = users.find(u => u.id === elogio.fromId);
            return (
              <div key={elogio.id} className="bg-white rounded-lg shadow p-6 flex flex-col gap-2">
                <div className="font-bold">{elogio.message}</div>
                <div className="text-sm text-gray-500">Enviado por: {fromUser ? `${fromUser.name} (${fromUser.email})` : elogio.fromId}</div>
              </div>
            );
          })
        )}
      </div>
      <form className="flex gap-2 mt-4 items-end" onSubmit={e => { e.preventDefault(); handleSendCompliment(); }}>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Para:</label>
          <select className="w-full border rounded px-2 py-1" value={toId} onChange={e => setToId(e.target.value)} required>
            <option value="">Selecione o destinatário</option>
            {users
              .filter(u => u.role !== "COMPANY_ADMIN")
              .filter(u => currentUserId !== null && u.id !== currentUserId)
              .map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
              ))}
          </select>
        </div>
        <Input className="flex-1" placeholder="Escreva um elogio..." value={message} onChange={e => setMessage(e.target.value)} />
        <Button type="submit">Enviar</Button>
      </form>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Elogio</DialogTitle>
          </DialogHeader>
          <div>{selectedCompliment?.message}</div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Fechar</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
