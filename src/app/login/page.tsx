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
import { ArrowLeft, Mail, Lock, KeyRound, CheckCircle2 } from "lucide-react";
import OtpInput from "react-otp-input";

const loginSchema = z.object({
    email: z.string().email({ message: "E-mail inválido" }),
    password: z.string().min(1, { message: "Senha obrigatória" }),
    rememberMe: z.boolean().optional(),
}).superRefine((data, ctx) => {
    // Validação de senha forte (exceto para super admin)
    if (data.email !== "superadmin@employeah.com.br") {
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

type ForgotPasswordStep = 'login' | 'email' | 'code' | 'password' | 'success';

export default function Login() {
    const router = useRouter();
    const [error, setError] = useState("");
    const [mustChangePassword, setMustChangePassword] = useState(false);
    const [userId, setUserId] = useState<number|null>(null);
    const [token, setToken] = useState("");
    const [step, setStep] = useState<ForgotPasswordStep>('login');
    const [resetEmail, setResetEmail] = useState("");
    const [resetCode, setResetCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [resetUserId, setResetUserId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    
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
                        } else if (data.user?.role === 'SUPERVISOR') {
                            window.location.href = "/app/supervisor";
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
            } else if (data.role === 'SUPERVISOR') {
                window.location.href = "/app/supervisor";
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

    async function handleForgotPassword() {
        setError("");
        setLoading(true);
        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: resetEmail }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Erro ao enviar código");
            
            setStep('code');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleVerifyCode() {
        setError("");
        setLoading(true);
        try {
            const res = await fetch("/api/auth/verify-reset-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: resetEmail, code: resetCode }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Código inválido");
            
            setResetUserId(data.userId);
            setStep('password');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleResetPassword() {
        setError("");
        
        if (newPassword !== confirmPassword) {
            setError("As senhas não coincidem");
            return;
        }

        if (newPassword.length < 8) {
            setError("Senha deve ter no mínimo 8 caracteres");
            return;
        }

        if (!/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
            setError("Senha deve conter ao menos uma letra maiúscula e um número");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: resetUserId, newPassword }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Erro ao redefinir senha");
            
            setStep('success');
            setTimeout(() => {
                setStep('login');
                setResetEmail("");
                setResetCode("");
                setNewPassword("");
                setConfirmPassword("");
                setResetUserId(null);
            }, 3000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    function renderContent() {
        if (step === 'email') {
            return (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-[#03BBAF]/10 rounded-full mb-4">
                            <Mail className="w-8 h-8 text-[#03BBAF]" />
                        </div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-[#026876] mb-2">
                            Recuperar Senha
                        </h1>
                        <p className="text-gray-500 text-sm lg:text-base">
                            Digite seu e-mail para receber o código de recuperação
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    )}

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                E-mail
                            </label>
                            <Input
                                type="email"
                                placeholder="seu@email.com.br"
                                value={resetEmail}
                                onChange={(e) => setResetEmail(e.target.value)}
                                className="h-12 border-gray-300 focus:border-[#03BBAF] focus:ring-[#03BBAF] text-base"
                            />
                        </div>

                        <div className="space-y-3 pt-2">
                            <Button
                                onClick={handleForgotPassword}
                                disabled={loading || !resetEmail}
                                className="w-full h-12 bg-gradient-to-r from-[#026876] to-[#03BBAF] hover:from-[#026876]/90 hover:to-[#03BBAF]/90 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                {loading ? "Enviando..." : "Enviar Código"}
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setStep('login')}
                                className="w-full h-12 border-2 border-gray-300 hover:border-[#026876] hover:bg-[#026876]/5 text-gray-700 font-semibold text-base transition-all duration-300"
                            >
                                Voltar ao Login
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        if (step === 'code') {
            return (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-[#03BBAF]/10 rounded-full mb-4">
                            <KeyRound className="w-8 h-8 text-[#03BBAF]" />
                        </div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-[#026876] mb-2">
                            Digite o Código
                        </h1>
                        <p className="text-gray-500 text-sm lg:text-base">
                            Enviamos um código de 6 dígitos para<br />
                            <span className="font-semibold text-[#026876]">{resetEmail}</span>
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    )}

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-4 text-center">
                                Código de Verificação
                            </label>
                            <div className="flex justify-center">
                                <OtpInput
                                    value={resetCode}
                                    onChange={setResetCode}
                                    numInputs={6}
                                    renderSeparator={<span className="mx-2"></span>}
                                    renderInput={(props) => (
                                        <input
                                            {...props}
                                            className="!w-12 !h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-[#03BBAF] focus:ring-2 focus:ring-[#03BBAF] focus:outline-none transition-all"
                                            style={{}}
                                        />
                                    )}
                                    inputType="tel"
                                />
                            </div>
                        </div>

                        <div className="space-y-3 pt-2">
                            <Button
                                onClick={handleVerifyCode}
                                disabled={loading || resetCode.length !== 6}
                                className="w-full h-12 bg-gradient-to-r from-[#026876] to-[#03BBAF] hover:from-[#026876]/90 hover:to-[#03BBAF]/90 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                {loading ? "Verificando..." : "Verificar Código"}
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setStep('email')}
                                className="w-full h-12 border-2 border-gray-300 hover:border-[#026876] hover:bg-[#026876]/5 text-gray-700 font-semibold text-base transition-all duration-300"
                            >
                                Voltar
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        if (step === 'password') {
            return (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-[#03BBAF]/10 rounded-full mb-4">
                            <Lock className="w-8 h-8 text-[#03BBAF]" />
                        </div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-[#026876] mb-2">
                            Nova Senha
                        </h1>
                        <p className="text-gray-500 text-sm lg:text-base">
                            Digite sua nova senha
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    )}

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Nova Senha
                            </label>
                            <Input
                                type="password"
                                placeholder="Mínimo 8 caracteres"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="h-12 border-gray-300 focus:border-[#03BBAF] focus:ring-[#03BBAF] text-base"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Deve conter ao menos uma letra maiúscula e um número
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Confirmar Senha
                            </label>
                            <Input
                                type="password"
                                placeholder="Digite novamente"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="h-12 border-gray-300 focus:border-[#03BBAF] focus:ring-[#03BBAF] text-base"
                            />
                        </div>

                        <div className="space-y-3 pt-2">
                            <Button
                                onClick={handleResetPassword}
                                disabled={loading || !newPassword || !confirmPassword}
                                className="w-full h-12 bg-gradient-to-r from-[#026876] to-[#03BBAF] hover:from-[#026876]/90 hover:to-[#03BBAF]/90 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                {loading ? "Redefinindo..." : "Redefinir Senha"}
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setStep('code')}
                                className="w-full h-12 border-2 border-gray-300 hover:border-[#026876] hover:bg-[#026876]/5 text-gray-700 font-semibold text-base transition-all duration-300"
                            >
                                Voltar
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        if (step === 'success') {
            return (
                <div className="animate-in fade-in zoom-in duration-500 text-center py-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                        <CheckCircle2 className="w-12 h-12 text-green-600" />
                    </div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-[#026876] mb-4">
                        Senha Redefinida!
                    </h1>
                    <p className="text-gray-600 text-base mb-6">
                        Sua senha foi alterada com sucesso.<br />
                        Redirecionando para o login...
                    </p>
                    <div className="w-12 h-12 border-4 border-[#03BBAF] border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
            );
        }

        // Login form (step === 'login')
        return (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
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
                                onClick={() => setStep('email')}
                            >
                                Esqueci minha senha
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
            </div>
        );
    }

    return (
        <div className="flex min-h-screen w-screen items-stretch bg-gradient-to-br from-gray-50 via-white to-gray-100">
            {/* Left Side - Decorative */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#026876]/5 via-[#03BBAF]/5 to-[#03A0A]/5 p-8 lg:p-12 items-center justify-center relative overflow-hidden">
                {/* Back Button - Always visible */}
                <Button
                    variant="ghost"
                    onClick={() => router.push("/")}
                    className="absolute top-6 left-6 text-gray-600 hover:text-[#026876] hover:bg-[#026876]/5 z-20"
                >
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Voltar ao início
                </Button>

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

            {/* Right Side - Login/Reset Form */}
            <div className="w-full lg:w-1/2 bg-white flex flex-col justify-center p-6 lg:p-12 relative">
                {/* Form Container */}
                <div className="max-w-md mx-auto w-full">
                    {renderContent()}
                    
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
