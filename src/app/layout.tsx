import type { Metadata } from "next";
import { Anton, Inter } from "next/font/google";
import "./globals.css";
import { caso } from "@/lib/config";
import { Navbar } from "@/components/Navbar";
import { PiePagina } from "@/components/PiePagina";
import { Formas } from "@/components/Formas";

// Inter: textos de lectura
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Anton: títulos condensados gigantes, botones y etiquetas
const anton = Anton({
  variable: "--font-anton",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: caso.nombre,
  description: caso.descripcion,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Las variables de fuente van en <html> para que las use todo el CSS
    <html lang="es" className={`${inter.variable} ${anton.variable}`}>
      <body className="flex min-h-screen flex-col font-sans">
        <Formas />
        <Navbar />
        <main className="flex-1">{children}</main>
        <PiePagina />
      </body>
    </html>
  );
}
