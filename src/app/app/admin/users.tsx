"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import PasswordValidator from "@/components/PasswordValidator";
import type { Company, User } from "@/types/models";

const userSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  email: z.string().email("E-mail inválido"),
  password: z.string()
    .min(8, "Senha mínima de 8 caracteres")
    .regex(/[A-Z]/, "Deve conter uma letra maiúscula")
    .regex(/[a-z]/, "Deve conter uma letra minúscula")
    .regex(/[0-9]/, "Deve conter um número")
    .optional()
    .or(z.literal("")),
  companyId: z.string().optional(), // será validado manualmente para SUPER_ADMIN
  points: z.coerce.number().min(0, "Pontos não pode ser negativo").optional(),
});
type UserForm = z.infer<typeof userSchema>;

export default function UsersTab() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [userRole, setUserRole] = useState<string>("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const form = useForm<UserForm>({
    resolver: zodResolver(userSchema),
    defaultValues: { name: "", email: "", password: "", companyId: "" },
  });

  useEffect(() => {
    fetchUsers();
    fetchUserRoleAndCompanies();
  }, []);

  async function fetchUsers() {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const res = await fetch("/api/users", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setUsers(data.users || []);
    setLoading(false);
  }

  async function fetchUserRoleAndCompanies() {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    // Busca o papel do usuário
    const resMe = await fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } });
    const me = await resMe.json();
    setUserRole(me.user?.role || "");
    if (me.user?.role === "SUPER_ADMIN") {
      // Busca empresas
      const res = await fetch("/api/companies", { headers: { Authorization: `Bearer ${token}` } });
      setCompanies(await res.json());
    }
  }

  function handleOpenCreate() {
    setEditUser(null);
    form.reset({ name: "", email: "", password: "", points: 0 });
    setOpen(true);
  }

  function handleOpenEdit(user: User) {
    setEditUser(user);
    form.reset({ name: user.name, email: user.email, password: "", points: user.points });
    setOpen(true);
  }

  async function onSubmit(values: UserForm) {
    setFormError("");
    setFormSuccess("");
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    let body: any = { name: values.name, email: values.email };
    // Só envia password se o campo não estiver vazio
    if (values.password && values.password.length >= 8) {
      body.password = values.password;
    }
    if (typeof values.points !== "undefined") {
      body.points = values.points;
    }
    if (userRole === "SUPER_ADMIN") {
      if (!values.companyId) {
        setFormError("Selecione uma empresa!");
        return;
      }
      body.companyId = Number(values.companyId);
    } else if (userRole === "COMPANY_ADMIN") {
      // Sempre pega o companyId do usuário logado
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const resMe = await fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } });
      const me = await resMe.json();
      body.companyId = me.user?.companyId;
    }
    try {
      let res;
      if (editUser) {
        res = await fetch(`/api/users/${editUser.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });
      } else {
        res = await fetch("/api/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });
      }
      if (res.ok) {
        setFormSuccess("Usuário salvo com sucesso!");
        setTimeout(() => {
          setOpen(false);
          setFormSuccess("");
          fetchUsers();
        }, 1000);
      } else {
        const data = await res.json().catch(() => ({}));
        setFormError(data?.error || "Erro ao salvar usuário.");
      }
    } catch (e) {
      setFormError("Erro inesperado. Tente novamente.");
    }
  }

  async function handleDelete(userId: User["id"]) {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    console.log("[admin users delete] token:", token);
    await fetch(`/api/users/${userId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchUsers();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-2">
        <div className="font-bold text-lg lg:text-xl">Usuários</div>
        <Button onClick={handleOpenCreate} className="w-full sm:w-auto">Novo Usuário</Button>
      </div>
      {loading ? (
        <div className="text-gray-400">Carregando...</div>
      ) : users.length === 0 ? (
        <div className="text-gray-400">Nenhum usuário encontrado.</div>
      ) : (
        <div className="space-y-2">
          {users.map((u) => (
            <div key={u.id} className="bg-white rounded shadow p-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">{u.name}</div>
                  <div className="text-sm text-gray-500 truncate">{u.email}</div>
                  <div className="text-xs text-gray-400">
                    Pontos: {u.points || 0} | Função: {u.role}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button size="sm" variant="outline" onClick={() => handleOpenEdit(u)} className="flex-1 sm:flex-none">
                    Editar
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(u.id)} className="flex-1 sm:flex-none">
                    Excluir
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editUser ? "Editar Usuário" : "Novo Usuário"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
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
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
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
              {userRole === "SUPER_ADMIN" && (
                <FormField
                  control={form.control}
                  name="companyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Empresa</FormLabel>
                      <FormControl>
                        <select {...field} className="w-full border rounded px-2 py-1">
                          <option value="">Selecione a empresa</option>
                          {companies.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="points"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pontos</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {formError && <div className="text-red-500 text-sm">{formError}</div>}
              {formSuccess && <div className="text-green-600 text-sm">{formSuccess}</div>}
              <DialogFooter>
                <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Salvando..." : "Salvar"}</Button>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </DialogClose>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
