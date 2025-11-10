import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { ArrowRightIcon, HandshakeIcon } from "lucide-react"

export function HeroSection() {
    return (
        <section className="relative bg-gradient-to-br from-gray-50 to-gray-100 pt-20 pb-12 md:pt-24 md:pb-16 lg:pt-28 lg:pb-20 rounded-b-4xl shadow-2xl shadow-[#0269762f] overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-10 right-0 w-64 h-64 md:w-96 md:h-96 lg:w-[500px] lg:h-[500px] bg-[#026876] rounded-full opacity-20 blur-3xl transform translate-x-1/3 -translate-y-1/4"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 md:w-72 md:h-72 lg:w-96 lg:h-96 bg-[#03BBAF] rounded-full opacity-20 blur-3xl transform -translate-x-1/4 translate-y-1/4"></div>
                <div className="absolute top-1/2 left-1/4 w-32 h-32 md:w-48 md:h-48 bg-[#03A0A] rounded-full opacity-15 blur-2xl"></div>
            </div>

            <div className="relative z-10 mx-auto flex flex-col-reverse items-center gap-8 md:gap-10 lg:gap-16 px-4 sm:px-6 lg:flex-row lg:px-8 max-w-7xl">
                <div className="lg:w-1/2 text-center lg:text-left">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-gray-900">
                        Recompense seu time com <span className="text-[#026876]">PROPÓSITO</span>
                    </h1>
                    <p className="mt-4 md:mt-6 text-base md:text-lg lg:text-xl text-gray-700 leading-relaxed">
                        Promova o engajamento cultural de suas equipes através das nossas soluções.
                    </p>
                    <Button className="mt-6 md:mt-8 w-full sm:w-auto bg-[#026876] rounded-full text-white font-semibold flex gap-2 hover:bg-[#03A0A] transition-all duration-300 shadow-lg hover:shadow-xl px-6 py-3 md:px-8 md:py-4 text-sm md:text-base">
                        <Link href="/request" className="flex items-center gap-2">
                           <HandshakeIcon className="w-4 h-4 md:w-5 md:h-5" /> Venha nos conhecer <ArrowRightIcon className="w-4 h-4 md:w-5 md:h-5" />
                        </Link>
                    </Button>
                    
                    <div className="mt-10 md:mt-12 lg:mt-16 bg-white/60 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-lg">
                        <p className="text-sm md:text-base text-gray-700 italic leading-relaxed">
                            "Foram anos muitos difíceis no desenvolvimento da cultura da nossa empresa, até que encontramos a EmploYEAH. Desde então, a gamificação facilitou a habituação dos nossos funcionários no engajamento constante, tornando nos referência em diversos índices de Melhores Lugares para Trabalhar"
                        </p>
                        <div className="mt-4 md:mt-6 flex items-center gap-3 md:gap-4 justify-center lg:justify-start">
                            <Image
                                src="https://randomuser.me/api/portraits/med/women/47.jpg"
                                width={56}
                                height={56}
                                alt="Avatar do depoente"
                                className="h-12 w-12 md:h-14 md:w-14 rounded-full ring-2 ring-[#03BBAF] ring-offset-2"
                            />
                            <div className="text-left">
                                <p className="font-bold text-gray-900 text-sm md:text-base">Jenny Wilson</p>
                                <p className="text-xs md:text-sm text-gray-600">Biffco Enterprises Ltd.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:w-1/2 relative flex justify-center items-center w-full">
                    <div className="relative w-full max-w-md lg:max-w-lg aspect-square">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#03BBAF] to-[#026876] rounded-[3rem] md:rounded-[4rem] transform rotate-6 opacity-30"></div>
                        <div className="absolute inset-4 bg-gradient-to-tr from-[#03A0A] to-[#03BBAF] rounded-[2.5rem] md:rounded-[3.5rem] transform -rotate-3 opacity-40"></div>
                        
                        <div className="relative z-10 flex items-center justify-center h-full p-6 md:p-8">
                            <Image
                                src="/assets/heroSection/Right.svg"
                                alt="Equipe colaborando"
                                width={400}
                                height={400}
                                className="w-full h-auto drop-shadow-2xl"
                            />
                        </div>

                        <div className="absolute -top-4 -right-4 md:-top-6 md:-right-6 w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 bg-[#026876] rounded-full flex items-center justify-center shadow-xl animate-pulse">
                            <span className="text-2xl md:text-3xl lg:text-4xl">🎯</span>
                        </div>

                        <div className="absolute -bottom-4 -left-4 md:-bottom-6 md:-left-6 w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 bg-gradient-to-br from-[#03BBAF] to-[#03A0A] rounded-full opacity-80 blur-sm"></div>
                        
                        <div className="absolute top-1/4 -left-8 w-12 h-12 md:w-16 md:h-16 bg-[#03A0A] rounded-full opacity-60"></div>
                    </div>
                </div>
            </div>
        </section>
    )
}