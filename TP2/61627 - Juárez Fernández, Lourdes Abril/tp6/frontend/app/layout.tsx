import './globals.css'
import { CartProvider } from './context/CartContext'
import Header from './components/Header'
import { Toaster } from '@/components/ui/sonner'

export const metadata = {
  title: 'TP6 Tienda',
  description: 'Tienda Online - TP6 Programación 4',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <CartProvider>
          <Header />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
        </CartProvider>
        <Toaster />
      </body>
    </html>
  )
}