import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import NotificationDialog from '@/components/ui/notification-dialog';
import { useNotification } from '@/hooks/useNotification';
import { getAuthToken, getJsonAuthHeaders } from '@/lib/auth-utils';
import { Heart, Send, User, Gift } from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  points: number;
}

interface SendComplimentProps {
  users: User[];
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export default function SendCompliment({ users, onSuccess, trigger }: SendComplimentProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [message, setMessage] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { notification, showSuccess, showError, hideNotification } = useNotification();

  const selectedUser = users.find(user => user.id === parseInt(selectedUserId));

  const handleSubmit = () => {
    if (!selectedUserId || !message.trim()) {
      showError('Campos obrigatórios', 'Preencha todos os campos antes de continuar.');
      return;
    }

    setIsConfirmOpen(true);
  };

  const confirmSend = async () => {
    if (!selectedUserId || !message.trim()) return;

    setLoading(true);
    try {
      const token = getAuthToken();
      
      if (!token) {
        showError('Erro de autenticação', 'Token de autenticação não encontrado. Faça login novamente.');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/elogios/create', {
        method: 'POST',
        headers: getJsonAuthHeaders(),
        body: JSON.stringify({
          toId: parseInt(selectedUserId),
          message: message.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsConfirmOpen(false);
        setIsOpen(false);
        
        setSelectedUserId('');
        setMessage('');

        showSuccess(
          'Elogio enviado com sucesso! 🎉',
          `${selectedUser?.name} recebeu 10 pontos e agora tem ${data.recipientNewPoints} pontos no total.`,
          () => {
            if (onSuccess) onSuccess();
          }
        );

      } else {
        showError('Erro ao enviar elogio', data.error || 'Ocorreu um erro inesperado.');
      }
    } catch (error) {
      console.error('Erro:', error);
      showError('Erro de conexão', 'Não foi possível conectar com o servidor. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const defaultTrigger = (
    <Button className="flex items-center gap-2">
      <Heart className="h-4 w-4" />
      Enviar Elogio
    </Button>
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {trigger || defaultTrigger}
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-500" />
              Enviar Elogio
            </DialogTitle>
            <DialogDescription>
              Reconheça o trabalho de um colega e ajude a espalhar positividade!
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user-select">Para quem você quer enviar o elogio?</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um colega" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      <div className="flex items-center justify-between w-full">
                        <span>{user.name}</span>
                        <Badge variant="secondary" className="ml-2">
                          {user.points} pts
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Sua mensagem</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escreva uma mensagem carinhosa reconhecendo o trabalho do seu colega..."
                maxLength={1000}
                rows={4}
                className="resize-none"
              />
              <div className="text-xs text-gray-500 text-right">
                {message.length}/1000 caracteres
              </div>
            </div>

            {selectedUser && (
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 text-blue-800 mb-1">
                  <Gift className="h-4 w-4" />
                  <span className="font-medium">Recompensa</span>
                </div>
                <p className="text-blue-700 text-sm">
                  {selectedUser.name} receberá <strong>10 pontos</strong> por este elogio!
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedUserId || !message.trim()}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <Heart className="h-5 w-5" />
              Confirmar Envio
            </DialogTitle>
            <DialogDescription>
              Revise seu elogio antes de enviar
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Para: {selectedUser.name}
                </CardTitle>
                <CardDescription>
                  {selectedUser.email}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-3 rounded-lg mb-3">
                  <p className="text-gray-800 italic">"{message}"</p>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Pontos atuais:</span>
                  <Badge variant="secondary">{selectedUser.points} pontos</Badge>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-green-600 font-medium">Após o elogio:</span>
                  <Badge className="bg-green-500">{selectedUser.points + 10} pontos</Badge>
                </div>
              </CardContent>
            </Card>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsConfirmOpen(false)}
              disabled={loading}
            >
              Voltar
            </Button>
            <Button
              onClick={confirmSend}
              disabled={loading}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <Heart className="h-4 w-4" />
                  Enviar Elogio
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
    </>
  );
}
