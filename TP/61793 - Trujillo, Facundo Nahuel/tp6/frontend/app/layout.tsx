import './globals.css'
import AuthProvider from './components/AuthProvider'
import ToastProvider from './components/ToastProvider'
import Header from './components/Header'
import CartProvider from './components/CartProvider'

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
              <ToastProvider>
                <Header />
                <main className="max-w-6xl mx-auto px-6 py-10">{children}</main>
              </ToastProvider>
            </CartProvider>
          </AuthProvider>
      </body>
    </html>
  )
}
