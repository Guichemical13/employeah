"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import PasswordValidator, { usePasswordValidation } from "@/components/PasswordValidator";
import type { User } from "@/types/models";

const profileSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  email: z.string().email("E-mail inválido")
});
type ProfileForm = z.infer<typeof profileSchema>;

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Senha atual obrigatória"),
  newPassword: z.string()
    .min(8, "Senha mínima de 8 caracteres")
    .regex(/[A-Z]/, "Deve conter uma letra maiúscula")
    .regex(/[a-z]/, "Deve conter uma letra minúscula")
    .regex(/[0-9]/, "Deve conter um número"),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});
type PasswordForm = z.infer<typeof passwordSchema>;

export default function SettingsTab() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const router = useRouter();

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "", email: "" },
  });

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  useEffect(() => {
    fetchUser();
  }, []);

  async function fetchUser() {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    console.log("[settings] token:", token);
    const res = await fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setUser(data.user);
    form.reset({ name: data.user?.name || "", email: data.user?.email || "" });
    setLoading(false);
  }

  function handleOpenEdit() {
    setOpen(true);
  }

  function handleOpenPasswordChange() {
    setPasswordModalOpen(true);
    setPasswordError("");
    setPasswordSuccess("");
    passwordForm.reset();
  }

  async function onSubmit(values: ProfileForm) {
    if (!user) return;
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    console.log("[settings update] token:", token);
    await fetch(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(values)
    });
    setOpen(false);
    fetchUser();
  }

  async function onPasswordSubmit(values: PasswordForm) {
    if (!user) return;
    setPasswordError("");
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    
    try {
      const res = await fetch(`/api/users/${user.id}/change-password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword
        })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setPasswordSuccess("Senha alterada com sucesso!");
        setTimeout(() => {
          setPasswordModalOpen(false);
          setPasswordSuccess("");
        }, 2000);
      } else {
        setPasswordError(data.error || "Erro ao alterar senha");
      }
    } catch (error) {
      setPasswordError("Erro ao alterar senha");
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    router.push("/login");
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="font-bold mb-2">Perfil do Usuário</div>
        {loading ? (
          <div className="text-gray-400">Carregando...</div>
        ) : user ? (
          <div>
            <div><b>Nome:</b> {user.name}</div>
            <div><b>Email:</b> {user.email}</div>
            <div><b>Empresa:</b> {user.companyId || "-"}</div>
            <div><b>Role:</b> {user.role}</div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleOpenEdit}>Editar Perfil</Button>
              <Button variant="outline" onClick={handleOpenPasswordChange}>Alterar Senha</Button>
            </div>
          </div>
        ) : (
          <div className="text-gray-400">Usuário não encontrado.</div>
        )}
        <Button className="mt-4 bg-red-500 hover:bg-red-700 text-white" onClick={handleLogout}>Logout</Button>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Perfil</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">Salvar</Button>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancelar</Button>
                </DialogClose>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Modal de Troca de Senha */}
      <Dialog open={passwordModalOpen} onOpenChange={setPasswordModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Senha</DialogTitle>
          </DialogHeader>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha Atual</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nova Senha</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                    <PasswordValidator 
                      password={field.value || ""} 
                      className="mt-2"
                    />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar Nova Senha</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {passwordError && <div className="text-red-500 text-sm">{passwordError}</div>}
              {passwordSuccess && <div className="text-green-600 text-sm">{passwordSuccess}</div>}
              <DialogFooter>
                <Button type="submit">Alterar Senha</Button>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancelar</Button>
                </DialogClose>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
