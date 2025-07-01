"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import NotificationDialog from "@/components/ui/notification-dialog";
import { useNotification } from "@/hooks/useNotification";
import { Send, Loader2 } from "lucide-react";
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
  const [sending, setSending] = useState(false);
  const { notification, showSuccess, showError, hideNotification } = useNotification();

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
    const data = await res.json();
    // Garantir que users seja sempre um array
    setUsers(Array.isArray(data) ? data : (data.users || []));
    // Depois de carregar usuários, carrega elogios
    fetchCompliments();
  }

  async function fetchCompliments() {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const res = await fetch("/api/elogios", { headers: { Authorization: `Bearer ${token}` } });
    setCompliments(await res.json());
    setLoading(false);
  }

  async function handleSendCompliment() {
    if (!message || !toId) {
      showError('Campos obrigatórios', 'Selecione um destinatário e escreva uma mensagem.');
      return;
    }

    setSending(true);
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    
    try {
      const response = await fetch("/api/elogios/create", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message, toId: Number(toId) })
      });

      const data = await response.json();

      if (response.ok) {
        // Encontrar o nome do destinatário
        const recipient = users.find(u => u.id === Number(toId));
        const recipientName = recipient?.name || 'destinatário';

        // Limpar formulário
        setMessage("");
        setToId("");

        // Mostrar sucesso
        showSuccess(
          'Elogio enviado com sucesso! 🎉',
          `${recipientName} recebeu seu elogio e ganhou 10 pontos!`,
          () => {
            fetchCompliments(); // Atualizar lista de elogios
          }
        );
      } else {
        showError('Erro ao enviar elogio', data.error || 'Ocorreu um erro inesperado.');
      }
    } catch (error) {
      console.error('Erro:', error);
      showError('Erro de conexão', 'Não foi possível enviar o elogio. Tente novamente.');
    } finally {
      setSending(false);
    }
  }

  async function handleLike(id: number) {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
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
            const toUser = users.find(u => u.id === elogio.toId);
            return (
              <div key={elogio.id} className="bg-white rounded-lg shadow p-6 flex flex-col gap-2">
                <div className="font-bold text-gray-800">{elogio.message}</div>
                <div className="text-sm text-gray-500">
                  <span className="font-medium">De:</span> {fromUser ? `${fromUser.name}` : `Usuário ${elogio.fromId}`}
                </div>
                <div className="text-sm text-gray-500">
                  <span className="font-medium">Para:</span> {toUser ? `${toUser.name}` : `Usuário ${elogio.toId}`}
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(elogio.createdAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
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
        <Input 
          className="flex-1" 
          placeholder="Escreva um elogio..." 
          value={message} 
          onChange={e => setMessage(e.target.value)}
          disabled={sending}
        />
        <Button type="submit" disabled={sending || !message.trim() || !toId} className="flex items-center gap-2">
          {sending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Enviar
            </>
          )}
        </Button>
      </form>

      {/* Sistema de Notificações */}
      <NotificationDialog
        isOpen={notification.isOpen}
        onClose={hideNotification}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        confirmText={notification.confirmText}
        onConfirm={notification.onConfirm}
      />

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
