"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Bell, BellRing, Check, Trash2 } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";

type Notification = {
  id: number;
  message: string;
  read: boolean;
  createdAt: string;
  userId: number;
  user?: {
    name: string;
    email: string;
    companyId?: number;
  };
};

interface NotificationsTabProps {
  isAdminView?: boolean;
  currentUser?: any;
}

export default function NotificationsTab({ isAdminView = false, currentUser }: NotificationsTabProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<Notification | null>(null);
  const { refreshNotifications } = useNotifications();
  
  // Estado local para unreadCount para evitar conflitos
  const [localUnreadCount, setLocalUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    try {
      const res = await fetch("/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
        setLocalUnreadCount(data.filter((n: Notification) => !n.read).length);
      }
    } catch (error) {
      console.error("Erro ao buscar notificações:", error);
    }
    setLoading(false);
  }

  async function markAllAsRead() {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setLocalUnreadCount(0);
        // Atualiza o hook global também
        refreshNotifications();
      }
    } catch (error) {
      console.error("Erro ao marcar como lidas:", error);
    }
  }

  async function markAsRead(id: number) {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setNotifications(prev => 
          prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
        setLocalUnreadCount(prev => Math.max(0, prev - 1));
        // Atualiza o hook global também
        refreshNotifications();
      }
    } catch (error) {
      console.error("Erro ao marcar notificação como lida:", error);
    }
  }

  function openDeleteConfirm(notification: Notification) {
    setNotificationToDelete(notification);
    setDeleteConfirmOpen(true);
  }

  async function confirmDeleteNotification() {
    if (!notificationToDelete) return;
    
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    setDeletingId(notificationToDelete.id);
    try {
      const res = await fetch(`/api/notifications/${notificationToDelete.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setNotifications(prev => prev.filter(n => n.id !== notificationToDelete.id));
        // Atualiza o contador se a notificação deletada não era lida
        if (!notificationToDelete.read) {
          setLocalUnreadCount(prev => Math.max(0, prev - 1));
        }
        // Atualiza o hook global também
        refreshNotifications();
        setDeleteConfirmOpen(false);
        setNotificationToDelete(null);
      }
    } catch (error) {
      console.error("Erro ao deletar notificação:", error);
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="font-bold text-lg">Notificações</div>
        <div className="text-gray-400">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="font-bold text-lg lg:text-xl flex items-center gap-2">
          <Bell size={20} />
          Notificações
          {localUnreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-5 text-center">
              {localUnreadCount}
            </span>
          )}
        </div>
        {localUnreadCount > 0 && (
          <Button onClick={markAllAsRead} variant="outline" size="sm" className="w-full sm:w-auto">
            <Check size={16} className="mr-1" />
            Marcar todas como lidas
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-8">
          <Bell size={48} className="mx-auto text-gray-300 mb-4" />
          <div className="text-gray-400">Nenhuma notificação encontrada.</div>
        </div>
      ) : (
        <ul className="space-y-3">
          {notifications.map((notification) => (
            <li
              key={notification.id}
              className={`bg-white rounded-lg shadow p-4 border-l-4 ${
                notification.read ? "border-gray-300" : "border-blue-500"
              }`}
            >
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className={`${notification.read ? "text-gray-600" : "text-gray-900 font-medium"} break-words`}>
                    {notification.read ? (
                      <Bell size={16} className="inline mr-2 text-gray-400 flex-shrink-0" />
                    ) : (
                      <BellRing size={16} className="inline mr-2 text-blue-500 flex-shrink-0" />
                    )}
                    {notification.message}
                  </div>
                  {isAdminView && notification.user && notification.userId !== currentUser?.id && (
                    <div className="text-xs text-gray-500 mt-1 break-words">
                      Usuário: {notification.user.name} ({notification.user.email})
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-2">
                    {new Date(notification.createdAt).toLocaleString("pt-BR")}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {!notification.read && (
                    <Button
                      onClick={() => markAsRead(notification.id)}
                      variant="ghost"
                      size="sm"
                      title="Marcar como lida"
                    >
                      <Check size={14} />
                    </Button>
                  )}
                  <Button
                    onClick={() => openDeleteConfirm(notification)}
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    title="Deletar notificação"
                    disabled={deletingId === notification.id}
                  >
                    <Trash2 size={14} className={deletingId === notification.id ? "animate-spin" : ""} />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Modal de confirmação para deletar notificação */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 size={20} className="text-red-500" />
              Deletar Notificação
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600 mb-3">
              Tem certeza que deseja deletar esta notificação?
            </p>
            {notificationToDelete && (
              <div className="bg-gray-50 rounded-lg p-3 border-l-4 border-red-500">
                <p className="text-sm text-gray-700 break-words">
                  "{notificationToDelete.message.length > 100 
                    ? notificationToDelete.message.substring(0, 100) + '...' 
                    : notificationToDelete.message}"
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(notificationToDelete.createdAt).toLocaleString("pt-BR")}
                </p>
              </div>
            )}
          </div>
          <DialogFooter className="flex gap-2">
            <DialogClose asChild>
              <Button variant="outline" disabled={deletingId !== null}>
                Cancelar
              </Button>
            </DialogClose>
            <Button 
              onClick={confirmDeleteNotification}
              variant="destructive"
              disabled={deletingId !== null}
              className="flex items-center gap-2"
            >
              {deletingId !== null ? (
                <>
                  <Trash2 size={14} className="animate-spin" />
                  Deletando...
                </>
              ) : (
                <>
                  <Trash2 size={14} />
                  Deletar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
