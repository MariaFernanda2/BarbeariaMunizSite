import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Footer from "./_components/footer";
import AuthProvider from "./_providers/auth";
import { Toaster } from "./_components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Barbearia Muniz",
  description: "Aplicação para agendamentos da barbearia",
  openGraph: {
    title: "Barbearia Muniz",
    description: "Agende seu horário na Barbearia Muniz ✂️",
    url: "https://www.barbeariamuniz.com.br",
    siteName: "Barbearia Muniz",
    images: [
      {
        url: "https://cl1ro7kgga.ufs.sh/f/vKcUisEYIxmgkAK8AG54z9SB3LdMP6CNOGeX78fyWu0KagEw",
        width: 1200,
        height: 630,
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
};