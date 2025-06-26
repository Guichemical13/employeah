"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRightIcon, ChevronLeft, ChevronRight } from "lucide-react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

const testimonials = [
  {
    text: "Purus maecenas quis elit eu…",
    name: "Cooper, Kristin",
    company: "Bank of America",
  },
  {
    text: "Vehicula sit ut pharetra bibendum…",
    name: "Flores, Juanita",
    company: "McDonald’s",
  },
  {
    text: "Viverra lacus suspendisse elit…",
    name: "Nguyen, Shane",
    company: "The Walt Disney Company",
  },
  {
    text: "Hendrerit augue ut nisl egestas…",
    name: "Miles, Esther",
    company: "IBM",
  },
]

export function TestimonialsSection() {
  return (
    <section id="partners" className="bg-purple-900">
      <div className="mx-auto max-w-7xl px-4 py-20 text-left sm:px-6 lg:px-8">
        <h6 className="text-lg font-semibold text-yellow-400">
          Venha para o mundo YEAH!
        </h6>
        <h2 className="text-3xl font-bold text-white">Empresas que atuam conosco</h2>
        <p className="mt-4 max-w-2xl text-indigo-200">
          Relatos de colaboradores das mais diversas áreas e empresas sobre o uso da EmploYEAH!
        </p>

        {/* Carousel starts here */}
        <div className="mt-12">
          <Carousel className="w-full">
            <CarouselContent>
              {testimonials.map((t, idx) => (
                <CarouselItem
                  key={idx}
                  className="md:basis-1/2 lg:basis-1/4"
                >
                  <div className="rounded-lg bg-white p-6 shadow h-full">
                    <p className="text-gray-600">“{t.text}”</p>
                    <div className="mt-4">
                      <span className="block font-semibold text-gray-900">{t.name}</span>
                      <span className="block text-sm text-gray-500">{t.company}</span>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Navigation buttons */}
            <div className="hidden sm:flex justify-center items-center gap-4 mt-4">
              <CarouselPrevious className="bg-yellow-200 text-yellow-950 hover:bg-yellow-300" />
              <CarouselNext className="bg-yellow-200 text-yellow-950 hover:bg-yellow-300" />
            </div>
          </Carousel>
        </div>

        {/* Solicite um orçamento button */}
        <div className="mt-8 flex flex-col items-center">
          <Button className="bg-yellow-200 text-yellow-950 flex items-center gap-2 hover:bg-yellow-300 transition-colors">
            <Link href="/request" className="flex items-center gap-2">
              Solicite um orçamento <ArrowRightIcon />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
