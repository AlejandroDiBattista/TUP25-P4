import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import { CartProvider } from "./context/CartContext";
import CartSidebar from "./components/CartSidebar";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TP6 Shop - E-Commerce",
  description: "Parcial de Programación 4",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="light">
      <body
        className={`${geistSans.variable} font-sans antialiased bg-gray-50`}
      >
        <CartProvider>
          <Toaster richColors position="top-center" />
          <Header />
          <CartSidebar />
          <main>{children}</main>
        </CartProvider>
      </body>
    </html>
  );
}