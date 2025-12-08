"use client";
import Link from "next/link";
import { useEffect } from "react";
import { useCarritoStore } from "@/store/useCarritoStore";
import { useUserStore } from "@/store/useUserStore";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { items } = useCarritoStore();
  const usuario = useUserStore((s) => s.usuario);
  const logout = useUserStore((s) => s.logout);

  // --- MODO OSCURO ---
  const toggleDark = () => {
    const html = document.documentElement;
    if (html.classList.contains("dark")) {
      html.classList.remove("dark");
      html.classList.add("light");
      localStorage.setItem("theme", "light");
    } else {
      html.classList.remove("light");
      html.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("theme") || "light";
    document.documentElement.classList.add(saved);
  }, []);
  // --------------------

  return (
    <html lang="es">
      <body
        style={{
          background: "var(--bg)",
          color: "var(--text)",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
          transition: "background 0.3s ease, color 0.3s ease",
        }}
      >
        <nav
          style={{
            display: "flex",
            gap: 20,
            padding: 20,
            fontSize: 16,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* --- IZQUIERDA --- */}
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            <Link
              href="/"
              style={{
                fontWeight: 700,
                color: "var(--text)",
                textDecoration: "none",
                fontSize: 18,
              }}
            >
              Mi Tienda
            </Link>

            <Link
              href="/carrito"
              style={{ color: "var(--text)", textDecoration: "none" }}
            >
              Carrito 🛒 ({items.length})
            </Link>

            {usuario && (
              <Link
                href="/historial"
                style={{ color: "var(--text)", textDecoration: "none" }}
              >
                Mis compras
              </Link>
            )}
          </div>

          {/* --- DERECHA --- */}
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            {/* BOTÓN MODO OSCURO */}
            <button
              onClick={toggleDark}
              style={{
                background: "transparent",
                border: "1px solid #666",
                padding: "5px 10px",
                borderRadius: 6,
                cursor: "pointer",
                color: "var(--text)",
              }}
            >
              🌙 / ☀️
            </button>

            {usuario ? (
              <>
                <span style={{ color: "var(--text)" }}>
                  Hola, {usuario.nombre ?? usuario.email}
                </span>

                {/* BOTÓN CERRAR SESIÓN */}
                <button
                  onClick={logout}
                  style={{
                    background: "#ff3b30",
                    color: "white",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  style={{ color: "#007aff", textDecoration: "none" }}
                >
                  Ingresar
                </Link>
                <Link
                  href="/auth/register"
                  style={{ color: "#007aff", textDecoration: "none" }}
                >
                  Crear cuenta
                </Link>
              </>
            )}
          </div>
        </nav>

        <main>{children}</main>
      </body>
    </html>
  );
}
//
