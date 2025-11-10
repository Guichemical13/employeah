import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import NotificationDialog from '@/components/ui/notification-dialog';
import { useNotification } from '@/hooks/useNotification';
import { getAuthToken, getAuthHeaders, getJsonAuthHeaders } from '@/lib/auth-utils';
import { Plus, Minus, User, Calendar } from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  points: number;
}

interface PointTransaction {
  id: number;
  amount: number;
  type: string;
  description: string | null;
  adminName: string | null;
  createdAt: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

interface PointsManagementProps {
  onSuccess?: () => void;
}

export default function PointsManagement({ onSuccess }: PointsManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const { notification, showSuccess, showError, hideNotification } = useNotification();

  useEffect(() => {
    fetchUsers();
    fetchTransactions();
  }, []);

  const fetchUsers = async () => {
    try {
      if (typeof window === 'undefined') {
        setLoadingUsers(false);
        return;
      }
      
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        setLoadingUsers(false);
        return;
      }

      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      if (typeof window === 'undefined') {
        setLoadingTransactions(false);
        return;
      }
      
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        setLoadingTransactions(false);
        return;
      }

      const response = await fetch('/api/points/admin', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const handleSubmit = async (type: 'add' | 'remove') => {
    if (!selectedUserId || !amount || !description.trim()) {
      showError('Campos obrigatórios', 'Preencha todos os campos antes de continuar.');
      return;
    }

    const numAmount = parseInt(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      showError('Valor inválido', 'Digite um valor válido maior que zero.');
      return;
    }

    setLoading(true);
    try {
      const finalAmount = type === 'remove' ? -numAmount : numAmount;
      
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        showError('Erro de autenticação', 'Token de autenticação não encontrado. Faça login novamente.');
        setLoading(false);
        return;
      }
      
      const response = await fetch('/api/points/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: parseInt(selectedUserId),
          amount: finalAmount,
          description: description.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showSuccess(
          `Pontos ${type === 'add' ? 'adicionados' : 'removidos'} com sucesso!`,
          `A operação foi realizada com sucesso. Os pontos foram atualizados.`,
          () => {
            if (onSuccess) onSuccess();
          }
        );
        
        setUsers(prev => prev.map(user => 
          user.id === data.user.id 
            ? { ...user, points: data.user.points }
            : user
        ));

        setSelectedUserId('');
        setAmount('');
        setDescription('');

        fetchTransactions();
        
      } else {
        showError('Erro na operação', data.error || 'Ocorreu um erro ao processar a operação.');
      }
    } catch (error) {
      console.error('Erro:', error);
      showError('Erro de conexão', 'Não foi possível conectar com o servidor. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const selectedUser = users.find(user => user.id === parseInt(selectedUserId));

  return (
    <div className="space-y-6">
      {/* Formulário de Gestão de Pontos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Gestão de Pontos
          </CardTitle>
          <CardDescription>
            Adicione ou remova pontos de funcionários da sua empresa
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="user-select">Funcionário</Label>
              {loadingUsers ? (
                <div className="p-3 border rounded text-gray-500">Carregando usuários...</div>
              ) : (
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um funcionário" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.name} - {user.points} pontos
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {selectedUser && (
                <div className="text-sm text-gray-600">
                  Pontos atuais: <Badge variant="secondary">{selectedUser.points}</Badge>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Quantidade de Pontos</Label>
              <Input
                id="amount"
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Ex: 100"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Motivo *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o motivo da alteração de pontos..."
              maxLength={500}
              rows={3}
            />
            <div className="text-xs text-gray-500">
              {description.length}/500 caracteres
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => handleSubmit('add')}
              disabled={loading || !selectedUserId || !amount || !description.trim()}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              {loading ? 'Processando...' : 'Adicionar Pontos'}
            </Button>

            <Button
              variant="destructive"
              onClick={() => handleSubmit('remove')}
              disabled={loading || !selectedUserId || !amount || !description.trim()}
              className="flex items-center gap-2"
            >
              <Minus className="h-4 w-4" />
              {loading ? 'Processando...' : 'Remover Pontos'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Histórico de Transações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Histórico de Transações
          </CardTitle>
          <CardDescription>
            Últimas operações de gestão de pontos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingTransactions ? (
            <div className="text-center py-8 text-gray-500">Carregando histórico...</div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhuma transação encontrada
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{transaction.user.name}</span>
                      <Badge 
                        variant={transaction.type === 'admin_add' ? 'default' : 'destructive'}
                      >
                        {transaction.type === 'admin_add' ? '+' : '-'}{Math.abs(transaction.amount)} pontos
                      </Badge>
                    </div>
                    {transaction.description && (
                      <p className="text-sm text-gray-600 mb-1">
                        {transaction.description}
                      </p>
                    )}
                    <div className="text-xs text-gray-500">
                      {transaction.adminName && `Por: ${transaction.adminName} • `}
                      {formatDate(transaction.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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
