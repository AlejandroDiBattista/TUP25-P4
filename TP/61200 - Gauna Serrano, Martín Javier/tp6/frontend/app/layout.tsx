// frontend/src/app/layout.tsx

import type { Metadata } from "next";
import "./globals.css"; // <-- IMPORTANTE: carga tailwind y tus estilos globales

export const metadata: Metadata = {
  title: "Frontend",
  description: "Proyecto TP6",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
