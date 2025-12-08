'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useCarrito } from '../hooks/useCarrito';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ShoppingCart, User, LogOut, Package } from 'lucide-react';
import { toast } from 'sonner';

interface HeaderProps {
  onCartToggle?: () => void;
}

export function Header({ onCartToggle }: HeaderProps) {
  const { usuario, isAuthenticated, logout } = useAuth();
  const { cantidadTotal } = useCarrito();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Sesión cerrada correctamente');
      router.push('/');
    } catch (error) {
      toast.error('Error al cerrar sesión');
    }
  };

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-gray-700">
            TP6 Shop
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-6">
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              Productos
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  href="/compras"
                  className="text-gray-600 hover:text-gray-900 font-medium flex items-center gap-2"
                >
                  <Package className="h-4 w-4" />
                  Mis compras
                </Link>

                {/* Cart Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  onClick={onCartToggle}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cantidadTotal > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                    >
                      {cantidadTotal}
                    </Badge>
                  )}
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{usuario?.nombre}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-2 py-1.5 text-sm text-gray-500">
                      {usuario?.email}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer text-red-600 focus:text-red-700"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Salir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Ingresar</Button>
                </Link>
                <Link href="/registro">
                  <Button>Crear cuenta</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
