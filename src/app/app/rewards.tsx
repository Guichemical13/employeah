"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Search, Plus, Minus, Package, X, ImageIcon, Coins } from "lucide-react";
import type { Item, Category } from "@/types/models";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { useBranding } from "@/hooks/useBranding";

interface ItemWithCategory extends Item {
  category?: { name: string };
}

interface CartItem extends ItemWithCategory {
  quantity: number;
}

export default function RewardsTab() {
  const router = useRouter();
  const { branding } = useBranding();
  const [items, setItems] = useState<ItemWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredItems, setFilteredItems] = useState<ItemWithCategory[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ItemWithCategory | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  const [animatingItems, setAnimatingItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterItems();
  }, [search, selectedCategory, items]);

  async function fetchData() {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    setLoading(true);
    const [itemsRes, catsRes, userRes] = await Promise.all([
      fetch("/api/items", { headers: { Authorization: `Bearer ${token}` } }),
      fetch("/api/categories", { headers: { Authorization: `Bearer ${token}` } }),
      fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
    ]);
    const itemsData = await itemsRes.json();
    setItems(itemsData);
    setFilteredItems(itemsData);
    setCategories(await catsRes.json());
    const userData = await userRes.json();
    setUserPoints(userData.user?.points || 0);
    setLoading(false);
  }

  function filterItems() {
    let filtered = items;
    
    if (selectedCategory) {
      filtered = filtered.filter(item => item.categoryId === Number(selectedCategory));
    }
    
    if (search) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    setFilteredItems(filtered);
  }

  function handleViewDetails(item: ItemWithCategory) {
    setSelectedItem(item);
    setDetailsOpen(true);
  }

  function addToCart(item: ItemWithCategory, quantity: number = 1, event?: React.MouseEvent) {
    // Adicionar animação
    setAnimatingItems(prev => new Set(prev).add(item.id));
    
    // Criar elemento animado se tiver event
    if (event) {
      const button = event.currentTarget as HTMLElement;
      const rect = button.getBoundingClientRect();
      const cartButton = document.querySelector('[data-cart-button]');
      
      if (cartButton) {
        const cartRect = cartButton.getBoundingClientRect();
        const flyingItem = document.createElement('div');
        flyingItem.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${branding?.primaryColor || '#9333ea'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`;
        flyingItem.style.cssText = `
          position: fixed;
          left: ${rect.left + rect.width / 2}px;
          top: ${rect.top + rect.height / 2}px;
          width: 24px;
          height: 24px;
          z-index: 9999;
          pointer-events: none;
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        `;
        document.body.appendChild(flyingItem);
        
        setTimeout(() => {
          flyingItem.style.left = `${cartRect.left + cartRect.width / 2}px`;
          flyingItem.style.top = `${cartRect.top + cartRect.height / 2}px`;
          flyingItem.style.opacity = '0';
          flyingItem.style.transform = 'scale(0.3)';
        }, 10);
        
        setTimeout(() => {
          document.body.removeChild(flyingItem);
        }, 850);
      }
    }
    
    // Remover animação após delay
    setTimeout(() => {
      setAnimatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(item.id);
        return newSet;
      });
    }, 600);
    
    setCart(prev => {
      const existing = prev.find(ci => ci.id === item.id);
      if (existing) {
        return prev.map(ci => 
          ci.id === item.id 
            ? { ...ci, quantity: Math.min(ci.quantity + quantity, item.stock) }
            : ci
        );
      }
      return [...prev, { ...item, quantity: Math.min(quantity, item.stock) }];
    });
  }

  function updateCartQuantity(itemId: number, quantity: number) {
    setCart(prev => prev.map(ci => 
      ci.id === itemId ? { ...ci, quantity: Math.max(1, Math.min(quantity, ci.stock)) } : ci
    ));
  }

  function removeFromCart(itemId: number) {
    setCart(prev => prev.filter(ci => ci.id !== itemId));
  }

  function getTotalPoints() {
    return cart.reduce((sum, ci) => sum + (ci.price * ci.quantity), 0);
  }

  function getTotalItems() {
    return cart.reduce((sum, ci) => sum + ci.quantity, 0);
  }

  function handleCheckout() {
    // Salvar cart no localStorage e redirecionar para checkout
    localStorage.setItem('checkoutCart', JSON.stringify(cart));
    router.push('/app/checkout');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Loja de Recompensas</h1>
            <p className="text-gray-600">Troque seus pontos por produtos incríveis</p>
          </div>
          <div 
            className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg p-4 border-2 min-w-[200px]"
            style={{ borderColor: branding?.primaryColor || '#9333ea' }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Coins className="h-5 w-5" style={{ color: branding?.primaryColor || '#9333ea' }} />
              <span className="text-sm font-medium text-gray-600">Seu Saldo</span>
            </div>
            <div className="text-3xl font-bold" style={{ color: branding?.primaryColor || '#9333ea' }}>
              {userPoints.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-1">pontos disponíveis</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Buscar produtos..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
            <select
              className="border rounded-lg p-2.5 h-11 bg-white"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
            >
              <option value="">Todas as categorias</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-500">Carregando produtos...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum produto encontrado</h3>
            <p className="text-gray-500">Tente ajustar os filtros de busca</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col cursor-pointer"
                onClick={() => handleViewDetails(item)}
              >
                {/* Image */}
                <div className="h-48 bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center overflow-hidden relative">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="h-16 w-16 text-gray-300" />
                  )}
                  {item.stock === 0 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">Esgotado</span>
                    </div>
                  )}
                  {item.category && (
                    <Badge className="absolute top-2 left-2 bg-white text-gray-700">
                      {item.category.name}
                    </Badge>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem]">
                    {item.name}
                  </h3>
                  
                  {item.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {item.description}
                    </p>
                  )}

                  <div className="mt-auto">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-baseline">
                        <span className="text-2xl font-bold text-purple-700">{item.price}</span>
                        <span className="text-sm text-gray-500 ml-1">pontos</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        Estoque: {item.stock}
                      </span>
                    </div>

                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(item, 1, e);
                      }}
                      disabled={item.stock === 0}
                      className="w-full transition-transform"
                      style={{
                        backgroundColor: branding?.primaryColor || '#9333ea',
                        transform: animatingItems.has(item.id) ? 'scale(0.95)' : 'scale(1)'
                      }}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {animatingItems.has(item.id) ? 'Adicionado!' : 'Adicionar ao Carrinho'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Cart Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="lg"
          onClick={() => setCartOpen(true)}
          data-cart-button
          className="rounded-full shadow-2xl h-16 px-6 relative transition-all duration-300 hover:scale-110 hover:shadow-3xl"
          style={{
            backgroundColor: branding?.primaryColor || '#9333ea',
            boxShadow: `0 10px 40px ${branding?.primaryColor || '#9333ea'}40`
          }}
        >
          <ShoppingCart className="h-6 w-6 mr-2" />
          <span className="font-bold">Carrinho</span>
          {getTotalItems() > 0 && (
            <Badge 
              className="absolute -top-2 -right-2 h-7 w-7 rounded-full p-0 flex items-center justify-center animate-pulse"
              style={{ backgroundColor: branding?.accentColor || '#ef4444' }}
            >
              {getTotalItems()}
            </Badge>
          )}
        </Button>
      </div>

      {/* Product Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedItem.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {/* Image */}
                <div className="h-64 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg flex items-center justify-center overflow-hidden">
                  {selectedItem.imageUrl ? (
                    <img
                      src={selectedItem.imageUrl}
                      alt={selectedItem.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <ImageIcon className="h-24 w-24 text-gray-300" />
                  )}
                </div>

                {/* Details */}
                <div className="space-y-3">
                  {selectedItem.category && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Categoria:</span>
                      <Badge className="ml-2">{selectedItem.category.name}</Badge>
                    </div>
                  )}
                  
                  {selectedItem.description && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Descrição</h4>
                      <p className="text-gray-700">{selectedItem.description}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div>
                      <div className="flex items-baseline">
                        <span className="text-3xl font-bold text-purple-700">{selectedItem.price}</span>
                        <span className="text-gray-500 ml-2">pontos</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Estoque disponível: {selectedItem.stock}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <DialogClose asChild>
                    <Button variant="outline" className="flex-1">
                      Fechar
                    </Button>
                  </DialogClose>
                  <Button
                    onClick={(e) => {
                      addToCart(selectedItem, 1, e);
                      setDetailsOpen(false);
                    }}
                    disabled={selectedItem.stock === 0}
                    className="flex-1"
                    style={{ backgroundColor: branding?.primaryColor || '#9333ea' }}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Adicionar ao Carrinho
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Cart Dialog */}
      <Dialog open={cartOpen} onOpenChange={setCartOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center text-2xl">
              <ShoppingCart className="h-6 w-6 mr-2" />
              Carrinho de Compras
            </DialogTitle>
          </DialogHeader>
          
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Seu carrinho está vazio</p>
              <DialogClose asChild>
                <Button variant="outline" className="mt-4">
                  Continuar Comprando
                </Button>
              </DialogClose>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Cart Items */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {cart.map(item => (
                  <div key={item.id} className="flex gap-3 p-3 border rounded-lg">
                    <div className="h-20 w-20 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-gray-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{item.name}</h4>
                      <p className="text-sm text-purple-700 font-semibold">{item.price} pts</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFromCart(item.id)}
                          className="ml-auto text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-right font-semibold text-gray-900">
                      {item.price * item.quantity} pts
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold text-gray-900">Total:</span>
                  <span className="text-2xl font-bold text-purple-700">{getTotalPoints()} pontos</span>
                </div>
                <div className="flex gap-3">
                  <DialogClose asChild>
                    <Button variant="outline" className="flex-1">
                      Continuar Comprando
                    </Button>
                  </DialogClose>
                  <Button 
                    onClick={handleCheckout} 
                    className="flex-1"
                    style={{ backgroundColor: branding?.primaryColor || '#9333ea' }}
                  >
                    Finalizar Compra
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
