"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Search, Plus, Edit, Trash2, Package } from "lucide-react";
import type { Company, Category } from "@/types/models";

const categorySchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  companyId: z.string().optional(),
});
type CategoryForm = z.infer<typeof categorySchema>;

interface CategoryWithCount extends Category {
  _count?: { items: number };
  company?: { name: string };
}

export default function CategoriesTab() {
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [userRole, setUserRole] = useState<string>("");
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const form = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", companyId: "" },
  });

  useEffect(() => {
    fetchCategories();
    fetchUserRoleAndCompanies();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      setFilteredCategories(
        categories.filter(cat =>
          cat.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredCategories(categories);
    }
  }, [searchTerm, categories]);

  async function fetchCategories() {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const res = await fetch(`/api/categories?search=${searchTerm}`, { 
      headers: { Authorization: `Bearer ${token}` } 
    });
    const data = await res.json();
    setCategories(data);
    setFilteredCategories(data);
    setLoading(false);
  }

  async function fetchUserRoleAndCompanies() {
    setCompaniesLoading(true);
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const resMe = await fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } });
    const me = await resMe.json();
    setUserRole(me.user?.role || "");
    if (me.user?.role === "SUPER_ADMIN") {
      const res = await fetch("/api/companies", { headers: { Authorization: `Bearer ${token}` } });
      setCompanies(await res.json());
    }
    setCompaniesLoading(false);
  }

  function handleOpenCreate() {
    setEditCategory(null);
    form.reset({ name: "", companyId: "" });
    setOpen(true);
  }

  function handleOpenEdit(category: Category) {
    setEditCategory(category);
    form.reset({ name: category.name, companyId: category.companyId?.toString() });
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
      const resMe = await fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } });
      const me = await resMe.json();
      body.companyId = me.user?.companyId;
    }
    
    try {
      if (editCategory) {
        await fetch(`/api/categories/${editCategory.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(body)
        });
      } else {
        await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(body)
        });
      }
      setOpen(false);
      fetchCategories();
    } catch (error) {
      alert("Erro ao salvar categoria");
    }
  }

  async function handleDelete(categoryId: number) {
    if (!confirm("Tem certeza que deseja excluir esta categoria?")) return;
    
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    try {
      await fetch(`/api/categories/${categoryId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCategories();
    } catch (error) {
      alert("Erro ao excluir categoria");
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categorias</h1>
          <p className="text-gray-500 text-sm">Gerencie as categorias de produtos</p>
        </div>
        <Button onClick={handleOpenCreate} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Nova Categoria
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar categorias..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Categories List */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Carregando...</div>
      ) : filteredCategories.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400">Nenhuma categoria encontrada.</p>
          <Button onClick={handleOpenCreate} variant="outline" className="mt-4">
            Criar primeira categoria
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900">{cat.name}</h3>
                  {cat.company && (
                    <p className="text-xs text-gray-500 mt-1">{cat.company.name}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => handleOpenEdit(cat)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(cat.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Package className="h-4 w-4 mr-1" />
                <span>{cat._count?.items || 0} {cat._count?.items === 1 ? 'item' : 'itens'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editCategory ? "Editar Categoria" : "Nova Categoria"}
            </DialogTitle>
          </DialogHeader>
          {userRole === "SUPER_ADMIN" && companiesLoading ? (
            <div className="py-8 text-center text-gray-400">Carregando empresas...</div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Categoria</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Eletrônicos" {...field} />
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
                          <select className="w-full border rounded p-2" {...field}>
                            <option value="">Selecione uma empresa</option>
                            {companies.map((comp) => (
                              <option key={comp.id} value={comp.id}>
                                {comp.name}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <DialogFooter className="gap-2">
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      Cancelar
                    </Button>
                  </DialogClose>
                  <Button type="submit">
                    {editCategory ? "Salvar" : "Criar"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
