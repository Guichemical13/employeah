import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetTrigger,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetClose,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowRightIcon, UserLock } from "lucide-react"

export function HeaderPublic() {
    return (
        <header className="w-full fixed top-0 z-50">
            <div className="w-full bg-gray-50 shadow-md">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
                    <div className="flex md:grid md:grid-cols-3 items-center justify-between gap-2 md:gap-4 py-2 sm:py-3">
                        <Link href="/" className="flex items-center justify-start flex-shrink-0">
                            <Image src="/logo.svg" alt="EmploYEAH!" width={100} height={100} className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 object-contain" />
                        </Link>

                        <nav className="hidden md:flex justify-center items-center text-sm font-medium gap-4 lg:gap-6 xl:gap-8">
                            <Link href="/" className="whitespace-nowrap hover:opacity-100 opacity-90 transition">Home</Link>
                            <Link href="#rewards" className="whitespace-nowrap hover:opacity-100 opacity-90 transition">Soluções</Link>
                            <Link href="#partners" className="whitespace-nowrap hover:opacity-100 opacity-90 transition">Parceiros</Link>
                            <Link href="#contact" className="whitespace-nowrap hover:opacity-100 opacity-90 transition">Contato</Link>
                        </nav>

                        <div className="flex items-center justify-end gap-2 md:gap-3 flex-shrink-0">
                            <div className="hidden md:flex items-center gap-2 lg:gap-3">
                                <Button variant="ghost" className="inline-flex items-center gap-1.5 rounded-full border-2 border-gray-200 hover:bg-gray-100 transition text-sm px-3 py-2 whitespace-nowrap">
                                    <Link href="/login" className="flex items-center gap-1.5">
                                        Entrar <UserLock className="w-4 h-4" />
                                    </Link>
                                </Button>

                                <Button className="inline-flex items-center gap-1.5 rounded-full bg-[#026876] text-white font-semibold hover:brightness-95 transition text-sm px-4 py-2 whitespace-nowrap">
                                    <Link href="/request" className="flex items-center gap-1.5">
                                        Solicite um orçamento <ArrowRightIcon className="w-4 h-4" />
                                    </Link>
                                </Button>
                            </div>

                            <div className="md:hidden flex-shrink-0">
                                <Sheet>
                                    <SheetTrigger asChild>
                                        <Button variant="ghost" size="icon" className="text-gray-800">
                                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                            </svg>
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent side="right" className="w-64">
                                        <SheetHeader>
                                            <SheetTitle>Menu</SheetTitle>
                                        </SheetHeader>
                                        <ScrollArea className="h-[calc(100vh-5rem)] px-4">
                                            <nav className="flex flex-col space-y-4 pt-4">
                                                <Link href="/" className="text-gray-900 font-medium text-base hover:text-gray-800">Home</Link>
                                                <Link href="#rewards" className="text-gray-900 font-medium text-base hover:text-gray-800">Recompensas</Link>
                                                <Link href="#services" className="text-gray-900 font-medium text-base hover:text-gray-800">Soluções</Link>
                                                <Link href="#partners" className="text-gray-900 font-medium text-base hover:text-gray-800">Parceiros</Link>
                                                <Link href="#contact" className="text-gray-900 font-medium text-base hover:text-gray-800">Contato</Link>

                                                <SheetClose asChild>
                                                    <Button variant="ghost" className="w-full flex items-center justify-center gap-2 rounded-full border-2 border-gray-200 hover:bg-gray-100 transition px-3 py-2">
                                                        <Link href="/login" className="flex items-center gap-2 w-full h-full justify-center">
                                                            Entrar <UserLock className="w-4 h-4" />
                                                        </Link>
                                                    </Button>
                                                </SheetClose>

                                                <SheetClose asChild>
                                                    <Button className="w-full flex items-center justify-center gap-2 rounded-full bg-[#026876] text-white font-semibold hover:brightness-95 transition px-3 py-2">
                                                        <Link href="/request" className="flex items-center gap-2 w-full h-full justify-center">
                                                            Solicite um orçamento <ArrowRightIcon className="w-4 h-4" />
                                                        </Link>
                                                    </Button>
                                                </SheetClose>
                                            </nav>
                                        </ScrollArea>
                                    </SheetContent>
                                </Sheet>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}

