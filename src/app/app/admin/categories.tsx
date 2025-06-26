"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Company, Category } from "@/types/models";

const categorySchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  companyId: z.string().optional(), // será validado manualmente para SUPER_ADMIN
});
type CategoryForm = z.infer<typeof categorySchema>;

export default function CategoriesTab() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [userRole, setUserRole] = useState<string>("");
  const [companiesLoading, setCompaniesLoading] = useState(false);

  const form = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", companyId: "" },
  });

  useEffect(() => {
    fetchCategories();
    fetchUserRoleAndCompanies();
  }, []);

  async function fetchCategories() {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    console.log("[admin categories] token:", token);
    const res = await fetch("/api/categories", { headers: { Authorization: `Bearer ${token}` } });
    setCategories(await res.json());
    setLoading(false);
  }

  async function fetchUserRoleAndCompanies() {
    setCompaniesLoading(true);
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
    setCompaniesLoading(false);
  }

  function handleOpenCreate() {
    setEditCategory(null);
    form.reset({ name: "" });
    setOpen(true);
  }

  function handleOpenEdit(category: Category) {
    setEditCategory(category);
    form.reset({ name: category.name });
    setOpen(true);
  }

  async function onSubmit(values: CategoryForm) {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    let body: any = { name: values.name };
    if (userRole === "SUPER_ADMIN") {
      if (!values.companyId) {
        alert("Selecione uma empresa!");
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
    if (editCategory) {
      console.log("[admin categories update] token:", token);
      await fetch(`/api/categories/${editCategory.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body)
      });
    } else {
      console.log("[admin categories create] token:", token);
      await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body)
      });
    }
    setOpen(false);
    fetchCategories();
  }

  async function handleDelete(categoryId: Category["id"]) {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    console.log("[admin categories delete] token:", token);
    await fetch(`/api/categories/${categoryId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchCategories();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-2">
        <div className="font-bold text-lg">Categorias</div>
        <Button onClick={handleOpenCreate}>Nova Categoria</Button>
      </div>
      {loading ? (
        <div className="text-gray-400">Carregando...</div>
      ) : categories.length === 0 ? (
        <div className="text-gray-400">Nenhuma categoria encontrada.</div>
      ) : (
        <ul className="space-y-2">
          {categories.map((cat) => (
            <li key={cat.id} className="bg-white rounded shadow p-4 flex justify-between items-center">
              <span>{cat.name}</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleOpenEdit(cat)}>Editar</Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(cat.id)}>Excluir</Button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editCategory ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
          </DialogHeader>
          {userRole === "SUPER_ADMIN" && companiesLoading ? (
            <div>Carregando empresas...</div>
          ) : (
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
                <DialogFooter>
                  <Button type="submit">Salvar</Button>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">Cancelar</Button>
                  </DialogClose>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
