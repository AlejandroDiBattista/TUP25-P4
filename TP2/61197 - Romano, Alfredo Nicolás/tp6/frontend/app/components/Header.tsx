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
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <Link href="/" className="text-xl font-semibold">LUCARBA</Link>
        </div>

        <nav className="flex items-center gap-4 text-sm">
          <Link href="/">Productos</Link>
          <Link href="/mis-compras">Mis compras</Link>

          {user ? (
            <>
              <span className="text-black">{user.nombre}</span>
              <button onClick={handleLogout} className="text-sm text-red-600">Salir</button>
            </>
          ) : (
            <>
              <Link href="/ingresar">Ingresar</Link>
              <Link href="/crear-cuenta">
                <button className="bg-white border rounded px-3 py-1 text-sm">Crear cuenta</button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
