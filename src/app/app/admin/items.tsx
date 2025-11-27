"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Search, Plus, Edit, Trash2, Package, ImageIcon } from "lucide-react";
import type { Item, Category, Company } from "@/types/models";

const itemSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  description: z.string().optional(),
  imageUrl: z.string().url("URL inválida").optional().or(z.literal('')),
  price: z.coerce.number().min(0, "Preço deve ser maior ou igual a 0"),
  stock: z.coerce.number().min(0, "Estoque deve ser maior ou igual a 0"),
  categoryId: z.string().optional(),
  companyId: z.string().optional(),
  newCategoryName: z.string().optional(),
});
type ItemForm = z.infer<typeof itemSchema>;

interface ItemWithRelations extends Item {
  category?: { name: string };
  company?: { name: string };
}

export default function ItemsTab() {
  const [items, setItems] = useState<ItemWithRelations[]>([]);
  const [filteredItems, setFilteredItems] = useState<ItemWithRelations[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [userRole, setUserRole] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState<Item | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showNewCategory, setShowNewCategory] = useState(false);

  const form = useForm<ItemForm>({
    resolver: zodResolver(itemSchema),
    defaultValues: { 
      name: "", 
      description: "",
      imageUrl: "",
      price: 0, 
      stock: 0, 
      categoryId: "", 
      companyId: "",
      newCategoryName: ""
    },
  });

  useEffect(() => {
    fetchItems();
    fetchCategories();
    fetchUserRoleAndCompanies();
  }, []);

  useEffect(() => {
    let filtered = items;
    
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(item => 
        item.categoryId === Number(selectedCategory)
      );
    }
    
    setFilteredItems(filtered);
  }, [searchTerm, selectedCategory, items]);

  async function fetchItems() {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const res = await fetch("/api/items", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setItems(data);
    setFilteredItems(data);
    setLoading(false);
  }

  async function fetchCategories() {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const res = await fetch("/api/categories", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setCategories(await res.json());
  }

  async function fetchUserRoleAndCompanies() {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const resMe = await fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } });
    const me = await resMe.json();
    setUserRole(me.user?.role || "");
    if (me.user?.role === "SUPER_ADMIN") {
      const res = await fetch("/api/companies", { headers: { Authorization: `Bearer ${token}` } });
      setCompanies(await res.json());
    }
  }

  function handleOpenCreate() {
    setEditItem(null);
    setShowNewCategory(false);
    form.reset({ 
      name: "", 
      description: "",
      imageUrl: "",
      price: 0, 
      stock: 0, 
      categoryId: "", 
      companyId: "",
      newCategoryName: ""
    });
    setOpen(true);
  }

  function handleOpenEdit(item: ItemWithRelations) {
    setEditItem(item);
    setShowNewCategory(false);
    form.reset({
      name: item.name,
      description: item.description || "",
      imageUrl: item.imageUrl || "",
      price: item.price,
      stock: item.stock,
      categoryId: item.categoryId?.toString() || "",
      companyId: item.companyId?.toString() || "",
      newCategoryName: ""
    });
    setOpen(true);
  }

  async function onSubmit(values: ItemForm) {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    let payload: any = {
      name: values.name,
      description: values.description || null,
      imageUrl: values.imageUrl || null,
      price: values.price,
      stock: values.stock,
    };
    
    // Se está criando nova categoria
    if (showNewCategory && values.newCategoryName) {
      payload.createCategory = values.newCategoryName;
    } else if (values.categoryId) {
      payload.categoryId = Number(values.categoryId);
    }
    
    if (userRole === "SUPER_ADMIN") {
      if (!values.companyId) {
        alert("Selecione uma empresa!");
        return;
      }
      payload.companyId = Number(values.companyId);
    } else if (userRole === "COMPANY_ADMIN") {
      const resMe = await fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } });
      const me = await resMe.json();
      payload.companyId = me.user?.companyId;
    }
    
    try {
      if (editItem) {
        await fetch(`/api/items/${editItem.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      } else {
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
      fetchCategories(); // Atualiza categorias se criou uma nova
    } catch (error) {
      alert("Erro ao salvar item");
    }
  }

  async function handleDelete(itemId: number) {
    if (!confirm("Tem certeza que deseja excluir este item?")) return;
    
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    try {
      await fetch(`/api/items/${itemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchItems();
    } catch (error) {
      alert("Erro ao excluir item");
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Itens</h1>
          <p className="text-gray-500 text-sm">Gerencie os itens da loja</p>
        </div>
        <Button onClick={handleOpenCreate} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Novo Item
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar itens..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border rounded p-2"
        >
          <option value="">Todas as categorias</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Carregando...</div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400">Nenhum item encontrado.</p>
          <Button onClick={handleOpenCreate} variant="outline" className="mt-4">
            Criar primeiro item
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Image */}
              <div className="h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
                {item.imageUrl ? (
                  <img 
                    src={item.imageUrl} 
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="h-12 w-12 text-gray-300" />
                )}
              </div>
              
              {/* Content */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 truncate">{item.name}</h3>
                    {item.category && (
                      <p className="text-xs text-gray-500">{item.category.name}</p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => handleOpenEdit(item)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
                
                {item.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                )}
                
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-purple-700">{item.price} pts</span>
                  <span className="text-gray-500">Estoque: {item.stock}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editItem ? "Editar Item" : "Novo Item"}
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
                    <FormLabel>Nome do Item</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Mouse Gamer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descrição detalhada do item..." 
                        {...field}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL da Imagem</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://exemplo.com/imagem.jpg" 
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Cole o link de uma imagem hospedada na web
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço (Pontos)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
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
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Category Selection or Creation */}
              <div className="space-y-2">
                <FormLabel>Categoria</FormLabel>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={!showNewCategory ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowNewCategory(false)}
                  >
                    Selecionar existente
                  </Button>
                  <Button
                    type="button"
                    variant={showNewCategory ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowNewCategory(true)}
                  >
                    Criar nova
                  </Button>
                </div>
                
                {!showNewCategory ? (
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <select {...field} className="w-full border rounded p-2">
                            <option value="">Sem categoria</option>
                            {categories.map((cat) => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <FormField
                    control={form.control}
                    name="newCategoryName"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Nome da nova categoria" {...field} />
                        </FormControl>
                        <FormDescription>
                          A categoria será criada automaticamente
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
              
              {userRole === "SUPER_ADMIN" && (
                <FormField
                  control={form.control}
                  name="companyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Empresa</FormLabel>
                      <FormControl>
                        <select {...field} className="w-full border rounded p-2">
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
              
              <DialogFooter className="gap-2">
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </DialogClose>
                <Button type="submit">
                  {editItem ? "Salvar" : "Criar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
