"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ForcePasswordChangeModal from "@/components/ForcePasswordChangeModal";

const loginSchema = z.object({
    email: z.string().email({ message: "E-mail inválido" }),
    password: z.string(),
    rememberMe: z.boolean().optional(),
}).superRefine((data, ctx) => {
    if (data.email === "superadmin@employeah.com") {
        if (data.password !== "superadmin") {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Senha do superadmin incorreta",
                path: ["password"],
            });
        }
    } else {
        if (data.password.length < 8) {
            ctx.addIssue({
                code: z.ZodIssueCode.too_small,
                minimum: 8,
                type: "string",
                inclusive: true,
                message: "Senha mínima de 8 caracteres",
                path: ["password"],
            });
        }
        if (!/[A-Z]/.test(data.password) || !/[0-9]/.test(data.password)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "A senha deve conter ao menos uma letra maiúscula e um número",
                path: ["password"],
            });
        }
    }
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
    const router = useRouter();
    const [error, setError] = useState("");
    const [mustChangePassword, setMustChangePassword] = useState(false);
    const [userId, setUserId] = useState<number|null>(null);
    const [token, setToken] = useState("");
    const form = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "", rememberMe: false },
    });

    useEffect(() => {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        if (token) {
            fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
                .then(async res => {
                    if (res.ok) {
                        const data = await res.json();
                        if (data.user?.role === 'SUPER_ADMIN' || data.user?.role === 'COMPANY_ADMIN') {
                            window.location.href = "/app/admin";
                        } else {
                            window.location.href = "/app";
                        }
                    }
                });
        }
    }, []);

    async function onSubmit(values: LoginForm) {
        setError("");
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: values.email, password: values.password }),
            });
            const data = await res.json();
            console.log("[login] resposta da API:", data);
            if (!res.ok) throw new Error(data.error || "Erro ao logar");
            if (!data.token) throw new Error("Token não retornado pela API");
            if (values.rememberMe) {
                localStorage.setItem("token", data.token);
                setToken(data.token);
                console.log("[login] token salvo no localStorage:", data.token);
            } else {
                sessionStorage.setItem("token", data.token);
                setToken(data.token);
                console.log("[login] token salvo no sessionStorage:", data.token);
            }
            // Se mustChangePassword vier true, use o userId retornado
            if (data.mustChangePassword) {
                setUserId(data.userId);
                setMustChangePassword(true);
                setToken(data.token);
                return;
            }
            // Redireciona imediatamente
            if (data.role === 'SUPER_ADMIN' || data.role === 'COMPANY_ADMIN') {
                window.location.href = "/app/admin";
            } else {
                window.location.href = "/app";
            }
        } catch (err: any) {
            setError(err.message);
            console.error("[login] erro:", err);
        }
    }

    function handlePasswordChanged() {
        setMustChangePassword(false);
        setUserId(null);
        setToken("");
        window.location.reload();
    }

    return (
        <div className="flex min-h-screen w-screen items-stretch bg-gradient-to-br from-gray-50 via-white to-gray-100">
            {/* Left Side - Decorative */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#026876]/5 via-[#03BBAF]/5 to-[#03A0A]/5 p-8 lg:p-12 items-center justify-center relative overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute top-20 left-20 w-64 h-64 bg-[#03BBAF]/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-20 w-80 h-80 bg-[#026876]/10 rounded-full blur-3xl"></div>
                
                <div className="relative z-10 flex flex-col items-center max-w-lg">
                    {/* Logo Grande */}
                    <div className="mb-12 animate-in fade-in zoom-in duration-700">
                        <Image 
                            src="/logo.svg" 
                            alt="Logo EmploYEAH!" 
                            width={300} 
                            height={300} 
                            className="w-56 h-56 lg:w-80 lg:h-80 drop-shadow-2xl" 
                        />
                    </div>
                    
                    <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        <h2 className="text-2xl lg:text-3xl font-bold text-[#026876]">
                            Bem-vindo de volta! 👋
                        </h2>
                        <p className="text-gray-600 text-sm lg:text-base leading-relaxed max-w-md">
                            A plataforma gamificada que transforma o engajamento dos colaboradores em resultados reais. 
                            Conecte-se, participe e conquiste recompensas exclusivas!
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 bg-white flex flex-col justify-center p-6 lg:p-12 relative">
                {/* Form Container */}
                <div className="max-w-md mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {/* Title Section */}
                    <div className="text-center mb-8">
                        <h1 className="text-2xl lg:text-3xl font-bold text-[#026876] mb-2">
                            Acesse sua conta
                        </h1>
                        <p className="text-gray-500 text-sm lg:text-base">
                            Entre com suas credenciais para continuar
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300">
                            <p className="text-red-700 text-sm lg:text-base font-medium">{error}</p>
                        </div>
                    )}

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-semibold text-gray-700">
                                            E-mail
                                        </FormLabel>
                                        <FormControl>
                                            <Input 
                                                placeholder="seu@email.com.br" 
                                                {...field} 
                                                className="h-12 border-gray-300 focus:border-[#03BBAF] focus:ring-[#03BBAF] text-base"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-semibold text-gray-700">
                                            Senha
                                        </FormLabel>
                                        <FormControl>
                                            <Input 
                                                type="password" 
                                                placeholder="Digite sua senha" 
                                                {...field} 
                                                className="h-12 border-gray-300 focus:border-[#03BBAF] focus:ring-[#03BBAF] text-base"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="rememberMe"
                                render={({ field }) => (
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                onBlur={field.onBlur}
                                                name={field.name}
                                                ref={field.ref}
                                                className="data-[state=checked]:bg-[#03BBAF] data-[state=checked]:border-[#03BBAF]"
                                            />
                                        </FormControl>
                                        <FormLabel className="text-sm text-gray-600 cursor-pointer font-normal">
                                            Lembrar de mim
                                        </FormLabel>
                                    </FormItem>
                                )}
                            />

                            <div className="space-y-3 pt-2">
                                <Button 
                                    type="submit" 
                                    className="w-full h-12 bg-gradient-to-r from-[#026876] to-[#03BBAF] hover:from-[#026876]/90 hover:to-[#03BBAF]/90 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                    Entrar
                                </Button>
                                
                                <Button 
                                    type="button" 
                                    variant="outline"
                                    className="w-full h-12 border-2 border-gray-300 hover:border-[#026876] hover:bg-[#026876]/5 text-gray-700 font-semibold text-base transition-all duration-300"
                                    onClick={() => router.push("/")}
                                >
                                    Voltar ao Início
                                </Button>
                            </div>

                            <div className="text-center pt-4">
                                <p className="text-sm text-gray-500">
                                    Não tem uma conta?{" "}
                                    <a href="/request" className="text-[#03BBAF] hover:text-[#026876] font-semibold hover:underline transition-colors">
                                        Solicite um orçamento
                                    </a>
                                </p>
                            </div>
                        </form>
                    </Form>
                    
                    {mustChangePassword && userId && (
                        <ForcePasswordChangeModal
                            open={mustChangePassword}
                            onPasswordChanged={handlePasswordChanged}
                            userId={userId}
                            token={token}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
