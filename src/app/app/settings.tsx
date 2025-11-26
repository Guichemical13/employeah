"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import PasswordValidator, { usePasswordValidation } from "@/components/PasswordValidator";
import MyPermissionsView from "@/components/MyPermissionsView";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { User } from "@/types/models";

const profileSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  email: z.string().email("E-mail inválido"),
  username: z.string()
    .min(3, "Username deve ter no mínimo 3 caracteres")
    .max(50, "Username deve ter no máximo 50 caracteres")
    .regex(/^[a-zA-Z0-9_]+$/, "Username deve conter apenas letras, números e underscore")
    .optional()
    .or(z.literal("")),
  profilePicture: z.string().url("URL inválida").optional().or(z.literal("")),
  bio: z.string().max(200, "Bio deve ter no máximo 200 caracteres").optional().or(z.literal(""))
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
    defaultValues: { name: "", email: "", username: "", profilePicture: "", bio: "" },
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
    form.reset({ 
      name: data.user?.name || "", 
      email: data.user?.email || "",
      username: data.user?.username || "",
      profilePicture: data.user?.profilePicture || "",
      bio: data.user?.bio || ""
    });
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
      {user?.role === "SUPERVISOR" || user?.role === "COLLABORATOR" ? (
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="permissions">Minhas Permissões</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="font-bold text-xl mb-4">Perfil do Usuário</div>
              {loading ? (
                <div className="text-gray-400">Carregando...</div>
              ) : user ? (
                <div className="space-y-4">
                  {user.profilePicture && (
                    <div className="flex justify-center mb-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={user.profilePicture} 
                        alt={user.name}
                        className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                      />
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Nome</div>
                      <div className="font-medium">{user.name}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Email</div>
                      <div className="font-medium">{user.email}</div>
                    </div>
                    {user.username && (
                      <div>
                        <div className="text-sm text-gray-500">Username</div>
                        <div className="font-medium">@{user.username}</div>
                      </div>
                    )}
                    <div>
                      <div className="text-sm text-gray-500">Empresa ID</div>
                      <div className="font-medium">{user.companyId || "-"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Role</div>
                      <div className="font-medium">{user.role}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Pontos</div>
                      <div className="font-medium">{user.points} pts</div>
                    </div>
                  </div>
                  {user.bio && (
                    <div>
                      <div className="text-sm text-gray-500">Bio</div>
                      <div className="font-medium">{user.bio}</div>
                    </div>
                  )}
                  <div className="flex gap-2 mt-4 pt-4 border-t">
                    <Button onClick={handleOpenEdit}>Editar Perfil</Button>
                    <Button variant="outline" onClick={handleOpenPasswordChange}>Alterar Senha</Button>
                  </div>
                </div>
              ) : null}
            </div>
          </TabsContent>
          
          <TabsContent value="permissions">
            <MyPermissionsView />
          </TabsContent>
        </Tabs>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="font-bold text-xl mb-4">Perfil do Usuário</div>
          {loading ? (
            <div className="text-gray-400">Carregando...</div>
          ) : user ? (
            <div className="space-y-4">{user.profilePicture && (
              <div className="flex justify-center mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={user.profilePicture} 
                  alt={user.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                />
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500">Nome</div>
                <div className="font-medium">{user.name}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Email</div>
                <div className="font-medium">{user.email}</div>
              </div>
              {user.username && (
                <div>
                  <div className="text-sm text-gray-500">Username</div>
                  <div className="font-medium">@{user.username}</div>
                </div>
              )}
              <div>
                <div className="text-sm text-gray-500">Empresa ID</div>
                <div className="font-medium">{user.companyId || "-"}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Role</div>
                <div className="font-medium">{user.role}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Pontos</div>
                <div className="font-medium">{user.points} pts</div>
              </div>
            </div>
            {user.bio && (
              <div>
                <div className="text-sm text-gray-500">Bio</div>
                <div className="font-medium">{user.bio}</div>
              </div>
            )}
            <div className="flex gap-2 mt-4 pt-4 border-t">
              <Button onClick={handleOpenEdit}>Editar Perfil</Button>
              <Button variant="outline" onClick={handleOpenPasswordChange}>Alterar Senha</Button>
            </div>
          </div>
          ) : (
            <div className="text-gray-400">Usuário não encontrado.</div>
          )}
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Perfil</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
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
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username (opcional)</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">@</span>
                        <Input {...field} placeholder="seu_username" />
                      </div>
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-gray-500">Apenas letras, números e underscore</p>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="profilePicture"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL da Foto de Perfil (opcional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://exemplo.com/foto.jpg" />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-gray-500">Cole o link de uma imagem hospedada online</p>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio (opcional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Conte um pouco sobre você..." maxLength={200} />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-gray-500">Máximo 200 caracteres</p>
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
