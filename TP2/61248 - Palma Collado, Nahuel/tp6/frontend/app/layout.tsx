import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Geist, Geist_Mono } from 'next/font/google';

import { AuthProvider } from './providers/AuthProvider';
import { CartProvider } from './providers/CartProvider';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
});

export const metadata: Metadata = {
  title: 'ShopNow E-Commerce',
  description: 'TP6 - Comercio electrónico con Next.js y FastAPI'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className="bg-slate-100">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-100`}>
        <AuthProvider>
          <CartProvider>{children}</CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
