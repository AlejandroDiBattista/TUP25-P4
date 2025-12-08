// app/layout.tsx
import './globals.css'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import Header from './components/Header'

export const metadata = {
  title: 'TP6 Shop',
  description: 'Tienda Online - TP6 Programación 4',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-gray-50 text-gray-900">
        <AuthProvider>
          <CartProvider>
            <Header />
            <main className="mx-auto px-6 py-10">{children}</main>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}