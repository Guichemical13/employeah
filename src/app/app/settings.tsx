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
import type { User } from "@/types/models";

const profileSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  email: z.string().email("E-mail inválido")
});
type ProfileForm = z.infer<typeof profileSchema>;

export default function SettingsTab() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "", email: "" },
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
            <Button className="mt-4" onClick={handleOpenEdit}>Editar Perfil</Button>
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
    </div>
  );
}
