"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
const CART_KEY = 'tp6_cart';
const CART_SYNC_KEY = 'tp6_cart_synced';

export default function Header() {
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();
  useEffect(() => {
    setToken(localStorage.getItem('tp6_token'));
  }, []);

  useEffect(() => {
    const handler = () => setToken(localStorage.getItem('tp6_token'));
    window.addEventListener('tp6:auth-changed', handler);
    return () => window.removeEventListener('tp6:auth-changed', handler);
  }, []);

  const logout = async () => {
    const storedToken = localStorage.getItem('tp6_token');
    try {
      if (storedToken) {
        await fetch(`${API_URL}/cerrar-sesion`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${storedToken}` },
        });
      }
    } catch (error) {
      console.warn('Error al cerrar sesión en backend', error);
    } finally {
  localStorage.removeItem('tp6_token');
  localStorage.removeItem(CART_KEY);
  localStorage.removeItem(CART_SYNC_KEY);
      setToken(null);
      window.dispatchEvent(new Event('tp6:auth-changed'));
      router.push('/');
    }
  };

  return (
    <header className="bg-white shadow-sm mb-6">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="font-bold text-lg text-gray-900">TP6 - Shop</Link>
        <nav className="flex items-center gap-4">
          <Link href="/" className="text-gray-900 hover:text-gray-700">Productos</Link>
          <Link href="/cart" className="text-gray-900 hover:text-gray-700">Carrito</Link>
          {token ? (
            <>
              <Link href="/mis-compras" className="text-gray-900 hover:text-gray-700">Mis compras</Link>
              <button onClick={logout} className="text-sm text-red-600">Salir</button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-gray-900 hover:text-gray-700">Ingresar</Link>
              <Link href="/registrar" className="text-gray-900 hover:text-gray-700">Crear Cuenta</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
