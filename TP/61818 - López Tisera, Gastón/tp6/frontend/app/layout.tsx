import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";
import { Providers } from "./providers";
import { SiteHeader } from "@/components/layout/SiteHeader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "TP6 - Comercio electrónico",
    template: "%s | TP6 - Comercio electrónico",
  },
  description:
    "Aplicación fullstack para el trabajo práctico 6: catálogo, carrito y compras.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-white text-slate-900 antialiased`}
      >
        <Providers>
          <SiteHeader />
          {children}
        </Providers>
      </body>
    </html>
  );
}
