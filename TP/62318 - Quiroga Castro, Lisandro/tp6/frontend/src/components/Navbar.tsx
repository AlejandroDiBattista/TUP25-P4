"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";
import { useCarritoStore } from "@/store/useCarritoStore";

export default function Navbar() {
  const router = useRouter();
  const { usuario, logout } = useUserStore();
  const { vaciarCarrito } = useCarritoStore();

  const handleLogout = () => {
    vaciarCarrito(usuario?.id || 0); // limpia carrito
    logout(); // limpia usuario + token
    router.push("/login"); // vuelve al login
  };

  return (
    <nav
      style={{
        width: "100%",
        padding: "10px 20px",
        background: "#333",
        color: "white",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
      }}
    >
      {/* LOGO */}
      <Link
        href="/"
        style={{ color: "white", textDecoration: "none", fontSize: 20 }}
      >
        🛒 Tienda Online
      </Link>

      <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
        {/* CARRITO */}
        <Link
          href="/carrito"
          style={{ color: "white", textDecoration: "none", fontSize: 16 }}
        >
          Carrito
        </Link>

        {/* USUARIO LOGUEADO */}
        {usuario ? (
          <>
            <span style={{ fontSize: 16 }}>
              Hola, {usuario.nombre || usuario.email}
            </span>

            <button
              onClick={handleLogout}
              style={{
                background: "red",
                color: "white",
                padding: "6px 12px",
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              Cerrar Sesión
            </button>
          </>
        ) : (
          <Link href="/login" style={{ color: "white" }}>
            Iniciar Sesión
          </Link>
        )}
      </div>
    </nav>
  );
}
//
