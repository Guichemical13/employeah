"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import { ArrowRightIcon, Cake, Trophy, MapPlus, PiggyBankIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"

const solutions = [
    {
        title: "Recompensas Gamificadas",
        subtitle: "Transforme engajamento em moedas",
        description: "Utilize uma plataforma gamificada e faça seus colaboradores receberem moedas por atitudes alinhadas à sua cultura e aos objetivos da empresa, que podem ser trocadas por prêmios exclusivos.",
        image: "/assets/rewardsSection/Rewards.svg",
        features: ["Sistema de pontos", "Catálogo de prêmios", "Gamificação completa"]
    },
    {
        title: "Mural de Elogios",
        subtitle: "Reconhecimento público e motivador",
        description: "Ser elogiado é muito bom, ainda mais de forma pública! Consolide todos os elogios em nossos murais e dê visibilidade à todos de como sua equipe é incrível!",
        icon: <Cake className="w-12 h-12 md:w-16 md:h-16" />,
        features: ["Reconhecimento público", "Feed de elogios", "Cultura de gratidão"]
    },
    {
        title: "Brindes Corporativos",
        subtitle: "Produtos exclusivos da sua marca",
        description: "Tem uma lojinha com produtos de sua marca? Coloque-os aqui e incentive seus funcionários a pegar aquele squeeze-térmico apenas contribuindo com a cultura.",
        icon: <Trophy className="w-12 h-12 md:w-16 md:h-16" />,
        features: ["Loja personalizada", "Gestão de estoque", "Branding reforçado"]
    },
    {
        title: "Experiências Exclusivas",
        subtitle: "Momentos inesquecíveis",
        description: "Acabaram os squeezes? Que tal alguns jantares em restaurantes com os melhores ambientes? Ou até mesmo uma bateria de 25 minutos de Kart?",
        icon: <MapPlus className="w-12 h-12 md:w-16 md:h-16" />,
        features: ["Restaurantes parceiros", "Atividades esportivas", "Eventos exclusivos"]
    },
    {
        title: "YEAH-2-CASH",
        subtitle: "Converta pontos em dinheiro",
        description: "Ano novo, velhas dívidas e o 13º não deu conta? Que tal trocar seus YEAHs por um pix direto na sua conta?",
        icon: <PiggyBankIcon className="w-12 h-12 md:w-16 md:h-16" />,
        features: ["Conversão em dinheiro", "Pix instantâneo", "Flexibilidade total"]
    }
]

export function RewardsSection() {
    const [currentSlide, setCurrentSlide] = useState(0)

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % solutions.length)
    }

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + solutions.length) % solutions.length)
    }

    const goToSlide = (index: number) => {
        setCurrentSlide(index)
    }

    const current = solutions[currentSlide]

    return (
        <section id="rewards" className="bg-white">
            <div className="mx-auto max-w-7xl px-4 py-16 md:py-24 lg:py-32 sm:px-6 lg:px-8">
                <div className="text-center mb-12 md:mb-16 lg:mb-20">
                    <h6 className="text-sm md:text-base lg:text-lg font-semibold text-[#026876] uppercase tracking-wide mb-3">
                        Para cada momento
                    </h6>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-4 md:mb-6">
                        Soluções Completas
                    </h2>
                    <p className="mx-auto max-w-3xl text-base md:text-lg lg:text-xl text-gray-600 leading-relaxed px-4">
                        Todo colaborador é único, assim como toda empresa. Escolha dentre as mais variadas opções o que melhor encaixa no seu mundo.
                    </p>
                </div>

                <div className="relative">
                    <Card className="bg-gray-50 border-none shadow-xl rounded-3xl md:rounded-[2.5rem] overflow-hidden">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                            <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center order-2 lg:order-1">
                                <div className="mb-6 md:mb-8">
                                    {current.icon && (
                                        <div className="w-16 h-16 md:w-20 md:h-20 bg-[#026876] rounded-2xl md:rounded-3xl flex items-center justify-center text-white mb-6">
                                            {current.icon}
                                        </div>
                                    )}
                                    <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 md:mb-3">
                                        {current.title}
                                    </h3>
                                    <p className="text-base md:text-lg lg:text-xl text-[#026876] font-semibold mb-4 md:mb-6">
                                        {current.subtitle}
                                    </p>
                                    <p className="text-sm md:text-base lg:text-lg text-gray-700 leading-relaxed">
                                        {current.description}
                                    </p>
                                </div>

                                <div className="space-y-3 md:space-y-4 mb-8 md:mb-10">
                                    {current.features.map((feature, idx) => (
                                        <div key={idx} className="flex items-center gap-3">
                                            <div className="w-6 h-6 md:w-7 md:h-7 bg-[#03BBAF] rounded-full flex items-center justify-center flex-shrink-0">
                                                <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <span className="text-sm md:text-base lg:text-lg text-gray-700 font-medium">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6">
                                    <Button className="w-full sm:w-auto bg-[#026876] rounded-full text-white font-semibold hover:bg-[#03A0A] transition-all duration-300 shadow-lg hover:shadow-xl px-6 md:px-8 py-3 md:py-4 text-sm md:text-base">
                                        <Link href="/request" className="flex items-center gap-2">
                                            Solicitar orçamento <ArrowRightIcon className="w-4 h-4 md:w-5 md:h-5" />
                                        </Link>
                                    </Button>
                                    
                                    <div className="flex items-center gap-3 md:gap-4">
                                        <button
                                            onClick={prevSlide}
                                            className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-gray-300 hover:border-[#026876] hover:bg-gray-100 transition-all duration-300 flex items-center justify-center group"
                                            aria-label="Anterior"
                                        >
                                            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-gray-600 group-hover:text-[#026876]" />
                                        </button>
                                        <button
                                            onClick={nextSlide}
                                            className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-gray-300 hover:border-[#026876] hover:bg-gray-100 transition-all duration-300 flex items-center justify-center group"
                                            aria-label="Próximo"
                                        >
                                            <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-gray-600 group-hover:text-[#026876]" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="relative bg-gradient-to-br from-gray-100 to-gray-50 p-8 md:p-12 lg:p-16 flex items-center justify-center order-1 lg:order-2 min-h-[300px] md:min-h-[400px] lg:min-h-[600px]">
                                {current.image ? (
                                    <div className="relative w-full h-full flex items-center justify-center">
                                        <Image
                                            src={current.image}
                                            alt={current.title}
                                            width={600}
                                            height={600}
                                            className="w-full max-w-md lg:max-w-lg h-auto object-contain drop-shadow-2xl"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-full max-w-sm aspect-square bg-gradient-to-br from-[#03BBAF]/20 to-[#026876]/20 rounded-[3rem] flex items-center justify-center">
                                        <div className="text-[#026876] scale-150">
                                            {current.icon}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>

                    <div className="flex justify-center gap-2 md:gap-3 mt-8 md:mt-12">
                        {solutions.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={`transition-all duration-300 rounded-full ${
                                    index === currentSlide
                                        ? "w-8 md:w-12 h-2 md:h-2.5 bg-[#026876]"
                                        : "w-2 md:w-2.5 h-2 md:h-2.5 bg-gray-300 hover:bg-gray-400"
                                }`}
                                aria-label={`Ir para slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>

                <div className="mt-16 md:mt-24 lg:mt-32 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                    <div className="text-center p-6 md:p-8">
                        <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#026876] mb-2 md:mb-3">500+</div>
                        <p className="text-sm md:text-base text-gray-600">Empresas atendidas</p>
                    </div>
                    <div className="text-center p-6 md:p-8">
                        <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#026876] mb-2 md:mb-3">50k+</div>
                        <p className="text-sm md:text-base text-gray-600">Colaboradores engajados</p>
                    </div>
                    <div className="text-center p-6 md:p-8">
                        <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#026876] mb-2 md:mb-3">1M+</div>
                        <p className="text-sm md:text-base text-gray-600">Elogios enviados</p>
                    </div>
                    <div className="text-center p-6 md:p-8">
                        <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#026876] mb-2 md:mb-3">98%</div>
                        <p className="text-sm md:text-base text-gray-600">Satisfação dos clientes</p>
                    </div>
                </div>
            </div>
        </section>
    )
}