"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { PointTransaction } from "@/types/models";

export default function CentralTab() {
  const [points, setPoints] = useState(0);
  const [compliments, setCompliments] = useState(0);
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      setLoading(true);
      const [userRes, elogiosRes, transRes] = await Promise.all([
        fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/elogios", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/points/transactions", { headers: { Authorization: `Bearer ${token}` } })
      ]);
      const user = await userRes.json();
      const elogios = await elogiosRes.json();
      const trans = await transRes.json();
      setPoints(user.user?.points || 0);
      setCompliments(elogios.length || 0);
      setTransactions(trans || []);
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        <div className="bg-white rounded-lg shadow p-4 lg:p-6">
          <div className="text-gray-500 text-sm lg:text-base">Saldo de pontos</div>
          <div className="text-2xl lg:text-3xl font-bold text-purple-700">{loading ? '...' : points}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 lg:p-6">
          <div className="text-gray-500 text-sm lg:text-base">Total de elogios</div>
          <div className="text-2xl lg:text-3xl font-bold text-green-600">{loading ? '...' : compliments}</div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-4 lg:p-6">
        <div className="font-bold mb-4 text-lg lg:text-xl">Histórico de Pontos</div>
        {loading ? (
          <div className="text-gray-400">Carregando...</div>
        ) : transactions.length === 0 ? (
          <div className="text-gray-400">Nenhuma transação encontrada.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Data</th>
                  <th className="text-left py-2">Tipo</th>
                  <th className="text-left py-2">Descrição</th>
                  <th className="text-left py-2">Valor</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t, i) => {
                  const getTransactionDetails = (transaction: any) => {
                    switch (transaction.type) {
                      case 'award':
                        return {
                          label: 'Elogio Recebido',
                          description: transaction.description || 'Pontos ganhos por elogio',
                          color: 'bg-green-100 text-green-800'
                        };
                      case 'spend':
                        // Extrair nomes dos itens da descrição
                        const itemsText = transaction.description ? 
                          transaction.description.replace('Resgate de itens: ', '') : 
                          'Pontos gastos em resgate';
                        return {
                          label: 'Resgate de Item',
                          description: itemsText,
                          color: 'bg-red-100 text-red-800'
                        };
                      case 'admin_add':
                        return {
                          label: 'Bônus Admin',
                          description: transaction.description || `Pontos adicionados por ${transaction.adminName || 'administrador'}`,
                          color: 'bg-blue-100 text-blue-800'
                        };
                      case 'admin_remove':
                        return {
                          label: 'Ajuste Admin',
                          description: transaction.description || `Pontos removidos por ${transaction.adminName || 'administrador'}`,
                          color: 'bg-orange-100 text-orange-800'
                        };
                      default:
                        return {
                          label: 'Transação',
                          description: transaction.description || 'Transação de pontos',
                          color: 'bg-gray-100 text-gray-800'
                        };
                    }
                  };

                  const details = getTransactionDetails(t);

                  return (
                    <tr key={i} className="border-b">
                      <td className="py-2">{new Date(t.createdAt).toLocaleDateString('pt-BR')}</td>
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${details.color}`}>
                          {details.label}
                        </span>
                      </td>
                      <td className="py-2 text-gray-600">
                        {details.description}
                      </td>
                      <td className={`py-2 font-medium ${
                        t.amount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {t.amount > 0 ? '+' : ''}{t.amount}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
