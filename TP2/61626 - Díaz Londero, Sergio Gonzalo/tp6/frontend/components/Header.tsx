'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { logout } from '@/api';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // Función para actualizar el estado de autenticación
    const updateAuthState = () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const user = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      
      setIsAuthenticated(!!token);
      
      if (user) {
        try {
          const userData = JSON.parse(user);
          setUserName(userData.nombre || userData.email?.split('@')[0] || 'Usuario');
        } catch {
          setUserName('Usuario');
        }
      } else {
        setUserName('');
      }
    };

    // Actualizar al montar y cuando cambie la ruta
    updateAuthState();

    // Escuchar cambios en localStorage (útil para sincronizar entre pestañas)
    window.addEventListener('storage', updateAuthState);

    // Intervalo para verificar cambios en localStorage
    const interval = setInterval(updateAuthState, 500);

    return () => {
      window.removeEventListener('storage', updateAuthState);
      clearInterval(interval);
    };
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      // Continuar con logout aunque falle el servidor
    } finally {
      // Siempre limpiar el localStorage y redirigir
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsAuthenticated(false);
      setUserName('');
      router.push('/productos');
    }
  };

  const handleIngresar = () => {
    router.push('/auth');
  };

  const handleCrearCuenta = () => {
    router.push('/auth?register=true');
  };

  // No mostrar header en la página de auth
  if (pathname === '/auth') {
    return null;
  }

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-6 py-4">
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/productos" className="font-bold text-xl">
            TP6 Shop
          </Link>
          
          {/* Enlaces de navegación */}
          <div className="flex items-center gap-8">
            <Link 
              href="/productos" 
              className={`text-sm ${pathname === '/productos' ? 'font-semibold' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Productos
            </Link>
            
            {isAuthenticated ? (
              <>
                {/* Usuario autenticado */}
                <Link 
                  href="/compras" 
                  className={`text-sm ${pathname === '/compras' ? 'font-semibold' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Mis compras
                </Link>
                
                <span className="text-sm text-muted-foreground">
                  {userName}
                </span>
                
                <button
                  onClick={handleLogout}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Salir
                </button>
              </>
            ) : (
              <>
                {/* Usuario NO autenticado */}
                <button
                  onClick={handleIngresar}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Ingresar
                </button>
                
                <button
                  onClick={handleCrearCuenta}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Crear cuenta
                </button>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
