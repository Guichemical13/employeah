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
        <div className="flex min-h-screen w-screen items-stretch bg-gray-100">
            <div className="hidden md:flex md:w-1/2 bg-gradient-to-b from-purple-50 to-purple-white p-10 text-purple-800 items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="p-4 mb-4">
                        <Image src="/assets/login/balloon.svg" alt="Logo" width={500} height={500} />
                    </div>
                    <p className="text-center text-purple-800/80 text-md font-bold mb-8 max-w-xs">
                        A plataforma gamificada que transforma o engajamento dos colaboradores em resultados reais para sua empresa. 
                        Conecte-se, participe e conquiste recompensas exclusivas!
                    </p>
                </div>
            </div>
            <div className="w-full md:w-1/2 bg-white flex flex-col justify-center p-10">
                <div className="flex justify-center mb-6">
                    <Image src="/logoFull.svg" alt="Logo EmploYEAH!" width={248} height={248} />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Logue em sua conta EmploYEAH!</h1>
                {error && <div className="mb-4 text-red-600 text-center">{error}</div>}

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>E-mail</FormLabel>
                                    <FormControl>
                                        <Input placeholder="email@exemplo.com.br" {...field} />
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
                                    <FormLabel>Senha</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="***************" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="rememberMe"
                            render={({ field }) => (
                                <FormItem className="flex items-start space-x-2">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            onBlur={field.onBlur}
                                            name={field.name}
                                            ref={field.ref}
                                        />
                                    </FormControl>
                                    <FormLabel className="text-xs text-gray-500">
                                        Lembrar de mim
                                    </FormLabel>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex gap-4">
                            <Button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-800 text-white">
                                Entrar
                            </Button>
                        </div>
                        <div>
                            <Button type="button" className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800">
                                <Link href="/" className="flex items-center justify-center w-full h-full">
                                    Voltar
                                </Link>
                            </Button>
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
    );
}
