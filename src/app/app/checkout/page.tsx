"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShoppingCart, MapPin, User, CreditCard, ArrowLeft, ImageIcon } from "lucide-react";
import type { Item } from "@/types/models";

interface CartItem extends Item {
  quantity: number;
  category?: { name: string };
}

interface AddressData {
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  
  // Dados pessoais
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  
  // Endereço
  const [address, setAddress] = useState<AddressData>({
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    localidade: "",
    uf: "",
  });

  useEffect(() => {
    // Carregar carrinho do localStorage
    const savedCart = localStorage.getItem('checkoutCart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    } else {
      // Se não houver carrinho, redirecionar de volta
      router.push('/app/rewards');
    }
    
    // Buscar dados do usuário
    fetchUserData();
  }, []);

  async function fetchUserData() {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const res = await fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.user) {
      setNome(data.user.name || "");
      setEmail(data.user.email || "");
      setUserPoints(data.user.points || 0);
    }
  }

  async function handleCepBlur() {
    const cleanCep = address.cep.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      setCepLoading(true);
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        const res = await fetch(`/api/cep/${cleanCep}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setAddress(prev => ({
            ...prev,
            cep: data.cep,
            logradouro: data.logradouro || "",
            bairro: data.bairro || "",
            localidade: data.localidade || "",
            uf: data.uf || "",
          }));
        } else {
          alert('CEP não encontrado');
        }
      } catch (error) {
        alert('Erro ao buscar CEP');
      }
      setCepLoading(false);
    }
  }

  function getTotalPoints() {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  async function handleFinalizePurchase() {
    // Validações
    if (!nome || !email || !telefone) {
      alert('Por favor, preencha todos os dados pessoais');
      return;
    }
    
    if (!address.cep || !address.logradouro || !address.numero || !address.bairro || !address.localidade || !address.uf) {
      alert('Por favor, preencha todos os dados de endereço');
      return;
    }
    
    const totalPoints = getTotalPoints();
    if (totalPoints > userPoints) {
      alert('Você não tem pontos suficientes para esta compra');
      return;
    }
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      
      // Enviar pedido
      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          items: cart.map(item => ({ id: item.id, quantity: item.quantity })),
          customerData: {
            nome,
            email,
            telefone,
          },
          shippingAddress: address,
        })
      });
      
      if (res.ok) {
        // Limpar carrinho
        localStorage.removeItem('checkoutCart');
        
        // Redirecionar para página de sucesso
        router.push('/app/order-success');
      } else {
        const error = await res.json();
        alert(error.message || 'Erro ao finalizar compra');
      }
    } catch (error) {
      alert('Erro ao finalizar compra');
    }
    
    setLoading(false);
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/app/rewards')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar à loja
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Finalizar Compra</h1>
          <p className="text-gray-600">Complete as informações para finalizar seu pedido</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dados Pessoais */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Dados Pessoais
                </CardTitle>
                <CardDescription>Informações do comprador</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome Completo *</Label>
                  <Input
                    id="nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Seu nome completo"
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                  />
                </div>
                <div>
                  <Label htmlFor="telefone">Telefone *</Label>
                  <Input
                    id="telefone"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Endereço de Entrega */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Endereço de Entrega
                </CardTitle>
                <CardDescription>Onde deseja receber seu pedido</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="cep">CEP *</Label>
                  <Input
                    id="cep"
                    value={address.cep}
                    onChange={(e) => setAddress(prev => ({ ...prev, cep: e.target.value }))}
                    onBlur={handleCepBlur}
                    placeholder="00000-000"
                    maxLength={9}
                  />
                  {cepLoading && <p className="text-sm text-gray-500 mt-1">Buscando CEP...</p>}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="logradouro">Logradouro *</Label>
                    <Input
                      id="logradouro"
                      value={address.logradouro}
                      onChange={(e) => setAddress(prev => ({ ...prev, logradouro: e.target.value }))}
                      placeholder="Rua, Avenida, etc."
                    />
                  </div>
                  <div>
                    <Label htmlFor="numero">Número *</Label>
                    <Input
                      id="numero"
                      value={address.numero}
                      onChange={(e) => setAddress(prev => ({ ...prev, numero: e.target.value }))}
                      placeholder="123"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="complemento">Complemento</Label>
                  <Input
                    id="complemento"
                    value={address.complemento}
                    onChange={(e) => setAddress(prev => ({ ...prev, complemento: e.target.value }))}
                    placeholder="Apto, Bloco, etc. (opcional)"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="bairro">Bairro *</Label>
                    <Input
                      id="bairro"
                      value={address.bairro}
                      onChange={(e) => setAddress(prev => ({ ...prev, bairro: e.target.value }))}
                      placeholder="Bairro"
                    />
                  </div>
                  <div>
                    <Label htmlFor="uf">UF *</Label>
                    <Input
                      id="uf"
                      value={address.uf}
                      onChange={(e) => setAddress(prev => ({ ...prev, uf: e.target.value }))}
                      placeholder="SP"
                      maxLength={2}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="localidade">Cidade *</Label>
                  <Input
                    id="localidade"
                    value={address.localidade}
                    onChange={(e) => setAddress(prev => ({ ...prev, localidade: e.target.value }))}
                    placeholder="Cidade"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Resumo do Pedido
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items List */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {cart.map(item => (
                    <div key={item.id} className="flex gap-3 pb-3 border-b">
                      <div className="h-16 w-16 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="h-6 w-6 text-gray-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-gray-900 truncate">{item.name}</h4>
                        <p className="text-xs text-gray-500">Qtd: {item.quantity}</p>
                        <p className="text-sm text-purple-700 font-semibold">{item.price * item.quantity} pts</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="pt-4 border-t space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Seus pontos:</span>
                    <span className="font-semibold">{userPoints} pts</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-purple-700">{getTotalPoints()} pts</span>
                  </div>
                  {getTotalPoints() > userPoints && (
                    <p className="text-sm text-red-500">Pontos insuficientes!</p>
                  )}
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Saldo após compra:</span>
                    <span className={getTotalPoints() > userPoints ? "text-red-500" : "text-green-600"}>
                      {userPoints - getTotalPoints()} pts
                    </span>
                  </div>
                </div>

                {/* Finalize Button */}
                <Button
                  onClick={handleFinalizePurchase}
                  disabled={loading || getTotalPoints() > userPoints}
                  className="w-full"
                  size="lg"
                >
                  <CreditCard className="h-5 w-5 mr-2" />
                  {loading ? 'Processando...' : 'Finalizar Compra'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
