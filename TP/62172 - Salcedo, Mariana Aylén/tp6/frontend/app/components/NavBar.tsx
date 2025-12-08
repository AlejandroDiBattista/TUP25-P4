'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';

/**
 * Componente de barra de navegación principal
 * Muestra logo, navegación, carrito y opciones de usuario
 */
export default function NavBar() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');
  const { totalItems } = useCart();

  // Verificar si hay usuario logueado
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const usuario = localStorage.getItem('usuario');
      
      if (token && usuario) {
        setIsAuthenticated(true);
        try {
          const userData = JSON.parse(usuario);
          setUserName(userData.nombre);
        } catch (error) {
          console.error('Error parsing usuario:', error);
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
        setUserName('');
      }
    };

    // Verificar al montar
    checkAuth();

    // Verificar periódicamente (cada segundo)
    const interval = setInterval(checkAuth, 1000);

    return () => clearInterval(interval);
  }, []);

  // Cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setIsAuthenticated(false);
    setUserName('');
    router.push('/');
    router.refresh();
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo y navegación principal */}
          <div className="flex items-center gap-8">
            <Link href="/products" className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">
                E-Commerce
              </span>
            </Link>
            
            {isAuthenticated && (
              <div className="hidden md:flex items-center gap-6">
                <Link 
                  href="/products" 
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                >
                  Productos
                </Link>
                <Link 
                  href="/purchases" 
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                >
                  Mis Compras
                </Link>
              </div>
            )}
          </div>

          {/* Acciones de usuario */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                {/* Carrito */}
                <Link href="/cart">
                  <Button variant="outline" size="icon" className="relative">
                    <ShoppingCart className="h-5 w-5" />
                    {totalItems > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                      >
                        {totalItems}
                      </Badge>
                    )}
                  </Button>
                </Link>

                {/* Nombre del usuario */}
                <span className="text-sm font-medium text-gray-700 hidden sm:block">
                  {userName}
                </span>

                {/* Cerrar sesión */}
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleLogout}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Salir</span>
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline">
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link href="/register">
                  <Button>
                    Registrarse
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
