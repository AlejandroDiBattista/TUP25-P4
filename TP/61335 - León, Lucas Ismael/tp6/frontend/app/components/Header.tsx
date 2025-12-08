"use client";
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getToken, setToken, getMe } from '../services/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [token, setTokenState] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      const tk = getToken();
      setTokenState(tk);
      if (tk) {
        getMe().then(u => setUserName(u?.nombre ?? null));
      }
      setMounted(true);
    });
    function handleTokenChange() {
      const nt = getToken();
      setTokenState(nt);
      if (nt) {
        getMe().then(u => setUserName(u?.nombre ?? null));
      } else {
        setUserName(null);
      }
    }
    window.addEventListener('token-change', handleTokenChange);
    function handleStorage(e: StorageEvent) {
      if (e.key === 'token') {
        setTokenState(getToken());
      }
    }
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('token-change', handleTokenChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  async function logout() {
    const current = getToken();
    if (current) {
      try {
        await fetch(`${API_URL}/cerrar-sesion`, { method: 'POST', headers: { Authorization: `Bearer ${current}` } });
  } catch {}
    }
    setToken(null);
    setTokenState(null);
    setUserName(null);
    router.push('/');
  }

  return (
    <header className="w-full border-b bg-white">
      <nav className="max-w-6xl mx-auto flex items-center px-4 py-3 text-sm">
        <Link href="/" className="font-semibold text-base tracking-tight">TP6 Shop</Link>
        <div className="ml-auto flex items-center gap-6">
          <Link
            href="/"
            className={`${pathname === '/' ? 'text-black font-medium' : 'text-gray-700 hover:text-black'} transition`}
          >
            Productos
          </Link>
          {mounted && token && (
            <Link
              href="/compras"
              className={`${pathname.startsWith('/compras') ? 'text-black font-medium' : 'text-gray-700 hover:text-black'} transition`}
            >
              Mis compras
            </Link>
          )}
          {mounted && token && userName && (
            <span className="text-sm text-gray-600 truncate max-w-[160px]" title={userName}>{userName}</span>
          )}
          {mounted && token ? (
            <button onClick={logout} className="px-3 py-1.5 rounded bg-gray-900 hover:bg-black text-white">Salir</button>
          ) : (
            <>
              <Link href="/login" className="px-3 py-1.5 rounded bg-gray-900 text-white hover:bg-black">Ingresar</Link>
              <Link href="/register" className="px-3 py-1.5 rounded bg-gray-900 text-white hover:bg-black">Crear cuenta</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
