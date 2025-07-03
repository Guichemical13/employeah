import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import NotificationDialog from '@/components/ui/notification-dialog';
import { useNotification } from '@/hooks/useNotification';
import { getAuthToken, getAuthHeaders } from '@/lib/auth-utils';
import { Trash2, Heart, User, Calendar, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Elogio {
  id: number;
  message: string;
  likes: number;
  createdAt: string;
  from: {
    id: number;
    name: string;
    email: string;
    company?: { name: string };
  };
  to: {
    id: number;
    name: string;
    email: string;
    company?: { name: string };
  };
}

interface ElogiosAdminProps {
  isAdmin?: boolean;
  onElogioDeleted?: () => void;
}

export default function ElogiosAdmin({ isAdmin = false, onElogioDeleted }: ElogiosAdminProps) {
  const [elogios, setElogios] = useState<Elogio[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [elogioToDelete, setElogioToDelete] = useState<Elogio | null>(null);
  const { notification, showSuccess, showError, hideNotification } = useNotification();

  useEffect(() => {
    fetchElogios();
  }, []);

  const fetchElogios = async () => {
    try {
      if (typeof window === 'undefined') {
        setLoading(false);
        return;
      }
      
      const token = getAuthToken();
      if (!token) {
        setLoading(false);
        return;
      }

      const endpoint = isAdmin ? '/api/elogios/admin' : '/api/elogios';
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setElogios(data.elogios || data || []);
      }
    } catch (error) {
      console.error('Erro ao buscar elogios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (elogio: Elogio) => {
    setElogioToDelete(elogio);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!elogioToDelete) return;

    setDeletingId(elogioToDelete.id);
    try {
      const response = await fetch(`/api/elogios/${elogioToDelete.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        setElogios(prev => prev.filter(elogio => elogio.id !== elogioToDelete.id));
        setDeleteDialogOpen(false);
        setElogioToDelete(null);
        
        showSuccess(
          'Elogio deletado com sucesso',
          'O elogio foi removido permanentemente.',
          () => {
            if (onElogioDeleted) {
              onElogioDeleted();
            }
          }
        );
      } else {
        const data = await response.json();
        showError('Erro ao deletar elogio', data.error || 'Ocorreu um erro inesperado.');
      }
    } catch (error) {
      console.error('Erro ao deletar elogio:', error);
      showError('Erro de conexão', 'Não foi possível conectar com o servidor. Tente novamente.');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const handleLike = async (elogioId: number) => {
    try {
      const response = await fetch(`/api/elogios/${elogioId}/like`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        setElogios(prev => prev.map(elogio => 
          elogio.id === elogioId 
            ? { ...elogio, likes: elogio.likes + 1 }
            : elogio
        ));
      }
    } catch (error) {
      console.error('Erro ao curtir elogio:', error);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Mural de Elogios</h2>
          <p className="text-gray-600">
            {isAdmin ? 'Gerencie todos os elogios da empresa' : 'Veja os elogios que você recebeu'}
          </p>
        </div>
        {elogios.length > 0 && (
          <Badge variant="secondary" className="text-sm">
            {elogios.length} elogio{elogios.length !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {elogios.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              {isAdmin ? 'Nenhum elogio encontrado' : 'Nenhum elogio recebido ainda'}
            </h3>
            <p className="text-gray-500">
              {isAdmin 
                ? 'Quando os funcionários enviarem elogios, eles aparecerão aqui.'
                : 'Quando alguém te enviar um elogio, ele aparecerá aqui.'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {elogios.map((elogio) => (
            <Card key={elogio.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-gray-500" />
                    <div>
                      <CardTitle className="text-lg">
                        De: <span className="text-blue-600">{elogio.from.name}</span>
                      </CardTitle>
                      <CardDescription>
                        Para: <span className="font-medium">{elogio.to.name}</span>
                        {isAdmin && elogio.from.company && (
                          <span className="ml-2 text-xs text-gray-500">
                            ({elogio.from.company.name})
                          </span>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                  
                  {isAdmin && (
                    <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(elogio)}
                          disabled={deletingId === elogio.id}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <p className="text-gray-800 leading-relaxed">{elogio.message}</p>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(elogio.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(elogio.id)}
                      className="flex items-center space-x-1 text-pink-600 hover:text-pink-800 hover:bg-pink-50"
                    >
                      <Heart className="h-4 w-4" />
                      <span>{elogio.likes}</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Confirmar Exclusão
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este elogio? Esta ação não vai poder ser desfeita.
            </DialogDescription>
          </DialogHeader>

          {elogioToDelete && (
            <div className="my-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-2">
                <strong>De:</strong> {elogioToDelete.from.name} → <strong>Para:</strong> {elogioToDelete.to.name}
              </div>
              <div className="text-sm bg-white p-3 rounded border">
                "{elogioToDelete.message}"
              </div>
            </div>
          )}

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              O remetente será notificado sobre a exclusão do elogio.
            </AlertDescription>
          </Alert>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deletingId !== null}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deletingId !== null}
              className="flex items-center gap-2"
            >
              {deletingId !== null ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Excluindo...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Excluir Elogio
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
    </div>
  );
}
