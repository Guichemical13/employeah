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
  Star,
  ArrowLeft,
  Check
} from "lucide-react";

export default function RequestQuotePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  
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

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Simular envio do formulário
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const isStepValid = () => {
    switch(currentStep) {
      case 1:
        return formData.companyName.trim() !== "";
      case 2:
        return formData.contactName.trim() !== "" && formData.email.trim() !== "";
      case 3:
        return formData.features.length > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <HeaderPublic />
        <main className="pt-16">
          <div className="container mx-auto px-4 py-12 md:py-16">
            <div className="max-w-3xl mx-auto">
              {/* Success Icon & Message */}
              <div className="text-center mb-8 md:mb-12 animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl animate-bounce">
                  <CheckCircle className="w-12 h-12 md:w-14 md:h-14 text-white" />
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#026876] mb-4">
                  Solicitação Enviada com Sucesso!
                </h1>
                <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                  Recebemos sua solicitação e nossa equipe entrará em contato em até 24 horas úteis.
                </p>
              </div>

              {/* Next Steps Card */}
              <Card className="border-2 border-[#03BBAF]/20 shadow-xl mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <CardHeader className="bg-gradient-to-r from-[#026876]/5 to-[#03BBAF]/5">
                  <CardTitle className="flex items-center gap-3 text-xl md:text-2xl text-[#026876]">
                    <Clock className="w-6 h-6 md:w-7 md:h-7 text-[#03BBAF]" />
                    Próximos Passos
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-[#026876]/5 to-transparent">
                    <div className="w-10 h-10 bg-[#026876] text-white rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0">
                      1
                    </div>
                    <div>
                      <p className="font-semibold text-lg text-gray-900">Análise da Solicitação</p>
                      <p className="text-gray-600 mt-1">Nossa equipe especializada analisará suas necessidades em detalhes</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-[#03BBAF]/5 to-transparent">
                    <div className="w-10 h-10 bg-[#03BBAF] text-white rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0">
                      2
                    </div>
                    <div>
                      <p className="font-semibold text-lg text-gray-900">Contato Personalizado</p>
                      <p className="text-gray-600 mt-1">Entraremos em contato para agendar uma reunião e conhecer melhor seus desafios</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-[#03A0A]/5 to-transparent">
                    <div className="w-10 h-10 bg-[#03A0A] text-white rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0">
                      3
                    </div>
                    <div>
                      <p className="font-semibold text-lg text-gray-900">Proposta Customizada</p>
                      <p className="text-gray-600 mt-1">Apresentaremos uma solução sob medida com precificação transparente</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Info */}
              <Card className="border-2 border-gray-200 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <CardContent className="pt-6">
                  <p className="text-center text-gray-600 mb-4">
                    Alguma dúvida? Entre em contato conosco:
                  </p>
                  <div className="flex flex-wrap justify-center gap-4 text-sm">
                    <a href="mailto:contato@employeah.com.br" className="flex items-center gap-2 text-[#03BBAF] hover:text-[#026876] transition-colors">
                      <Mail className="w-4 h-4" />
                      contato@employeah.com.br
                    </a>
                    <a href="tel:+551100000000" className="flex items-center gap-2 text-[#03BBAF] hover:text-[#026876] transition-colors">
                      <Phone className="w-4 h-4" />
                      +55 (11) 0000-0000
                    </a>
                  </div>
                </CardContent>
              </Card>

              {/* Action Button */}
              <div className="text-center">
                <Button 
                  onClick={() => window.location.href = "/"} 
                  size="lg"
                  className="bg-gradient-to-r from-[#026876] to-[#03BBAF] hover:from-[#026876]/90 hover:to-[#03BBAF]/90 text-white px-8 h-12 shadow-lg hover:shadow-xl transition-all"
                >
                  <ArrowLeft className="mr-2 w-5 h-5" />
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <HeaderPublic />
      <main className="pt-16">
        {/* Hero Section com Progress Steps */}
        <section className="bg-gradient-to-br from-[#026876] via-[#03BBAF] to-[#03A0A] text-white py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {/* Título */}
              <div className="text-center mb-8 md:mb-12">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                  Solicite seu Orçamento
                </h1>
                <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
                  Em apenas 4 etapas, receba uma proposta personalizada em até 24 horas
                </p>
              </div>

              {/* Progress Bar */}
              <div className="flex items-center justify-between max-w-3xl mx-auto mb-6">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className="flex-1 flex items-center">
                    <div className="flex flex-col items-center w-full">
                      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-sm md:text-base transition-all duration-300 ${
                        step < currentStep 
                          ? 'bg-white text-[#026876]' 
                          : step === currentStep 
                          ? 'bg-white text-[#026876] ring-4 ring-white/30 scale-110' 
                          : 'bg-white/20 text-white/60'
                      }`}>
                        {step < currentStep ? <Check className="w-5 h-5 md:w-6 md:h-6" /> : step}
                      </div>
                      <span className={`text-xs md:text-sm mt-2 font-medium hidden md:block ${
                        step <= currentStep ? 'text-white' : 'text-white/60'
                      }`}>
                        {step === 1 ? 'Empresa' : step === 2 ? 'Contato' : step === 3 ? 'Soluções' : 'Detalhes'}
                      </span>
                    </div>
                    {step < 4 && (
                      <div className={`h-1 flex-1 mx-2 rounded transition-all duration-300 ${
                        step < currentStep ? 'bg-white' : 'bg-white/20'
                      }`} />
                    )}
                  </div>
                ))}
              </div>

              {/* Benefits */}
              <div className="flex flex-wrap justify-center gap-3 md:gap-4 text-xs md:text-sm">
                <Badge variant="secondary" className="bg-white/10 backdrop-blur-sm text-white border-white/20">
                  <CheckCircle className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                  Consultoria Gratuita
                </Badge>
                <Badge variant="secondary" className="bg-white/10 backdrop-blur-sm text-white border-white/20">
                  <CheckCircle className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                  Resposta em 24h
                </Badge>
                <Badge variant="secondary" className="bg-white/10 backdrop-blur-sm text-white border-white/20">
                  <CheckCircle className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                  Sem Compromisso
                </Badge>
              </div>
            </div>
          </div>
        </section>

        {/* Form Section */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <form onSubmit={(e) => e.preventDefault()}>
                {/* Step 1: Informações da Empresa */}
                {currentStep === 1 && (
                  <Card className="border-2 border-[#03BBAF]/20 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <CardHeader className="bg-gradient-to-r from-[#026876]/5 to-[#03BBAF]/5">
                      <CardTitle className="flex items-center gap-3 text-2xl">
                        <div className="w-12 h-12 bg-[#026876] rounded-full flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-[#026876]">Informações da Empresa</span>
                      </CardTitle>
                      <CardDescription className="text-base mt-2">
                        Primeiro, conte-nos um pouco sobre sua empresa
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="companyName" className="text-base font-semibold text-gray-700">
                          Nome da Empresa *
                        </Label>
                        <Input
                          id="companyName"
                          placeholder="Digite o nome da sua empresa"
                          value={formData.companyName}
                          onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                          className="h-12 text-base border-gray-300 focus:border-[#03BBAF] focus:ring-[#03BBAF]"
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="industry" className="text-base font-semibold text-gray-700">
                            Setor/Indústria
                          </Label>
                          <Select value={formData.industry} onValueChange={(value) => setFormData({...formData, industry: value})}>
                            <SelectTrigger className="h-12 border-gray-300 focus:border-[#03BBAF] focus:ring-[#03BBAF]">
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
                          <Label htmlFor="companySize" className="text-base font-semibold text-gray-700">
                            Tamanho da Empresa
                          </Label>
                          <Select value={formData.companySize} onValueChange={(value) => setFormData({...formData, companySize: value})}>
                            <SelectTrigger className="h-12 border-gray-300 focus:border-[#03BBAF] focus:ring-[#03BBAF]">
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
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="currentSolution" className="text-base font-semibold text-gray-700">
                          Solução Atual (Opcional)
                        </Label>
                        <Input
                          id="currentSolution"
                          placeholder="Qual ferramenta usam atualmente? Ex: Excel, outro sistema..."
                          value={formData.currentSolution}
                          onChange={(e) => setFormData({...formData, currentSolution: e.target.value})}
                          className="h-12 text-base border-gray-300 focus:border-[#03BBAF] focus:ring-[#03BBAF]"
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Step 2: Informações de Contato */}
                {currentStep === 2 && (
                  <Card className="border-2 border-[#03BBAF]/20 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <CardHeader className="bg-gradient-to-r from-[#026876]/5 to-[#03BBAF]/5">
                      <CardTitle className="flex items-center gap-3 text-2xl">
                        <div className="w-12 h-12 bg-[#03BBAF] rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-[#026876]">Informações de Contato</span>
                      </CardTitle>
                      <CardDescription className="text-base mt-2">
                        Como podemos entrar em contato com você?
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="contactName" className="text-base font-semibold text-gray-700">
                          Nome do Contato *
                        </Label>
                        <Input
                          id="contactName"
                          placeholder="Seu nome completo"
                          value={formData.contactName}
                          onChange={(e) => setFormData({...formData, contactName: e.target.value})}
                          className="h-12 text-base border-gray-300 focus:border-[#03BBAF] focus:ring-[#03BBAF]"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-base font-semibold text-gray-700">
                          E-mail Corporativo *
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="seu@empresa.com.br"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="h-12 text-base border-gray-300 focus:border-[#03BBAF] focus:ring-[#03BBAF]"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-base font-semibold text-gray-700">
                          Telefone (Opcional)
                        </Label>
                        <Input
                          id="phone"
                          placeholder="(11) 99999-9999"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="h-12 text-base border-gray-300 focus:border-[#03BBAF] focus:ring-[#03BBAF]"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Caso prefira, podemos ligar para alinhar os detalhes
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Step 3: Funcionalidades de Interesse */}
                {currentStep === 3 && (
                  <Card className="border-2 border-[#03BBAF]/20 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <CardHeader className="bg-gradient-to-r from-[#026876]/5 to-[#03BBAF]/5">
                      <CardTitle className="flex items-center gap-3 text-2xl">
                        <div className="w-12 h-12 bg-[#03A0A] rounded-full flex items-center justify-center">
                          <Zap className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-[#026876]">Soluções de Interesse</span>
                      </CardTitle>
                      <CardDescription className="text-base mt-2">
                        Selecione as funcionalidades que mais interessam sua empresa *
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {features.map((feature, index) => (
                          <div 
                            key={feature.id} 
                            className={`flex items-center space-x-3 p-4 border-2 rounded-xl transition-all duration-300 hover:scale-105 animate-in fade-in slide-in-from-bottom-2 ${
                              formData.features.includes(feature.id)
                                ? 'border-[#03BBAF] bg-[#03BBAF]/5 shadow-md'
                                : 'border-gray-200 hover:border-[#03BBAF]/50 hover:bg-gray-50'
                            }`}
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <Checkbox
                              id={feature.id}
                              checked={formData.features.includes(feature.id)}
                              onCheckedChange={(checked) => handleFeatureChange(feature.id, checked as boolean)}
                              className="data-[state=checked]:bg-[#03BBAF] data-[state=checked]:border-[#03BBAF]"
                            />
                            <feature.icon className={`w-6 h-6 ${
                              formData.features.includes(feature.id) ? 'text-[#03BBAF]' : 'text-gray-600'
                            }`} />
                            <Label htmlFor={feature.id} className="text-sm md:text-base font-medium cursor-pointer flex-1">
                              {feature.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                      {formData.features.length === 0 && (
                        <p className="text-sm text-red-500 mt-4 text-center">
                          Por favor, selecione pelo menos uma solução
                        </p>
                      )}
                      {formData.features.length > 0 && (
                        <p className="text-sm text-[#03BBAF] mt-4 text-center font-medium">
                          ✓ {formData.features.length} {formData.features.length === 1 ? 'solução selecionada' : 'soluções selecionadas'}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Step 4: Detalhes do Projeto */}
                {currentStep === 4 && (
                  <Card className="border-2 border-[#03BBAF]/20 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <CardHeader className="bg-gradient-to-r from-[#026876]/5 to-[#03BBAF]/5">
                      <CardTitle className="flex items-center gap-3 text-2xl">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#026876] to-[#03BBAF] rounded-full flex items-center justify-center">
                          <Trophy className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-[#026876]">Detalhes do Projeto</span>
                      </CardTitle>
                      <CardDescription className="text-base mt-2">
                        Por último, nos conte mais sobre suas necessidades
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="budget" className="text-base font-semibold text-gray-700">
                            Orçamento Estimado (Opcional)
                          </Label>
                          <Select value={formData.budget} onValueChange={(value) => setFormData({...formData, budget: value})}>
                            <SelectTrigger className="h-12 border-gray-300 focus:border-[#03BBAF] focus:ring-[#03BBAF]">
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
                          <Label htmlFor="timeline" className="text-base font-semibold text-gray-700">
                            Prazo Desejado (Opcional)
                          </Label>
                          <Select value={formData.timeline} onValueChange={(value) => setFormData({...formData, timeline: value})}>
                            <SelectTrigger className="h-12 border-gray-300 focus:border-[#03BBAF] focus:ring-[#03BBAF]">
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
                        <Label htmlFor="priority" className="text-base font-semibold text-gray-700">
                          Prioridade do Projeto (Opcional)
                        </Label>
                        <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value})}>
                          <SelectTrigger className="h-12 border-gray-300 focus:border-[#03BBAF] focus:ring-[#03BBAF]">
                            <SelectValue placeholder="Qual a urgência?" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high">🔴 Alta - Preciso implementar urgentemente</SelectItem>
                            <SelectItem value="medium">🟡 Média - Importante mas não urgente</SelectItem>
                            <SelectItem value="low">🟢 Baixa - Estou apenas pesquisando</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description" className="text-base font-semibold text-gray-700">
                          Descrição Adicional (Opcional)
                        </Label>
                        <Textarea
                          id="description"
                          placeholder="Conte-nos mais sobre seus desafios, objetivos e qualquer informação adicional que considera importante..."
                          rows={5}
                          value={formData.description}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({...formData, description: e.target.value})}
                          className="text-base border-gray-300 focus:border-[#03BBAF] focus:ring-[#03BBAF] resize-none"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Quanto mais detalhes você fornecer, melhor poderemos personalizar nossa proposta
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between gap-4 pt-6">
                  <Button 
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="flex-1 md:flex-none md:w-40 h-12 border-2 border-gray-300 hover:border-[#026876] hover:bg-[#026876]/5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowLeft className="mr-2 w-5 h-5" />
                    Voltar
                  </Button>

                  <div className="flex-1 text-center hidden md:block">
                    <p className="text-sm text-gray-500">
                      Etapa {currentStep} de {totalSteps}
                    </p>
                  </div>

                  {currentStep < totalSteps ? (
                    <Button 
                      type="button"
                      size="lg"
                      onClick={nextStep}
                      disabled={!isStepValid()}
                      className="flex-1 md:flex-none md:w-40 h-12 bg-gradient-to-r from-[#026876] to-[#03BBAF] hover:from-[#026876]/90 hover:to-[#03BBAF]/90 text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all"
                    >
                      Próximo
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  ) : (
                    <Button 
                      type="button"
                      size="lg"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="flex-1 md:flex-none md:w-48 h-12 bg-gradient-to-r from-[#026876] to-[#03BBAF] hover:from-[#026876]/90 hover:to-[#03BBAF]/90 text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Enviando...
                        </>
                      ) : (
                        <>
                          Enviar Solicitação
                          <CheckCircle className="ml-2 w-5 h-5" />
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {currentStep === totalSteps && (
                  <p className="text-sm text-gray-500 text-center mt-4">
                    Ao enviar, você concorda com nossos{" "}
                    <a href="/terms" className="text-[#03BBAF] hover:underline">termos de serviço</a>
                    {" "}e{" "}
                    <a href="/privacy" className="text-[#03BBAF] hover:underline">política de privacidade</a>
                  </p>
                )}
              </form>
            </div>
          </div>
        </section>
      </main>
      <FooterPublic />
    </div>
  );
}
