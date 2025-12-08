import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import { CarritoProvider } from "./context/CarritoContext";
import ToastProvider from "./components/ToastProvider";
export const metadata: Metadata = {
  title: "E-Commerce",
  description: "Tienda online",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <CarritoProvider>
            <ToastProvider />
            {children}
          </CarritoProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
