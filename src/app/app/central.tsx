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
      console.log("[central] token:", token);
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
      <div className="flex gap-8">
        <div className="bg-white rounded-lg shadow p-6 flex-1">
          <div className="text-gray-500">Saldo de pontos</div>
          <div className="text-3xl font-bold text-purple-700">{loading ? '...' : points}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 flex-1">
          <div className="text-gray-500">Total de elogios</div>
          <div className="text-3xl font-bold text-green-600">{loading ? '...' : compliments}</div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="font-bold mb-2">Transações de Pontos</div>
        {loading ? (
          <div className="text-gray-400">Carregando...</div>
        ) : transactions.length === 0 ? (
          <div className="text-gray-400">Nenhuma transação encontrada.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left">Data</th>
                <th className="text-left">Tipo</th>
                <th className="text-left">Valor</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t, i) => (
                <tr key={i}>
                  <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                  <td>{t.type}</td>
                  <td>{t.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
