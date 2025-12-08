"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [usuarioNombre, setUsuarioNombre] = useState<string | null>(null);

  useEffect(() => {
    const nombre = localStorage.getItem("usuario_nombre");
    setUsuarioNombre(nombre);
  }, []);

  function handleLogout() {
    localStorage.removeItem("usuario_id");
    localStorage.removeItem("usuario_nombre");
    window.location.href = "/";
  }

  return (
    <nav className="w-full bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-gray-800">
          TP6 Shop
        </Link>

        <div className="flex items-center gap-8">

          <Link href="/" className="text-gray-700 hover:text-blue-600">
            Productos
          </Link>

{usuarioNombre ? (
  <>
    <Link href="/mis-compras" className="text-gray-700 hover:text-blue-600">
      Mis compras
    </Link>

    <span className="text-gray-900 font-medium">{usuarioNombre}</span>

    <button
      onClick={handleLogout}
      className="text-gray-900 hover:text-gray-700 font-medium cursor-pointer"
    >
      Salir
    </button>
  </>
) : (
  <>
    <Link href="/ingresar" className="text-gray-700 hover:text-blue-600">
      Ingresar
    </Link>

<Link href="/crear-cuenta" className="text-gray-700 hover:text-blue-600">
  Crear cuenta
</Link>
  </>
)}
        </div>
      </div>
    </nav>
  );
}
