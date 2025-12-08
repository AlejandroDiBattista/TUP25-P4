import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import { CarritoProvider } from "./context/CarritoContext";
import { ProductosProvider } from "./context/ProductosContext";
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
  title: "TP6 Shop - E-Commerce",
  description: "Tienda online desarrollada con Next.js y FastAPI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ProductosProvider>
            <CarritoProvider>
              {children}
              <Toaster richColors position="top-center" />
            </CarritoProvider>
          </ProductosProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
