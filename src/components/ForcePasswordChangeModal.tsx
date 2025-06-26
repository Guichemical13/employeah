"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ForcePasswordChangeModal({ open, onPasswordChanged, userId, token }: { open: boolean, onPasswordChanged: () => void, userId: number, token: string }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function validatePassword(pw: string) {
    if (pw.length < 8) return "A senha deve ter pelo menos 8 caracteres.";
    if (!/[A-Z]/.test(pw)) return "A senha deve conter pelo menos uma letra maiúscula.";
    if (!/[a-z]/.test(pw)) return "A senha deve conter pelo menos uma letra minúscula.";
    if (!/[0-9]/.test(pw)) return "A senha deve conter pelo menos um número.";
    if (!/[!@#$%^&*()_+\-=[\]{};':\"\\|,.<>/?]/.test(pw)) return "A senha deve conter pelo menos um caractere especial.";
    return null;
  }

  async function handleChange() {
    setError("");
    setSuccess("");
    const validation = validatePassword(password);
    if (validation) {
      setError(validation);
      return;
    }
    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/users/${userId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ password, mustChangePassword: false }),
    });
    setLoading(false);
    if (res.ok) {
      setSuccess("Senha alterada com sucesso!");
      setTimeout(() => {
        setSuccess("");
        onPasswordChanged();
      }, 1000);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data?.error || "Erro ao atualizar senha. Tente novamente.");
    }
  }

  return (
    <Dialog open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Troca de senha obrigatória</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <p>Por segurança, você precisa definir uma nova senha antes de continuar.</p>
          <Input type="password" placeholder="Nova senha" value={password} onChange={e => setPassword(e.target.value)} autoFocus disabled={loading} />
          <Input type="password" placeholder="Confirme a nova senha" value={confirm} onChange={e => setConfirm(e.target.value)} disabled={loading} />
          {error && <div className="text-red-500 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">{success}</div>}
        </div>
        <DialogFooter>
          <Button onClick={handleChange} disabled={loading} className="w-full">
            {loading ? "Salvando..." : "Salvar nova senha"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
