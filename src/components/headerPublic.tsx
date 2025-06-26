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
        <header className="w-full bg-purple-800/10 shadow absolute z-50">
            <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link href="/" className="flex items-center space-x-2">
                    <Image src="/logoFull.svg" alt="EmploYEAH!" width={160} height={140} />
                </Link>
                <nav className="hidden md:flex space-x-8 font-bold">
                    <Link href="/" className="text-gray-700 hover:text-indigo-600">Home</Link>
                    <Link href="#rewards" className="text-gray-700 hover:text-indigo-600">Recompensas</Link>
                    <Link href="#services" className="text-gray-700 hover:text-indigo-600">Soluções</Link>
                    <Link href="#partners" className="text-gray-700 hover:text-indigo-600">Parceiros</Link>
                    <Link href="#contact" className="text-gray-700 hover:text-indigo-600">Contato</Link>
                </nav>
                <div className="flex items-center space-x-4">
                    <Button variant="outline" className="hidden rounded-2xl md:inline-flex items-center gap-2 bg-blue-600 text-neutral-50 hover:bg-blue-700 transition-colors">
                        <Link href="/login" className="flex items-center gap-2">
                            Área Logada <UserLock className="text-yellow-200"/>
                        </Link>
                    </Button>
                    <Button className="hidden md:inline-flex items-center gap-2 rounded-2xl bg-yellow-200 text-yellow-950 hover:bg-yellow-300 transition-colors">
                        <Link href="/request" className="flex items-center gap-2">
                            Solicite um orçamento <ArrowRightIcon />
                        </Link>
                    </Button>
                    <Sheet>
                        <SheetTrigger asChild className="md:hidden">
                            <Button variant="ghost" size="icon">
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-64">
                            <SheetHeader>
                                <SheetTitle>Menu</SheetTitle>
                            </SheetHeader>
                            <ScrollArea className="h-[calc(100vh-5rem)] px-4">
                                <nav className="flex flex-col space-y-4 pt-4">
                                    <Link href="/">Home</Link>
                                    <Link href="#rewards">Recompensas</Link>
                                    <Link href="#services">Soluções</Link>
                                    <Link href="#partners">Parceiros</Link>
                                    <Link href="#contact">Contato</Link>
                                    <SheetClose asChild>
                                        <Button variant="outline" className="w-full bg-blue-600 text-neutral-50 flex items-center gap-2 hover:bg-blue-700 transition-colors">
                                            <Link href="/login" className="flex items-center gap-2 w-full h-full">
                                                Área Logada <UserLock className="text-yellow-200"/>
                                            </Link>
                                        </Button>
                                    </SheetClose>
                                    <SheetClose asChild>
                                        <Button className="w-full bg-yellow-200 text-yellow-950 flex items-center gap-2 hover:bg-yellow-300 transition-colors">
                                            <Link href="/request" className="flex items-center gap-2 w-full h-full">
                                                Solicite um orçamento <ArrowRightIcon />
                                            </Link>
                                        </Button>
                                    </SheetClose>
                                </nav>
                            </ScrollArea>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    )
}
