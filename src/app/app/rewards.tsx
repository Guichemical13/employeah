"use client";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import type { Item, Category } from "@/types/models";
import RewardsCart from "./cart";

export default function RewardsTab() {
  const cartRef = useRef<any>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    console.log("[rewards] token:", token);
    setLoading(true);
    const [itemsRes, catsRes] = await Promise.all([
      fetch("/api/items", { headers: { Authorization: `Bearer ${token}` } }),
      fetch("/api/categories", { headers: { Authorization: `Bearer ${token}` } })
    ]);
    setItems(await itemsRes.json());
    setCategories(await catsRes.json());
    setLoading(false);
  }

  const filtered = items.filter((item) =>
    (!selectedCategory || item.categoryId === Number(selectedCategory)) &&
    (!search || item.name.toLowerCase().includes(search.toLowerCase()))
  );

  function handleOpenRedeem(item: Item) {
    setSelectedItem(item);
    setOpen(true);
  }

  async function handleRedeem() {
    if (!selectedItem) return;
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    console.log("[rewards spend] token:", token);
    await fetch("/api/points/spend", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ itemId: selectedItem.id })
    });
    setOpen(false);
    fetchData();
  }

  return (
    <div className="space-y-6">
      <RewardsCart ref={cartRef} />
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <select className="border rounded p-2 w-full sm:w-auto" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
          <option value="">Todas categorias</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <input className="border rounded p-2 flex-1" placeholder="Buscar recompensa..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-400 col-span-full">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-400 col-span-full">Nenhuma recompensa encontrada.</div>
        ) : filtered.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow p-4 lg:p-6 flex flex-col items-center">
            <div className="font-bold mb-2 text-center text-sm lg:text-base">{item.name}</div>
            <div className="mb-2 text-sm lg:text-base">Preço: <span className="font-bold text-purple-700">{item.price}</span></div>
            <div className="mb-4 text-sm lg:text-base">Estoque: {item.stock}</div>
            <Button 
              onClick={() => cartRef.current?.addToCart(item)}
              className="w-full text-xs lg:text-sm"
              disabled={item.stock === 0}
            >
              {item.stock === 0 ? 'Sem estoque' : 'Adicionar ao carrinho'}
            </Button>
          </div>
        ))}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Resgate</DialogTitle>
          </DialogHeader>
          <div>Deseja realmente resgatar <b>{selectedItem?.name}</b> por <b>{selectedItem?.price}</b> pontos?</div>
          <DialogFooter>
            <Button onClick={handleRedeem}>Confirmar</Button>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancelar</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
