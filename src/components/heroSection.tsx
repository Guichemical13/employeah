import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { ArrowRightIcon } from "lucide-react"

export function HeroSection() {
    return (
        <section className="bg-gray-50 pt-16 lg:pt-0">
            <div className="mx-auto flex flex-col-reverse items-center gap-8 lg:gap-12 px-4 py-8 lg:py-14 sm:px-6 lg:flex-row lg:px-8 max-w-7xl justify-center">
                <div className="lg:w-1/2 text-center lg:text-left">
                    <h1 className="text-3xl lg:text-4xl xl:text-5xl font-extrabold leading-tight text-gray-900">
                        Recompense seu time com <span className="text-yellow-500">PROPÓSITO</span>
                    </h1>
                    <p className="my-4 text-base lg:text-lg text-gray-600">
                        Promova o engajamento cultural de suas equipes através das nossas soluções.
                    </p>
                    <Button className="w-full sm:w-fit bg-yellow-200 rounded-2xl text-yellow-950 flex gap-2 hover:bg-yellow-300 transition-colors justify-center">
                        <Link href="/request" className="flex items-center gap-2 w-fit h-full">
                            Solicite um orçamento <ArrowRightIcon />
                        </Link>
                    </Button>
                    <div className="mt-8 lg:mt-18">
                        <p className="text-sm lg:text-base text-gray-600 italic">
                            "Foram anos muitos difíceis no desenvolvimento da cultura da nossa empresa, até que encontramos a EmploYEAH. Desde então, a gamificação facilitou a habituação dos nossos funcionários no engajamento constante, tornando nos referência em diversos índices de Melhores Lugares para Trabalhar"
                        </p>
                        <div className="mt-4 flex items-center gap-4 justify-center lg:justify-start">
                            <Image
                                src="https://randomuser.me/api/portraits/med/women/47.jpg"
                                width={48}
                                height={48}
                                alt="Avatar do depoente"
                                className="h-12 w-12 rounded-full"
                            />
                            <div className="text-center lg:text-left">
                                <p className="font-semibold">Jenny Wilson</p>
                                <p className="text-sm text-gray-500">Biffco Enterprises Ltd.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="lg:w-1/2 relative flex justify-center items-center min-h-[250px] lg:min-h-[400px]">
                    <Image
                        src="/assets/heroSection/Vector 1.svg"
                        alt="Imagem de destaque da EmploYEAH"
                        width={600}
                        height={400}
                        className="absolute z-10 hidden lg:block lg:w-max lg:h-max"
                    />
                    <Image
                        src="/assets/heroSection/Right.svg"
                        alt="Imagem de destaque da EmploYEAH"
                        width={600}
                        height={400}
                        className="relative z-20 top-28 right-10 hidden lg:block lg:w-max lg:h-max"
                    />
                    <Image
                        src="/assets/heroSection/Ellipse 2.svg"
                        alt="Imagem de destaque da EmploYEAH"
                        width={60}
                        height={40}
                        className="absolute z-20 top-60 left-8/12 hidden lg:block lg:w-max lg:h-max"
                    />
                    {/* Imagem simplificada para mobile */}
                    <div className="lg:hidden flex items-center justify-center">
                        <div className="w-48 h-48 bg-gradient-to-br from-purple-200 to-yellow-200 rounded-full flex items-center justify-center">
                            <div className="text-6xl">🎯</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}