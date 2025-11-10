"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import { ArrowRightIcon, ChevronLeft, ChevronRight, Quote, Star } from "lucide-react"
import { useState, useEffect } from "react"

const testimonials = [
  {
    text: "A EmploYEAH revolucionou nossa cultura organizacional. O engajamento aumentou 85% e nossos colaboradores estão mais motivados do que nunca. A gamificação tornou o reconhecimento parte do dia a dia!",
    name: "Cooper, Kristin",
    company: "Bank of America",
    role: "Head de RH",
    avatar: "https://randomuser.me/api/portraits/women/1.jpg",
    rating: 5
  },
  {
    text: "Implementamos a plataforma há 6 meses e os resultados são impressionantes. A retenção de talentos melhorou significativamente e o ambiente de trabalho nunca foi tão positivo. Recomendo muito!",
    name: "Flores, Juanita",
    company: "McDonald's",
    role: "Gerente de Pessoas",
    avatar: "https://randomuser.me/api/portraits/women/2.jpg",
    rating: 5
  },
  {
    text: "O sistema de recompensas é fantástico! Nossos colaboradores adoram trocar pontos por experiências. A plataforma é intuitiva e o suporte é excepcional. Melhor investimento do ano!",
    name: "Nguyen, Shane",
    company: "The Walt Disney Company",
    role: "Diretor de Cultura",
    avatar: "https://randomuser.me/api/portraits/men/3.jpg",
    rating: 5
  },
  {
    text: "Transformou completamente como reconhecemos nossos times. O mural de elogios criou uma cultura de gratidão genuína. Os resultados de satisfação interna bateram recordes!",
    name: "Miles, Esther",
    company: "IBM",
    role: "VP de Recursos Humanos",
    avatar: "https://randomuser.me/api/portraits/women/4.jpg",
    rating: 5
  },
]

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying) return
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    setIsAutoPlaying(false)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
    setIsAutoPlaying(false)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
    setIsAutoPlaying(false)
  }

  return (
    <section id="partners" className="relative bg-gradient-to-br from-[#026876] to-[#03A0A] overflow-hidden">
      <div 
        className="absolute top-0 left-0 right-0 h-16 md:h-24 bg-white"
        style={{
          borderBottomLeftRadius: '50% 100%',
          borderBottomRightRadius: '50% 100%',
        }}
      ></div>

      <div 
        className="absolute bottom-0 left-0 right-0 h-16 md:h-24 bg-white"
        style={{
          borderTopLeftRadius: '50% 100%',
          borderTopRightRadius: '50% 100%',
        }}
      ></div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-24 md:py-32 lg:py-40 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
        <div className="inline-block bg-white rounded-full px-4 py-2">
            <h6 className="text-sm md:text-base lg:text-lg font-semibold text-[#FDCB48] uppercase tracking-wide mb-0">
                Venha para o mundo YEAH!
            </h6>
        </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 md:mb-6">
            Empresas que atuam conosco
          </h2>
          <p className="mx-auto max-w-3xl text-base md:text-lg lg:text-xl text-white/90 leading-relaxed">
            Relatos de colaboradores das mais diversas áreas e empresas sobre o uso da EmploYEAH!
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          <Card className="bg-white/95 backdrop-blur-sm border-none shadow-2xl rounded-3xl md:rounded-[2.5rem] overflow-hidden">
            <div className="relative min-h-[400px] md:min-h-[450px] lg:min-h-[500px]">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                    index === currentIndex
                      ? 'opacity-100 translate-x-0'
                      : index < currentIndex
                      ? 'opacity-0 -translate-x-full'
                      : 'opacity-0 translate-x-full'
                  }`}
                >
                  <div className="p-8 md:p-12 lg:p-16 h-full flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-6 md:mb-8">
                        <Quote className="w-12 h-12 md:w-16 md:h-16 text-[#FDCB48] opacity-20" />
                        <div className="flex gap-1">
                          {Array.from({ length: testimonial.rating }).map((_, i) => (
                            <Star key={i} className="w-5 h-5 md:w-6 md:h-6 fill-[#FDCB48] text-[#FDCB48]" />
                          ))}
                        </div>
                      </div>

                      <p className="text-lg md:text-xl lg:text-2xl text-gray-800 leading-relaxed mb-8 md:mb-10 italic font-light">
                        "{testimonial.text}"
                      </p>
                    </div>

                    <div className="flex items-center gap-4 md:gap-6">
                      <div className="relative">
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden ring-4 ring-[#f5ce6d] ring-offset-4">
                          <Image
                            src={testimonial.avatar}
                            alt={testimonial.name}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      <div>
                        <p className="text-lg md:text-xl font-bold text-gray-900">{testimonial.name}</p>
                        <p className="text-sm md:text-base text-[#FDCB48] font-semibold">{testimonial.role}</p>
                        <p className="text-sm md:text-base text-gray-600">{testimonial.company}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="flex items-center justify-center gap-4 md:gap-6 mt-8 md:mt-12">
            <button
              onClick={prevSlide}
              className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white hover:bg-white/90 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl group"
              aria-label="Depoimento anterior"
            >
              <ChevronLeft className="w-6 h-6 md:w-7 md:h-7 text-[#FDCB48] group-hover:scale-110 transition-transform" />
            </button>

            <div className="flex gap-2 md:gap-3">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`transition-all duration-300 rounded-full ${
                    index === currentIndex
                      ? "w-10 md:w-12 h-2.5 md:h-3 bg-[#FDCB48] shadow-lg"
                      : "w-2.5 md:w-3 h-2.5 md:h-3 bg-white/40 hover:bg-white/60"
                  }`}
                  aria-label={`Ir para depoimento ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={nextSlide}
              className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white hover:bg-white/90 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl group"
              aria-label="Próximo depoimento"
            >
              <ChevronRight className="w-6 h-6 md:w-7 md:h-7 text-[#FDCB48] group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>

        <div className="mt-12 md:mt-16 flex justify-center">
          <Button className="w-full sm:w-auto bg-white text-[#FDCB48] font-bold rounded-full hover:bg-gray-50 transition-all duration-300 shadow-xl hover:shadow-2xl px-8 md:px-10 py-4 md:py-5 text-base md:text-lg">
            <Link href="/request" className="flex items-center gap-3">
              Solicite um orçamento <ArrowRightIcon className="w-5 h-5 md:w-6 md:h-6" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
