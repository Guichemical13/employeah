import { Button } from "@/components/ui/button"
import {
    Cake,
    Trophy,
    MapPlus,
    PiggyBankIcon
} from "lucide-react"
import Image from "next/image"

const services = [
    {
        icon: <Cake className="h-6 w-6" />,
        title: "Mural de Elogios",
        description: "Ser elogiado é muito bom, ainda mais de forma pública! Consolide todos os elogios em nossos murais e dê visibilidade à todos de como sua equipe é incrível!",
    },
    {
        icon: <Trophy className="h-6 w-6" />,
        title: "Brindes Corporativos",
        description: "Tem uma lojinha com produtos de sua marca? Coloque-os aqui e incentive seus funcionários a pegar aquele squeeze-térmico apenas contribuindo com a cultura.",
    },
    {
        icon: <MapPlus className="h-6 w-6" />,
        title: "Experiências",
        description: "Acabaram os squeezes? Que tal alguns jantares em restaurantes com os melhores ambientes? Ou até mesmo uma bateria de 25 minutos de Kart?",
    },
    {
        icon: <PiggyBankIcon className="h-6 w-6" />,
        title: "YEAH-2-CASH",
        description: "Ano novo, velhas dívidas e o 13º não deu conta? Que tal trocar seus YEAHs por um pix direto na sua conta?",
    },
]

export function ServicesSection() {
    return (
        <section id="services" className="bg-gray-50">
            <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8">
                <div className="z-0 flex">
                    <Image
                        src="/assets/servicesSection/phone.svg"
                        alt="Serviços personalizados"
                        className="z-20 -left-10"
                        width={400}
                        height={200}
                    />
                    <Image
                        src="/assets/servicesSection/back.svg"
                        alt="Barras decorativas"
                        className="absolute left-0"
                        width={600}
                        height={600}
                    />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Serviços Personalizados</h2>
                    <p className="mt-4 text-gray-600">
                        Todo colaborador é único, assim como toda empresa. Escolha dentre as mais variadas opções o que melhor encaixa no seu mundo.
                    </p>
                    <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
                        {services.map((s) => (
                            <div
                                key={s.title}
                                className="flex flex-col items-start rounded-lg bg-white p-6 shadow transition hover:shadow-md"
                            >
                                <div className="mb-4 text-indigo-600">{s.icon}</div>
                                <h3 className="text-xl font-semibold text-gray-900">{s.title}</h3>
                                <p className="mt-1 text-gray-600">{s.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
