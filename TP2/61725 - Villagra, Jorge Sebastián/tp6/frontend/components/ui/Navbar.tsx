'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);
  const [nombre, setNombre] = useState<string | null>(null);

  useEffect(() => {
    try {
      const t = localStorage.getItem('token');
      const nom = localStorage.getItem('usuario_nombre');
      setIsAuth(!!t);
      setNombre(nom);
    } catch {}
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario_nombre');
    localStorage.removeItem('user');
    setIsAuth(false);
    setNombre(null);
    router.push('/auth/login');
  };

  return (
    <nav className="w-full border-b bg-white">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <a href="/" className="font-semibold">Parcial Ecommerce</a>
        <div className="flex items-center gap-4 text-sm">
          <a href="/" className="hover:text-blue-600">Inicio</a>
            <a href="/compras" className="hover:text-blue-600">Mis compras</a>
          {!isAuth ? (
            <>
              <a href="/auth/login" className="hover:text-blue-600">Iniciar sesión</a>
              <a href="/auth/registro" className="hover:text-blue-600">Registrarse</a>
            </>
          ) : (
            <>
              <span className="text-gray-700">Hola{nombre ? `, ${nombre}` : ''}</span>
              <button onClick={logout} className="text-red-600">Cerrar sesión</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}