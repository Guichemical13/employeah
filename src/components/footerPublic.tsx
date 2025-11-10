import { FC } from "react"
import Image from "next/image"
import Link from "next/link"
import { Instagram, Linkedin, Mail, MapPin, Phone } from "lucide-react"

export function FooterPublic() {
    return (
        <footer className="relative w-full bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-800 overflow-hidden">
            {/* Letras gigantes no fundo - Y E A H */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
                <div className="text-[12rem] sm:text-[14rem] md:text-[18rem] lg:text-[22rem] xl:text-[26rem] font-black text-gray-400/8 select-none tracking-wider">
                    YEAH
                </div>
            </div>

            {/* Gradiente decorativo */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#03BBAF] rounded-full blur-3xl opacity-5"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#03A0A] rounded-full blur-3xl opacity-5"></div>

            {/* Conteúdo principal */}
            <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                    {/* Logo e descrição */}
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center">
                            <Image 
                                src="/logo.svg" 
                                alt="EmploYEAH Logo" 
                                width={160} 
                                height={160} 
                                className="w-32 md:w-40"
                            />
                        </div>
                        <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                            Recompense seu time com propósito e transforme o engajamento da sua empresa.
                        </p>
                        <div className="flex items-center gap-4">
                            <a 
                                href="https://instagram.com" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-[#026876]/10 hover:bg-[#03BBAF] hover:text-white text-[#026876] flex items-center justify-center transition-all duration-300 hover:scale-110"
                            >
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a 
                                href="https://linkedin.com" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-[#026876]/10 hover:bg-[#03BBAF] hover:text-white text-[#026876] flex items-center justify-center transition-all duration-300 hover:scale-110"
                            >
                                <Linkedin className="w-5 h-5" />
                            </a>
                            <a 
                                href="mailto:contato@employeah.com.br" 
                                className="w-10 h-10 rounded-full bg-[#026876]/10 hover:bg-[#03BBAF] hover:text-white text-[#026876] flex items-center justify-center transition-all duration-300 hover:scale-110"
                            >
                                <Mail className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Links rápidos */}
                    <div className="flex flex-col gap-4">
                        <h3 className="text-lg md:text-xl font-bold text-[#026876] mb-2">
                            Links Rápidos
                        </h3>
                        <Link 
                            href="/" 
                            className="text-gray-600 hover:text-[#03BBAF] transition-colors duration-300 text-sm md:text-base hover:translate-x-1 inline-block transform"
                        >
                            → Home
                        </Link>
                        <Link 
                            href="/recompensas" 
                            className="text-gray-600 hover:text-[#03BBAF] transition-colors duration-300 text-sm md:text-base hover:translate-x-1 inline-block transform"
                        >
                            → Recompensas
                        </Link>
                        <Link 
                            href="/solucoes" 
                            className="text-gray-600 hover:text-[#03BBAF] transition-colors duration-300 text-sm md:text-base hover:translate-x-1 inline-block transform"
                        >
                            → Soluções
                        </Link>
                        <Link 
                            href="/parceiros" 
                            className="text-gray-600 hover:text-[#03BBAF] transition-colors duration-300 text-sm md:text-base hover:translate-x-1 inline-block transform"
                        >
                            → Parceiros
                        </Link>
                        <Link 
                            href="/contato" 
                            className="text-gray-600 hover:text-[#03BBAF] transition-colors duration-300 text-sm md:text-base hover:translate-x-1 inline-block transform"
                        >
                            → Contato
                        </Link>
                    </div>

                    {/* Informações legais */}
                    <div className="flex flex-col gap-4">
                        <h3 className="text-lg md:text-xl font-bold text-[#026876] mb-2">
                            Legal
                        </h3>
                        <Link 
                            href="/terms" 
                            className="text-gray-600 hover:text-[#03BBAF] transition-colors duration-300 text-sm md:text-base hover:translate-x-1 inline-block transform"
                        >
                            → Termos de Uso
                        </Link>
                        <Link 
                            href="/privacy" 
                            className="text-gray-600 hover:text-[#03BBAF] transition-colors duration-300 text-sm md:text-base hover:translate-x-1 inline-block transform"
                        >
                            → Política de Privacidade
                        </Link>
                        <Link 
                            href="/support" 
                            className="text-gray-600 hover:text-[#03BBAF] transition-colors duration-300 text-sm md:text-base hover:translate-x-1 inline-block transform"
                        >
                            → Suporte
                        </Link>
                        <Link 
                            href="/cookies" 
                            className="text-gray-600 hover:text-[#03BBAF] transition-colors duration-300 text-sm md:text-base hover:translate-x-1 inline-block transform"
                        >
                            → Política de Cookies
                        </Link>
                    </div>

                    {/* Contato */}
                    <div className="flex flex-col gap-4">
                        <h3 className="text-lg md:text-xl font-bold text-[#026876] mb-2">
                            Contato
                        </h3>
                        <div className="flex items-start gap-3 text-gray-600 text-sm md:text-base">
                            <MapPin className="w-5 h-5 mt-1 flex-shrink-0 text-[#03BBAF]" />
                            <span>São Paulo, Brasil</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-600 text-sm md:text-base">
                            <Phone className="w-5 h-5 flex-shrink-0 text-[#03BBAF]" />
                            <a href="tel:+551100000000" className="hover:text-[#03BBAF] transition-colors">
                                +55 (11) 0000-0000
                            </a>
                        </div>
                        <div className="flex items-center gap-3 text-gray-600 text-sm md:text-base">
                            <Mail className="w-5 h-5 flex-shrink-0 text-[#03BBAF]" />
                            <a href="mailto:contato@employeah.com.br" className="hover:text-[#03BBAF] transition-colors">
                                contato@employeah.com.br
                            </a>
                        </div>
                    </div>
                </div>

                {/* Linha divisória */}
                <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-8 md:my-12"></div>

                {/* Copyright */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
                    <p>
                        © {new Date().getFullYear()} EmploYEAH. Todos os direitos reservados.
                    </p>
                    <p className="text-center md:text-right">
                        Desenvolvido com 💚 para transformar o engajamento empresarial
                    </p>
                </div>
            </div>

            {/* Linha de gradiente no topo */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#026876] via-[#03BBAF] to-[#03A0A]"></div>
        </footer>
    )
}