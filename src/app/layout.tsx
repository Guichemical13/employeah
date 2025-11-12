import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EmploYEAH! - Plataforma de Engajamento",
  description: "Plataforma gamificada que transforma o engajamento dos colaboradores em resultados reais para sua empresa",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto:wght@400;500;700&family=Open+Sans:wght@400;600;700&family=Poppins:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.cdnfonts.com/css/sansation" rel="stylesheet" />
        <script src="https://t.contentsquare.net/uxa/edc1fa6f45ad9.js"></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased prevent-overflow`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
