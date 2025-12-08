"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getUser, logout } from '../services/auth';
import { verCarrito } from '../services/carrito';

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [cartCount, setCartCount] = useState<number>(0);

  useEffect(() => {
    setUser(getUser());
    function onAuth() {
      setUser(getUser());
    }
    window.addEventListener('authChanged', onAuth);
    return () => { window.removeEventListener('authChanged', onAuth); };
  }, []);

  useEffect(() => {
    let mounted = true;
    async function loadCart() {
      if (!user) {
        setCartCount(0);
        return;
      }
      try {
        const data = await verCarrito();
        if (mounted) setCartCount((data.items && data.items.length) || 0);
      } catch (e) {
        // ignore
+        console.error(e);
      }
    }
    loadCart();
    return () => { mounted = false; };
  }, [user]);

  function handleLogout() {
    logout();
    // reload to update header state
    window.location.reload();
  }

  return (
    <header className="bg-gradient-to-r from-sky-50 to-white shadow-md border-b">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <Link href="/" className="text-xl font-semibold text-sky-900">Mercado Azul</Link>
        </div>

        <nav className="flex items-center gap-4 text-sm">
          <Link href="/" className="px-3 py-1 rounded hover:bg-sky-100">Productos</Link>
          <Link href="/mis-compras" className="px-3 py-1 rounded hover:bg-sky-100">Mis compras</Link>

          {user ? (
            <>
              <span className="text-sky-900 font-medium">{user.nombre}</span>
              <button onClick={handleLogout} className="text-sm text-red-600 ml-2">Salir</button>
            </>
          ) : (
            <>
              <Link href="/ingresar" className="px-3 py-1 text-sky-900 hover:underline">Ingresar</Link>
              <Link href="/crear-cuenta">
                <button className="bg-sky-600 text-white border border-sky-700 rounded px-3 py-1 text-sm">Crear cuenta</button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
