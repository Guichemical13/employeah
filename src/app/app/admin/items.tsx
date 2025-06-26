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
import type { Item, Category, Company } from "@/types/models";

const itemSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  price: z.coerce.number().min(1, "Preço obrigatório"),
  stock: z.coerce.number().min(0, "Estoque obrigatório"),
  categoryId: z.string().optional(),
  companyId: z.string().optional(), // será validado manualmente para SUPER_ADMIN
});
type ItemForm = z.infer<typeof itemSchema>;

export default function ItemsTab() {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [userRole, setUserRole] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState<Item | null>(null);

  const form = useForm<ItemForm>({
    resolver: zodResolver(itemSchema),
    defaultValues: { name: "", price: 1, stock: 0, categoryId: "", companyId: "" },
  });

  useEffect(() => {
    fetchItems();
    fetchCategories();
    fetchUserRoleAndCompanies();
  }, []);

  async function fetchItems() {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    console.log("[admin items] token:", token);
    const res = await fetch("/api/items", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setItems(await res.json());
    setLoading(false);
  }

  async function fetchCategories() {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    console.log("[admin items categories] token:", token);
    const res = await fetch("/api/categories", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setCategories(await res.json());
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
    setEditItem(null);
    form.reset({ name: "", price: 1, stock: 0, categoryId: "", companyId: "" });
    setOpen(true);
  }

  function handleOpenEdit(item: Item) {
    setEditItem(item);
    form.reset({
      name: item.name,
      price: item.price,
      stock: item.stock,
      categoryId: item.categoryId?.toString() || "",
      companyId: item.companyId?.toString() || "",
    });
    setOpen(true);
  }

  async function onSubmit(values: ItemForm) {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    let payload: any = {
      ...values,
      categoryId: values.categoryId ? Number(values.categoryId) : undefined,
    };
    if (userRole === "SUPER_ADMIN") {
      if (!values.companyId) {
        alert("Selecione uma empresa!");
        return;
      }
      payload.companyId = Number(values.companyId);
    } else if (userRole === "COMPANY_ADMIN") {
      // Sempre pega o companyId do usuário logado
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const resMe = await fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } });
      const me = await resMe.json();
      payload.companyId = me.user?.companyId;
    }
    if (editItem) {
      console.log("[admin items update] token:", token);
      await fetch(`/api/items/${editItem.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
    } else {
      console.log("[admin items create] token:", token);
      await fetch("/api/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
    }
    setOpen(false);
    fetchItems();
  }

  async function handleDelete(itemId: Item["id"]) {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    console.log("[admin items delete] token:", token);
    await fetch(`/api/items/${itemId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchItems();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-2">
        <div className="font-bold text-lg">Itens</div>
        <Button onClick={handleOpenCreate}>Novo Item</Button>
      </div>
      {loading ? (
        <div className="text-gray-400">Carregando...</div>
      ) : items.length === 0 ? (
        <div className="text-gray-400">Nenhum item encontrado.</div>
      ) : (
        <ul className="space-y-2">
          {items.map((i) => (
            <li key={i.id} className="bg-white rounded shadow p-4 flex justify-between items-center">
              <span>{i.name} (R$ {i.price}) - Estoque: {i.stock}</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleOpenEdit(i)}>Editar</Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(i.id)}>Excluir</Button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editItem ? "Editar Item" : "Novo Item"}</DialogTitle>
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
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estoque</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <FormControl>
                      <select {...field} className="w-full border rounded px-2 py-1">
                        <option value="">Selecione a categoria</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
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
