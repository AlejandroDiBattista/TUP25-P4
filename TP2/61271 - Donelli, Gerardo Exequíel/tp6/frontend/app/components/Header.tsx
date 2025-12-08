'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { ShoppingCart, User, LogOut, Package } from 'lucide-react';

export default function Header() {
  const { usuario, estaAutenticado, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  return (
    <header className="border-b bg-card">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center">
              <ShoppingCart className="h-6 w-6 text-primary mr-2" />
              <span className="text-xl font-bold text-primary">
                E-Commerce
              </span>
            </Link>
            
            {estaAutenticado && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  <Package className="h-4 w-4 mr-1" />
                  Productos
                </Link>
                <Link
                  href="/compras"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  Mis Compras
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center">
            {estaAutenticado ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <User className="h-4 w-4 mr-2" />
                  <span className="font-medium">Hola, {usuario?.nombre}</span>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Cerrar sesión
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    Iniciar sesión
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm">
                    Registrarse
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
