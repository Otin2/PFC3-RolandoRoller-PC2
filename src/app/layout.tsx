import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { caso } from "@/lib/config";
import { Navbar } from "@/components/Navbar";
import { PiePagina } from "@/components/PiePagina";

// Inter: única fuente de la aplicación
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${caso.nombre} — ${caso.eslogan}`,
  description: caso.descripcion,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="flex min-h-screen flex-col font-sans">
        <Navbar />
        <main className="flex-1">{children}</main>
        <PiePagina />
      </body>
    </html>
  );
}
