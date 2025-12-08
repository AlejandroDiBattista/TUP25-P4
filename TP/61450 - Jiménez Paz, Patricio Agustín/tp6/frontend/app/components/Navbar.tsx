'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/app/components/ui/button';
import { ShoppingCart, User, LogOut, Package } from 'lucide-react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { toast } from 'sonner';

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    toast.success('Sesión cerrada correctamente');
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            E-Commerce
          </Link>
          
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link href="/carrito">
                  <Button variant="ghost" size="sm">
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Carrito
                  </Button>
                </Link>
                <Link href="/compras">
                  <Button variant="ghost" size="sm">
                    <Package className="h-5 w-5 mr-2" />
                    Mis Compras
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-5 w-5 mr-2" />
                  Cerrar Sesión
                </Button>
              </>
            ) : (
              <>
                <LoginForm>
                  <Button variant="ghost" size="sm">
                    <User className="h-5 w-5 mr-2" />
                    Iniciar Sesión
                  </Button>
                </LoginForm>
                <RegisterForm>
                  <Button variant="default" size="sm">
                    Registrarse
                  </Button>
                </RegisterForm>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
