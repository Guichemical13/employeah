import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Image from "next/image"
import { Mail, Phone, MessageCircle, ArrowRight } from "lucide-react"

export function ContactSection() {
    return (
        <section id="contact" className="relative bg-white-50 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#03BBAF] rounded-full opacity-10 blur-3xl"></div>
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#026876] rounded-full opacity-10 blur-3xl"></div>
            </div>

            <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 md:py-24 lg:py-32 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-12 lg:gap-16 lg:grid-cols-2 items-center">
                    <div className="order-2 lg:order-1">
                        <div className="mb-6 md:mb-8">
                            <span className="inline-block px-4 py-2 bg-[#FDCB48]/10 text-[#026876] text-xs md:text-sm font-semibold rounded-full uppercase tracking-wide mb-4">
                                Contato
                            </span>
                            <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight mb-4 md:mb-6">
                                Solicite seu <span className="text-[#026876]">orçamento</span>
                            </h2>
                            <p className="text-base md:text-lg lg:text-xl text-gray-600 leading-relaxed">
                                Entre em contato e descubra como a EmploYEAH pode transformar a cultura da sua empresa através da gamificação e engajamento.
                            </p>
                        </div>

                        <div className="space-y-4 md:space-y-6 mb-8 md:mb-10">
                            <Card className="p-4 md:p-6 bg-white border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 md:w-14 md:h-14 bg-[#026876] rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Mail className="w-6 h-6 md:w-7 md:h-7 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-xs md:text-sm text-gray-500 font-medium">Email</p>
                                        <a href="mailto:contato@employeah.com.br" className="text-sm md:text-base lg:text-lg font-semibold text-gray-900 hover:text-[#026876] transition-colors">
                                            contato@employeah.com.br
                                        </a>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-4 md:p-6 bg-white border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 md:w-14 md:h-14 bg-[#03BBAF] rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Phone className="w-6 h-6 md:w-7 md:h-7 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-xs md:text-sm text-gray-500 font-medium">Telefone</p>
                                        <a href="tel:+551100000000" className="text-sm md:text-base lg:text-lg font-semibold text-gray-900 hover:text-[#03BBAF] transition-colors">
                                            (11) 0 0000-0000
                                        </a>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button className="w-full sm:w-auto bg-[#026876] hover:bg-[#03A0A] text-white font-bold rounded-full transition-all duration-300 shadow-xl hover:shadow-2xl px-6 md:px-8 py-4 md:py-5 text-sm md:text-base lg:text-lg group">
                                <a 
                                    href="/request" 
                                    className="flex items-center gap-3 justify-center"
                                >
                                    <Mail className="w-5 h-5 md:w-6 md:h-6" />
                                    Solicite um orçamento
                                    <ArrowRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" />
                                </a>
                            </Button>

                            <Button className="w-full ml-10 sm:w-auto bg-[#25D366] hover:bg-[#128C7E] text-white font-bold rounded-full transition-all duration-300 shadow-xl hover:shadow-2xl px-6 md:px-8 py-4 md:py-5 text-sm md:text-base lg:text-lg group">
                                <a 
                                    href="https://wa.me/551100000000" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 justify-center"
                                >
                                    <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />
                                    WhatsApp
                                    <ArrowRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" />
                                </a>
                            </Button>
                        </div>
                    </div>

                    <div className="relative order-1 lg:order-2 flex justify-center items-center">
                        <div className="relative w-full max-w-sm md:max-w-md lg:max-w-lg">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#03BBAF]/20 to-[#026876]/20 rounded-[3rem] md:rounded-[4rem] transform rotate-6 blur-xl"></div>
                            
                            <div className="relative z-10">
                                <Image
                                    src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=800&auto=format&fit=crop"
                                    alt="Mockup de celular"
                                    width={400}
                                    height={800}
                                    className="relative z-20 w-full h-auto drop-shadow-2xl rounded-3xl"
                                />
                                
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 bg-white/95 backdrop-blur-sm rounded-3xl p-4 md:p-6 shadow-2xl">
                                    <Image
                                        src="/logo.svg"
                                        alt="EmploYEAH Logo"
                                        width={120}
                                        height={120}
                                        className="w-20 h-20 md:w-28 md:h-28 lg:w-32 lg:h-32"
                                    />
                                </div>
                            </div>

                            <div className="absolute -bottom-12 md:-bottom-16 -right-8 md:-right-12 z-0 opacity-30">
                                <Image
                                    src="/assets/contactSection/bars.svg"
                                    alt="Barras decorativas"
                                    width={300}
                                    height={300}
                                    className="w-48 md:w-64 lg:w-80 h-auto"
                                />
                            </div>

                            <div className="absolute -top-8 -left-8 w-20 h-20 md:w-24 md:h-24 bg-[#03BBAF] rounded-full opacity-20 animate-pulse"></div>
                            <div className="absolute -bottom-8 -right-8 w-16 h-16 md:w-20 md:h-20 bg-[#026876] rounded-full opacity-20 animate-pulse delay-75"></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}