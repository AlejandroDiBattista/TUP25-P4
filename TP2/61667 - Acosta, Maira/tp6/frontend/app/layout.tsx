import { AuthProvider } from './contexts/AuthProvider'
import { CartProvider } from './contexts/CartProvider'
import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'TP6 Shop',
  description: 'Tienda online con React y FastAPI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="bg-gray-50 min-h-screen">
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
