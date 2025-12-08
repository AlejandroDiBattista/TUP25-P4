"use client"
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ShoppingBag, ShoppingCart, User, UserPlus, LogOut } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Header() {
  const { totalItems } = useCart()
  const router = useRouter()
  const [usuario, setUsuario] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const nombre = localStorage.getItem('nombre')
    if (token && nombre) {
      setUsuario(nombre)
    }
  }, [])

  const handleLogout = async () => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        await fetch('http://127.0.0.1:8000/cerrar-sesion', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        })
      } catch (e) {
        console.error('Error al cerrar sesión:', e)
      }
    }
    localStorage.removeItem('token')
    localStorage.removeItem('nombre')
    setUsuario(null)
    router.push('/')
    window.location.reload()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <ShoppingBag className="h-6 w-6 text-pink-600" />
            <span className="font-bold text-xl bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              TP6 Shop
            </span>
          </Link>
          
          <nav className="flex items-center space-x-2">
            <Button variant="ghost" asChild>
              <Link href="/">
                <ShoppingBag className="h-4 w-4" />
                Productos
              </Link>
            </Button>
            {usuario && (
              <Button variant="ghost" asChild>
                <Link href="/compras">Mis compras</Link>
              </Button>
            )}
            
            {/* Se removió el acceso directo al carrito en el header porque el carrito ya está visible en la página de inicio */}

            {usuario ? (
              <>
                <span className="text-sm font-medium text-gray-700 px-3">
                  ¡Hola, {usuario}!
                </span>
                <Button variant="ghost" onClick={handleLogout} className="hover:bg-pink-50">
                  <LogOut className="h-4 w-4" />
                  Salir
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild className="hover:bg-pink-50">
                  <Link href="/ingresar">
                    <User className="h-4 w-4" />
                    Ingresar
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/crear-cuenta">
                    <UserPlus className="h-4 w-4" />
                    Crear cuenta
                  </Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
