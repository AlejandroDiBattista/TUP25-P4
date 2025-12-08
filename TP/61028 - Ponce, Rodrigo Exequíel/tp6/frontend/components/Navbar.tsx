// frontend/components/Navbar.tsx
"use client";

import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext'; // <-- Usamos @
import { Button } from '@/components/button';
import { ShoppingCart, User, LogOut, LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { isLoggedIn, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout(); // Borra el token del 'cerebro' y localStorage
    router.push('/'); // Vuelve a la home
    router.refresh(); // Refresca los datos del servidor
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo/Home Link */}
        <Link href="/" className="text-2xl font-bold text-blue-600">
          MiTienda
        </Link>

        {/* Links de Navegación */}
        <div className="flex items-center space-x-4">
          {/* Link al Carrito */}
          <Link href="/carrito">
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5" />
            </Button>
          </Link>

          {/* Lógica de Login/Logout */}
          {isLoggedIn ? (
            <>
            {/* Botón de Perfil -> Lleva a Mis Compras */}
                <Link href="/compras">
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
              {/* Botón de Logout */}
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <>
              {/* Botón de Login */}
              <Link href="/login">
                <Button variant="ghost">
                  <LogIn className="h-5 w-5 mr-2" />
                  Iniciar Sesión
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}