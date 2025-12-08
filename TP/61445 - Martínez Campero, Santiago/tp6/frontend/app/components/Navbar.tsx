'use client';

import { useEffect, useState } from 'react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cerrarSesion } from "@/app/services/auth";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const [autenticado, setAutenticado] = useState<boolean | null>(null);

  useEffect(() => {
    const verificarToken = () => {
      const token = localStorage.getItem('token');
      setAutenticado(!!token);
    };
    verificarToken();
  }, []);

  const handleLogout = async () => {
    await cerrarSesion();
    setAutenticado(false);
    router.push("/login");
    router.refresh();
  };

  // Mostrar un navbar básico mientras se carga el estado
  if (autenticado === null) {
    return (
      <nav className="border-b bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-primary">
            TP6 Shop
          </Link>
        </div>
      </nav>
    );
  }

  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-primary">
          TP6 Shop
        </Link>
        
        <div className="flex gap-4 items-center">
          <Link href="/productos">
            <Button variant="ghost">Productos</Button>
          </Link>
          
          {autenticado ? (
            <>
              <Link href="/carrito">
                <Button variant="outline">Carrito</Button>
              </Link>
              <Link href="/compras">
                <Button variant="ghost">Mis Compras</Button>
              </Link>
              <Link href="/perfil">
                <Button variant="ghost">Mi Perfil</Button>
              </Link>
              <Button onClick={handleLogout} variant="destructive">
                Cerrar Sesión
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button>Iniciar Sesión</Button>
              </Link>
              <Link href="/register">
                <Button variant="outline">Registrarse</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
