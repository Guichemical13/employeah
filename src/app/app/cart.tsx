"use client";
import { useEffect, useState, useRef, forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetClose, SheetFooter } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";

// Adiciona o campo price ao CartItem e usa price como valor principal
interface Item {
  id: number;
  name: string;
  description: string;
  points?: number; // opcional
  price?: number;  // opcional
  imageUrl?: string;
}

interface CartItem extends Item {
  quantity: number;
}

const RewardsCart = forwardRef(function RewardsCart(props, ref) {
  const [items, setItems] = useState<Item[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [address, setAddress] = useState("");
  const [cep, setCep] = useState("");
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false); // controls Sheet
  const [receipt, setReceipt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    setLoading(true);
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const res = await fetch("/api/items", { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setItems(data);
    setLoading(false);
  }

  function addToCart(item: Item) {
    setCart(prev => {
      const found = prev.find(ci => ci.id === item.id);
      if (found) {
        return prev.map(ci => ci.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }

  function removeFromCart(itemId: number) {
    setCart(prev => prev.filter(ci => ci.id !== itemId));
  }

  function updateQuantity(itemId: number, quantity: number) {
    setCart(prev => prev.map(ci => ci.id === itemId ? { ...ci, quantity: Math.max(1, quantity) } : ci));
  }

  async function handleCepLookup() {
    if (!cep) return;
    setError(null);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (data.erro) {
        setError("CEP não encontrado");
        return;
      }
      setAddress(`${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`);
    } catch {
      setError("Erro ao buscar CEP");
    }
  }

  async function handleRedeem() {
    setError(null);
    if (!address || cart.length === 0) {
      setError("Preencha o endereço e adicione itens ao carrinho.");
      return;
    }
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const res = await fetch("/api/points/spend", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ items: cart.map(ci => ({ id: ci.id, quantity: ci.quantity })), address })
    });
    if (res.ok) {
      setReceipt("Resgate realizado com sucesso! Você receberá uma notificação quando o admin aprovar.");
      setCart([]);
      setAddress("");
      setCep("");
    } else {
      const err = await res.json();
      setError(err.message || "Erro ao resgatar itens.");
    }
  }

  // Corrige o total para usar price se existir, senão points
  const getTotalPoints = () => {
    return cart.reduce((sum, ci) => {
      const value = typeof ci.price === 'number' ? ci.price : (typeof ci.points === 'number' ? ci.points : 0);
      return sum + value * ci.quantity;
    }, 0);
  };

  useImperativeHandle(ref, () => ({
    addToCart,
  }));

  return (
    <>
      {/* Botão flutuante para abrir o carrinho */}
      <div className="fixed bottom-6 right-6 z-50">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button size="lg" className="rounded-full shadow-lg px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold">
              Carrinho ({cart.reduce((sum, ci) => sum + ci.quantity, 0)})
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="max-w-md w-full">
            <SheetHeader>
              <SheetTitle>Seu Carrinho</SheetTitle>
            </SheetHeader>
            {cart.length === 0 ? (
              <div className="text-gray-400 p-4">Seu carrinho está vazio.</div>
            ) : (
              <div className="space-y-2 p-2">
                {cart.map(ci => (
                  <div key={ci.id} className="flex items-center gap-2 border-b pb-2">
                    <span className="flex-1">{ci.name} ({typeof ci.price === 'number' ? ci.price : ci.points} pts)</span>
                    <Input type="number" min={1} value={ci.quantity} onChange={e => updateQuantity(ci.id, Number(e.target.value))} className="w-16" />
                    <Button variant="outline" onClick={() => removeFromCart(ci.id)}>Remover</Button>
                  </div>
                ))}
                <div className="font-bold mt-2">Total: {getTotalPoints()} pontos</div>
              </div>
            )}
            <form className="space-y-2 mt-4 p-2" onSubmit={e => { e.preventDefault(); handleRedeem(); }}>
              <label className="block font-medium">CEP:</label>
              <div className="flex gap-2">
                <Input value={cep} onChange={e => setCep(e.target.value)} placeholder="Digite o CEP" className="w-40" />
                <Button type="button" variant="outline" onClick={handleCepLookup}>Buscar</Button>
              </div>
              <label className="block font-medium mt-2">Endereço para entrega:</label>
              <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="Endereço completo" required />
              {error && <div className="text-red-500 text-sm">{error}</div>}
              <Button type="submit" className="mt-2" disabled={cart.length === 0}>Resgatar</Button>
            </form>
            {/* Recibo em Dialog */}
            <Dialog open={!!receipt} onOpenChange={v => { if (!v) setReceipt(null); }}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Recibo de Resgate</DialogTitle>
                </DialogHeader>
                <div>{receipt}</div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">Fechar</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <SheetFooter />
          </SheetContent>
        </Sheet>
      </div>

      {/* Cards de recompensas na tela principal */}
      <div className="space-y-8">
        <h2 className="font-bold text-xl mb-4">Catálogo de Recompensas</h2>
      </div>
    </>
  );
});

export default RewardsCart;