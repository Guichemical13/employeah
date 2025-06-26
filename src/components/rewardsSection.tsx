import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { ArrowRightIcon } from "lucide-react"

export function RewardsSection() {
    return (
        <section id="rewards" className="bg-neutral-50">
            <div className="mx-auto max-w-7xl px-4 py-20 text-center items-center sm:px-6 lg:px-8">
                <h6 className="text-lg font-semibold text-yellow-400">
                    Aproveite nossas
                </h6>
                <h2 className="text-6xl font-bold text-gray-900">
                    Recompensas
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-gray-600">
                    Utilize uma plataforma gamificada e faça seus colaboradores receberem moedas por atitudes alinhadas à sua cultura e aos objetivos da empresa, que podem ser trocadas por prêmios exclusivos.
                </p>
                <div className="mt-12 relative flex justify-center items-center">
                    {/* Decoração esquerda */}
                    <div className="hidden md:block absolute -left-[21.3rem] top-1/10 -translate-y-1/4">
                        <Image
                            src="/assets/rewardsSection/leftCircle.svg"
                            alt="Ellipse 14"
                            width={420}
                            height={220}
                            className="z-0"
                        />
                        <Image
                            src="/assets/rewardsSection/Ellipse 16.svg"
                            alt="Ellipse 16"
                            width={180}
                            height={180}
                            className="absolute z-0 top-1/3 left-1/3 -translate-y-1/2"
                        />
                        <Image
                            src="/assets/rewardsSection/Ellipse 17.svg"
                            alt="Ellipse 17"
                            width={120}
                            height={120}
                            className="absolute bottom-1/3 -right-20 z-20"
                        />
                    </div>
                    {/* Decoração direita */}
                    <div className="hidden md:block absolute -right-[21.3rem] bottom-0">
                        <Image
                            src="/assets/rewardsSection/rightCircle.svg"
                            alt="Ellipse 15"
                            width={460}
                            height={260}
                            className="z-0"
                        />
                        <Image
                            src="/assets/rewardsSection/Ellipse 18.svg"
                            alt="Ellipse 18"
                            width={180}
                            height={180}
                            className="absolute top-1/4 left-1/10 bottom-0 right-0 z-0"
                        />
                        <Image
                            src="/assets/rewardsSection/Ellipse 19.svg"
                            alt="Ellipse 19"
                            width={100}
                            height={100}
                            className="absolute bottom-10 -left-6 z-20"
                        />
                    </div>
                    {/* Imagem principal */}
                    <Image
                        src="/assets/rewardsSection/Rewards.svg"
                        alt="Preview de recompensas"
                        className="mx-auto relative z-10"
                        width={1000}
                        height={800}
                    />
                </div>
                <Button className="w-fit my-4 bg-yellow-200 rounded-2xl text-yellow-950 flex mx-auto items-center gap-2 hover:bg-yellow-300 transition-colors">
                    <Link href="/request" className="flex items-center gap-2 w-fit h-full">
                        Solicite um orçamento <ArrowRightIcon />
                    </Link>
                </Button>
            </div>
        </section>
    )
}