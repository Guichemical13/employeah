import { FC } from "react"
import Image from "next/image"
import Link from "next/link"

export function FooterPublic() {
    return (
        <footer className="w-full border-t bg-white px-4 py-6">
            <div className="container mx-auto flex flex-col items-center justify-between gap-4 md:flex-row">
                <div className="flex items-center gap-2">
                    <Image src="/logoFull.svg" alt="Logo" width={124} height={124} />
                </div>
                <div className="text-sm text-gray-500 text-center">
                    © {new Date().getFullYear()} EmploYEAH! Todos os direitos reservados.
                </div>
                <div className="flex items-center gap-6 text-sm text-gray-600">
                    <Link href="/terms" className="hover:text-black">Termos</Link>
                    <Link href="/privacy" className="hover:text-black">Privacidade</Link>
                    <Link href="/support" className="hover:text-black">Suporte</Link>
                </div>
            </div>
        </footer>
    )
}