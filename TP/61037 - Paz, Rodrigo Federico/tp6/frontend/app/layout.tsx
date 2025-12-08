import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CarritoProvider } from "../context/CarritoContext";
import Navbar from "./components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"], // <-- IMPORTANTÍSIMO
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TP6 Shop",
  description: "Tienda online UTN - TP6",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
<html lang="es">
      <body className="bg-gray-50">
        <Navbar />
        <CarritoProvider>
          {children}
        </CarritoProvider>
      </body>
    </html>
  );
}
