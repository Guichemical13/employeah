"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import NotificationDialog from "@/components/ui/notification-dialog";
import { useNotification } from "@/hooks/useNotification";
import { Send, Loader2, Heart, MessageCircle, Filter, Mail, MailOpen, Award, TrendingUp } from "lucide-react";
import type { Elogio } from "@/types/models";
import { Badge } from "@/components/ui/badge";
import { useBranding } from "@/hooks/useBranding";

export default function ComplimentsTab() {
  const { branding } = useBranding();
  const [compliments, setCompliments] = useState<Elogio[]>([]);
  const [filteredCompliments, setFilteredCompliments] = useState<Elogio[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [toId, setToId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedCompliment, setSelectedCompliment] = useState<Elogio | null>(null);
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState<'all' | 'received' | 'sent'>('all');
  const { notification, showSuccess, showError, hideNotification } = useNotification();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterCompliments();
  }, [filter, compliments, currentUserId]);

  async function fetchUsers() {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    // Descobre o usuário logado primeiro
    const resMe = await fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } });
    const me = await resMe.json();
    setCurrentUserId(me.user?.id ?? null);
    // Busca todos os usuários
    const res = await fetch("/api/users", { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    // CORRIGIDO: API retorna { users: [...] }
    setUsers(data.users || []);
    // Depois de carregar usuários, carrega elogios
    fetchCompliments();
  }

  async function fetchCompliments() {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const res = await fetch("/api/elogios", { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setCompliments(data);
    setLoading(false);
  }

  function filterCompliments() {
    if (!currentUserId) {
      setFilteredCompliments(compliments);
      return;
    }

    switch (filter) {
      case 'received':
        setFilteredCompliments(compliments.filter(c => c.toId === currentUserId));
        break;
      case 'sent':
        setFilteredCompliments(compliments.filter(c => c.fromId === currentUserId));
        break;
      default:
        setFilteredCompliments(compliments);
    }
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mural de Elogios</h1>
          <p className="text-gray-600">Envie e receba elogios da sua equipe</p>
        </div>

        {/* Send Compliment Form */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Send className="h-5 w-5" style={{ color: branding?.primaryColor || '#9333ea' }} />
            Enviar Elogio
          </h2>
          <form className="flex flex-col md:flex-row gap-4" onSubmit={e => { e.preventDefault(); handleSendCompliment(); }}>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Para:</label>
              <select 
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-offset-2 transition-all" 
                style={{ 
                  focusRing: branding?.primaryColor || '#9333ea'
                }}
                value={toId} 
                onChange={e => setToId(e.target.value)} 
                required
                disabled={sending}
              >
                <option value="">Selecione o destinatário</option>
                {users
                  .filter(u => currentUserId !== null && u.id !== currentUserId)
                  .map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                  ))}
              </select>
            </div>
            <div className="flex-[2]">
              <label className="block text-sm font-medium text-gray-700 mb-2">Mensagem:</label>
              <div className="flex gap-2">
                <Input 
                  className="flex-1" 
                  placeholder="Escreva um elogio..." 
                  value={message} 
                  onChange={e => setMessage(e.target.value)}
                  disabled={sending}
                />
                <Button 
                  type="submit" 
                  disabled={sending || !message.trim() || !toId} 
                  className="px-6"
                  style={{ backgroundColor: branding?.primaryColor || '#9333ea' }}
                >
                  {sending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Enviar
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700 mr-2">Filtrar:</span>
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
              className="gap-2"
              style={filter === 'all' ? { backgroundColor: branding?.primaryColor || '#9333ea' } : {}}
            >
              <MessageCircle className="h-4 w-4" />
              Todos ({compliments.length})
            </Button>
            <Button
              variant={filter === 'received' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('received')}
              className="gap-2"
              style={filter === 'received' ? { backgroundColor: branding?.primaryColor || '#9333ea' } : {}}
            >
              <MailOpen className="h-4 w-4" />
              Recebidos ({compliments.filter(c => c.toId === currentUserId).length})
            </Button>
            <Button
              variant={filter === 'sent' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('sent')}
              className="gap-2"
              style={filter === 'sent' ? { backgroundColor: branding?.primaryColor || '#9333ea' } : {}}
            >
              <Mail className="h-4 w-4" />
              Enviados ({compliments.filter(c => c.fromId === currentUserId).length})
            </Button>
          </div>
        </div>

        {/* Compliments Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-r-transparent" style={{ borderColor: branding?.primaryColor || '#9333ea' }}></div>
            <p className="mt-4 text-gray-500">Carregando elogios...</p>
          </div>
        ) : filteredCompliments.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg">
            <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum elogio encontrado</h3>
            <p className="text-gray-500">
              {filter === 'received' && 'Você ainda não recebeu nenhum elogio'}
              {filter === 'sent' && 'Você ainda não enviou nenhum elogio'}
              {filter === 'all' && 'Nenhum elogio foi enviado ainda'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompliments.map((elogio) => {
              const fromUser = users.find(u => u.id === elogio.fromId);
              const toUser = users.find(u => u.id === elogio.toId);
              const isReceived = elogio.toId === currentUserId;
              const isSent = elogio.fromId === currentUserId;
              
              return (
                <div 
                  key={elogio.id} 
                  className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer border-l-4"
                  style={{ 
                    borderLeftColor: isReceived 
                      ? (branding?.primaryColor || '#9333ea') 
                      : (branding?.secondaryColor || '#06b6d4')
                  }}
                  onClick={() => handleOpenCompliment(elogio)}
                >
                  <div className="p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        {isReceived ? (
                          <div className="flex items-center gap-2 mb-1">
                            <Award className="h-4 w-4" style={{ color: branding?.primaryColor || '#9333ea' }} />
                            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: branding?.primaryColor || '#9333ea' }}>
                              Recebido
                            </span>
                          </div>
                        ) : isSent ? (
                          <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="h-4 w-4" style={{ color: branding?.secondaryColor || '#06b6d4' }} />
                            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: branding?.secondaryColor || '#06b6d4' }}>
                              Enviado
                            </span>
                          </div>
                        ) : null}
                        <p className="text-sm text-gray-900 font-medium">
                          {isReceived ? (
                            <>
                              <span className="font-bold">{fromUser?.name || 'Usuário'}</span> enviou um elogio para você
                            </>
                          ) : isSent ? (
                            <>
                              Você enviou um elogio para <span className="font-bold">{toUser?.name || 'Usuário'}</span>
                            </>
                          ) : (
                            <>
                              <span className="font-bold">{fromUser?.name || 'Usuário'}</span> → <span className="font-bold">{toUser?.name || 'Usuário'}</span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Preview Message */}
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3 italic">
                      "{elogio.message}"
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          <Heart className="h-3 w-3 mr-1" />
                          {elogio.likes || 0}
                        </Badge>
                        {isReceived && (
                          <Badge 
                            className="text-xs"
                            style={{ backgroundColor: `${branding?.accentColor || '#10b981'}20`, color: branding?.accentColor || '#10b981' }}
                          >
                            +10 pontos
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(elogio.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

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

      {/* Compliment Details Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          {selectedCompliment && (() => {
            const fromUser = users.find(u => u.id === selectedCompliment.fromId);
            const toUser = users.find(u => u.id === selectedCompliment.toId);
            const isReceived = selectedCompliment.toId === currentUserId;

            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" style={{ color: branding?.primaryColor || '#9333ea' }} />
                    Detalhes do Elogio
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {/* From/To Info */}
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">De:</span>
                      <span className="font-semibold text-gray-900">{fromUser?.name || 'Usuário'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Para:</span>
                      <span className="font-semibold text-gray-900">{toUser?.name || 'Usuário'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Data:</span>
                      <span className="text-sm text-gray-700">
                        {new Date(selectedCompliment.createdAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Mensagem:</h4>
                    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4 border-l-4" style={{ borderLeftColor: branding?.primaryColor || '#9333ea' }}>
                      <p className="text-gray-900 italic">"{selectedCompliment.message}"</p>
                    </div>
                  </div>

                  {/* Points & Likes */}
                  <div className="flex items-center gap-4 pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <Heart className="h-5 w-5 text-red-500" />
                      <span className="text-sm text-gray-700">{selectedCompliment.likes || 0} curtidas</span>
                    </div>
                    {isReceived && (
                      <div className="flex items-center gap-2">
                        <Award className="h-5 w-5" style={{ color: branding?.accentColor || '#10b981' }} />
                        <span className="text-sm font-semibold" style={{ color: branding?.accentColor || '#10b981' }}>
                          +10 pontos ganhos
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">Fechar</Button>
                  </DialogClose>
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
