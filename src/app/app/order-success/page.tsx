"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ShoppingCart, Home } from "lucide-react";

export default function OrderSuccessPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Pedido Realizado com Sucesso!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-gray-600">
            Seu pedido foi processado com sucesso! Os administradores e supervisores foram notificados 
            e em breve entrarão em contato para confirmar a entrega.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Próximos passos:</h4>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Aguarde o contato da equipe</li>
              <li>Confira seu e-mail para mais detalhes</li>
              <li>Seus pontos já foram debitados</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => router.push('/app/rewards')}
              className="flex-1"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Continuar Comprando
            </Button>
            <Button
              onClick={() => router.push('/app')}
              className="flex-1"
            >
              <Home className="h-4 w-4 mr-2" />
              Ir para Início
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
