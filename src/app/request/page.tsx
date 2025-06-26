"use client";

import { useState } from "react";
import { HeaderPublic } from "@/components/headerPublic";
import { FooterPublic } from "@/components/footerPublic";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Users, 
  Zap, 
  Trophy, 
  CheckCircle, 
  ArrowRight, 
  Mail, 
  Phone, 
  MapPin,
  Clock,
  Star
} from "lucide-react";

export default function RequestQuotePage() {
  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    companySize: "",
    industry: "",
    currentSolution: "",
    features: [] as string[],
    budget: "",
    timeline: "",
    description: "",
    priority: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const features = [
    { id: "rewards", label: "Sistema de Recompensas", icon: Trophy },
    { id: "recognition", label: "Reconhecimento de Funcionários", icon: Star },
    { id: "analytics", label: "Analytics e Relatórios", icon: Zap },
    { id: "integration", label: "Integração com RH", icon: Building2 },
    { id: "mobile", label: "App Mobile", icon: Phone },
    { id: "customization", label: "Customização Avançada", icon: CheckCircle },
  ];

  const handleFeatureChange = (featureId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      features: checked 
        ? [...prev.features, featureId]
        : prev.features.filter(f => f !== featureId)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simular envio do formulário
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <HeaderPublic />
        <main className="pt-16">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-2xl mx-auto text-center">
              <div className="mb-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Orçamento Solicitado com Sucesso!
                </h1>
                <p className="text-lg text-gray-600 mb-8">
                  Recebemos sua solicitação e nossa equipe entrará em contato em até 24 horas úteis.
                </p>
              </div>
              
              <Card className="text-left">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Próximos Passos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">1</div>
                    <div>
                      <p className="font-medium">Análise da Solicitação</p>
                      <p className="text-sm text-gray-600">Nossa equipe analisará suas necessidades</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">2</div>
                    <div>
                      <p className="font-medium">Contato Personalizado</p>
                      <p className="text-sm text-gray-600">Entraremos em contato para uma reunião</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">3</div>
                    <div>
                      <p className="font-medium">Proposta Customizada</p>
                      <p className="text-sm text-gray-600">Apresentaremos uma solução sob medida</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="mt-8">
                <Button onClick={() => window.location.href = "/"} className="bg-blue-600 hover:bg-blue-700">
                  Voltar ao Início
                </Button>
              </div>
            </div>
          </div>
        </main>
        <FooterPublic />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderPublic />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-purple-800 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Solicite seu Orçamento
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Transforme o engajamento da sua equipe com o EmploYEAH! 
              Receba uma proposta personalizada em até 24 horas.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Badge variant="secondary" className="bg-white/20 text-white">
                <CheckCircle className="w-4 h-4 mr-2" />
                Consultoria Gratuita
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white">
                <CheckCircle className="w-4 h-4 mr-2" />
                Resposta em 24h
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white">
                <CheckCircle className="w-4 h-4 mr-2" />
                Sem Compromisso
              </Badge>
            </div>
          </div>
        </section>

        {/* Form Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Informações da Empresa */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-blue-600" />
                      Informações da Empresa
                    </CardTitle>
                    <CardDescription>
                      Conte-nos sobre sua empresa e necessidades
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Nome da Empresa *</Label>
                      <Input
                        id="companyName"
                        placeholder="Digite o nome da sua empresa"
                        value={formData.companyName}
                        onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="industry">Setor/Indústria</Label>
                      <Select value={formData.industry} onValueChange={(value) => setFormData({...formData, industry: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o setor" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technology">Tecnologia</SelectItem>
                          <SelectItem value="healthcare">Saúde</SelectItem>
                          <SelectItem value="finance">Financeiro</SelectItem>
                          <SelectItem value="retail">Varejo</SelectItem>
                          <SelectItem value="manufacturing">Manufatura</SelectItem>
                          <SelectItem value="education">Educação</SelectItem>
                          <SelectItem value="other">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companySize">Tamanho da Empresa</Label>
                      <Select value={formData.companySize} onValueChange={(value) => setFormData({...formData, companySize: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Número de funcionários" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-10">1-10 funcionários</SelectItem>
                          <SelectItem value="11-50">11-50 funcionários</SelectItem>
                          <SelectItem value="51-200">51-200 funcionários</SelectItem>
                          <SelectItem value="201-1000">201-1000 funcionários</SelectItem>
                          <SelectItem value="1000+">Mais de 1000 funcionários</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currentSolution">Solução Atual</Label>
                      <Input
                        id="currentSolution"
                        placeholder="Qual ferramenta usam atualmente?"
                        value={formData.currentSolution}
                        onChange={(e) => setFormData({...formData, currentSolution: e.target.value})}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Contato */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-green-600" />
                      Informações de Contato
                    </CardTitle>
                    <CardDescription>
                      Como podemos entrar em contato com você?
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="contactName">Nome do Contato *</Label>
                      <Input
                        id="contactName"
                        placeholder="Seu nome completo"
                        value={formData.contactName}
                        onChange={(e) => setFormData({...formData, contactName: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        placeholder="(11) 99999-9999"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Funcionalidades */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-purple-600" />
                      Funcionalidades de Interesse
                    </CardTitle>
                    <CardDescription>
                      Selecione as funcionalidades que mais interessam sua empresa
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {features.map((feature) => (
                        <div key={feature.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                          <Checkbox
                            id={feature.id}
                            checked={formData.features.includes(feature.id)}
                            onCheckedChange={(checked) => handleFeatureChange(feature.id, checked as boolean)}
                          />
                          <feature.icon className="w-5 h-5 text-gray-600" />
                          <Label htmlFor={feature.id} className="text-sm font-medium cursor-pointer">
                            {feature.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Detalhes do Projeto */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-600" />
                      Detalhes do Projeto
                    </CardTitle>
                    <CardDescription>
                      Informações adicionais sobre suas necessidades
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="budget">Orçamento Estimado</Label>
                        <Select value={formData.budget} onValueChange={(value) => setFormData({...formData, budget: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Faixa de investimento" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5k-15k">R$ 5.000 - R$ 15.000</SelectItem>
                            <SelectItem value="15k-30k">R$ 15.000 - R$ 30.000</SelectItem>
                            <SelectItem value="30k-50k">R$ 30.000 - R$ 50.000</SelectItem>
                            <SelectItem value="50k+">Acima de R$ 50.000</SelectItem>
                            <SelectItem value="not-defined">Ainda não definido</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="timeline">Prazo Desejado</Label>
                        <Select value={formData.timeline} onValueChange={(value) => setFormData({...formData, timeline: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Quando precisa implementar?" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="asap">O mais rápido possível</SelectItem>
                            <SelectItem value="1-3months">1-3 meses</SelectItem>
                            <SelectItem value="3-6months">3-6 meses</SelectItem>
                            <SelectItem value="6months+">Mais de 6 meses</SelectItem>
                            <SelectItem value="flexible">Flexível</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priority">Prioridade do Projeto</Label>
                      <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Qual a urgência?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">Alta - Preciso implementar urgentemente</SelectItem>
                          <SelectItem value="medium">Média - Importante mas não urgente</SelectItem>
                          <SelectItem value="low">Baixa - Estou apenas pesquisando</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Descrição Adicional</Label>
                      <Textarea
                        id="description"
                        placeholder="Conte-nos mais sobre seus desafios, objetivos e qualquer informação adicional que considera importante..."
                        rows={4}
                        value={formData.description}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({...formData, description: e.target.value})}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Submit Button */}
                <div className="text-center">
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Enviando...
                      </>
                    ) : (
                      <>
                        Solicitar Orçamento
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </>
                    )}
                  </Button>
                  <p className="text-sm text-gray-600 mt-4">
                    Ao enviar, você concorda com nossos termos de serviço e política de privacidade.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="bg-white py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Por que escolher o EmploYEAH!?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Mais de 1000 empresas já transformaram sua cultura organizacional com nossas soluções
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Engajamento Real</h3>
                <p className="text-gray-600">
                  Aumente em até 40% o engajamento dos seus funcionários com nosso sistema de recompensas
                </p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Implementação Rápida</h3>
                <p className="text-gray-600">
                  Sistema pronto para uso em até 48 horas, com suporte completo durante todo o processo
                </p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Suporte Dedicado</h3>
                <p className="text-gray-600">
                  Equipe especializada para garantir o sucesso da implementação na sua empresa
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <FooterPublic />
    </div>
  );
}
