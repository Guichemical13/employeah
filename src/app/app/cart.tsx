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
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false); // controls Sheet
  const [receipt, setReceipt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cartAnimation, setCartAnimation] = useState(false);

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

    // Trigger animation
    setCartAnimation(true);
    setTimeout(() => setCartAnimation(false), 600);
  }

  function removeFromCart(itemId: number) {
    setCart(prev => prev.filter(ci => ci.id !== itemId));
  }

  function updateQuantity(itemId: number, quantity: number) {
    setCart(prev => prev.map(ci => ci.id === itemId ? { ...ci, quantity: Math.max(1, quantity) } : ci));
  }

  function openCart() {
    setOpen(true);
  }

  async function handleRedeem() {
    setError(null);
    if (cart.length === 0) {
      setError("Adicione itens ao carrinho.");
      return;
    }
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const res = await fetch("/api/points/spend", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ items: cart.map(ci => ({ id: ci.id, quantity: ci.quantity })) })
    });
    if (res.ok) {
      setReceipt("Resgate realizado com sucesso! Você acabou de resgatar " + cart.map(ci => `${ci.name} (${ci.quantity})`).join(", ") + ".");
      setCart([]);
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
    openCart,
  }));

  return (
    <>
      {/* Botão flutuante para abrir o carrinho */}
      <div className="fixed bottom-4 right-4 z-50">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button 
              size="lg" 
              className={`rounded-full shadow-lg px-4 lg:px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold text-sm lg:text-base transition-all duration-300 ${
                cartAnimation ? 'scale-110 bg-green-500 hover:bg-green-600' : ''
              }`}
            >
              <span className="hidden sm:inline">Carrinho </span>
              ({cart.reduce((sum, ci) => sum + ci.quantity, 0)})
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Seu Carrinho</SheetTitle>
            </SheetHeader>
            {cart.length === 0 ? (
              <div className="text-gray-400 p-4">Seu carrinho está vazio.</div>
            ) : (
              <div className="space-y-3 p-2 max-h-60 overflow-y-auto">
                {cart.map(ci => (
                  <div key={ci.id} className="flex flex-col sm:flex-row sm:items-center gap-2 border-b pb-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{ci.name}</div>
                      <div className="text-xs text-gray-500">
                        {typeof ci.price === 'number' ? ci.price : ci.points} pts
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input 
                        type="number" 
                        min={1} 
                        value={ci.quantity} 
                        onChange={e => updateQuantity(ci.id, Number(e.target.value))} 
                        className="w-16 h-8 text-xs"
                      />
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => removeFromCart(ci.id)}
                        className="text-xs"
                      >
                        Remover
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="font-bold mt-2 text-center sm:text-left">
                  Total: {getTotalPoints()} pontos
                </div>
              </div>
            )}
            <div className="mt-4 p-2">
              {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
              <Button 
                onClick={handleRedeem}
                className="w-full mt-2" 
                disabled={cart.length === 0}
              >
                Resgatar
              </Button>
            </div>

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