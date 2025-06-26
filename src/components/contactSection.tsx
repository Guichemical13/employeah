import { Button } from "@/components/ui/button"
import Image from "next/image"

export function ContactSection() {
    return (
        <section id="contact" className="bg-gradient-to-b from-purple-100 to-white relative">
            <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8">
                <div>
                    <h1 className="text-1xl font-bold text-gray-900">CONTATO</h1>
                    <h2 className="mt-2 text-7xl font-bold text-gray-900">Solicite seu orçamento</h2>
                    <p className="mt-4 text-gray-600">
                        Entre em contato via Email (contato@employeah.com.br) ou diretamente com nossos especialistas no WhatsApp (11 0 0000-0000).
                    </p>
                    <Button className="mt-6">
                        <a href="https://wa.me/551100000000" target="_blank" rel="noopener noreferrer">Enviar mensagem</a>
                    </Button>
                </div>
                <div className="flex justify-center">
                    <Image
                        src="/assets/contactSection/phone.svg"
                        alt="Mockup de celular"
                        className="z-10"
                        width={256}
                        height={512}
                    />
                    <Image
                        src="/assets/contactSection/bars.svg"
                        alt="Barras"
                        className="absolute mt-72"
                        width={600}
                        height={600}
                    />
                </div>
            </div>
        </section>
    )
}