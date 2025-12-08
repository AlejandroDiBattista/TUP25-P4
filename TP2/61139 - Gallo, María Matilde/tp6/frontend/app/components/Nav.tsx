"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Nav({ user }: { user?: string }) {
  const [nombre, setNombre] = useState<string | null>(user || null);

  useEffect(() => {
    const storedName = localStorage.getItem("nombre");
    if (storedName) setNombre(storedName);
  }, []);

  return (
    <header className="border-b bg-white">
      <nav className="max-w-6xl mx-auto flex items-center justify-between h-14 px-4">
        <Link href="/" className="font-semibold">TP6 Shop</Link>
        <div className="space-x-6 text-sm">
          <Link href="/">Productos</Link>
          <Link href="/mis-compras">Mis compras</Link>
          {nombre ? (
            <>
              <span className="opacity-70">{nombre}</span>
              <Link href="/ingresar" onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("nombre");
              }}>Salir</Link>
            </>
          ) : (
            <>
              <Link href="/ingresar">Ingresar</Link>
              <Link href="/crear-cuenta" className="bg-slate-900 text-white px-3 py-1 rounded-md">
                Crear cuenta
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
