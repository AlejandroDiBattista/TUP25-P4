"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const BACK = process.env.NEXT_PUBLIC_BACKEND || "http://127.0.0.1:8000";

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Verificar si el usuario está logueado
    const checkAuthStatus = () => {
      const token = localStorage.getItem("tp_token");
      const user = localStorage.getItem("user_name");
      
      if (token && user) {
        setIsLoggedIn(true);
        setUserName(user);
      } else {
        setIsLoggedIn(false);
        setUserName(null);
      }
    };

    // Verificar al cargar
    checkAuthStatus();

    // Escuchar cambios en el localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "tp_token" || e.key === "user_name") {
        checkAuthStatus();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    
    // También escuchar eventos custom para cambios en la misma pestaña
    const handleCustomAuth = () => {
      checkAuthStatus();
    };

    window.addEventListener("authChanged", handleCustomAuth);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("authChanged", handleCustomAuth);
    };
  }, []);

  function onClickHandler(name: string, href: string, e: React.MouseEvent) {
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    router.push(href);
  }

  async function handleLogout(e: React.MouseEvent) {
    e.preventDefault();
    
    // Limpiar localStorage y actualizar estado
    localStorage.removeItem("tp_token");
    localStorage.removeItem("user_name");
    localStorage.removeItem("temp_cart");
    
    // Disparar evento para actualizar el header
    window.dispatchEvent(new Event("authChanged"));
    
    setIsLoggedIn(false);
    setUserName(null);
    
    // Redirigir y recargar la página
    window.location.href = "/";
    window.location.reload();
  }

  return (
    <header className="header">
      <div className="header-left">
        <button className="brand" onClick={(e) => onClickHandler("home", "/", e)}>🏠 TP6 Shop</button>
      </div>

      <nav className="header-nav" aria-label="main navigation">
        <button className="nav-link" onClick={(e) => onClickHandler("catalogo", "/", e)}>📦 Catálogo</button>
        
        {isLoggedIn ? (
          // Usuario logueado
          <>
            <button className="nav-link" onClick={(e) => onClickHandler("historial", "/historial", e)}>🛍️ Mis compras</button>
            <span className="nav-user" style={{ color: '#10b981', fontWeight: '600' }}>👤 {userName}</span>
            <button className="nav-link nav-logout" onClick={handleLogout} style={{ color: '#ef4444' }}>🚪 Cerrar sesión</button>
          </>
        ) : (
          // Usuario no logueado
          <>
            <button className="nav-link" onClick={(e) => onClickHandler("ingresar", "/ingresar", e)}>Ingresar</button>
            <button className="nav-link" onClick={(e) => onClickHandler("crear-cuenta", "/crear-cuenta", e)}>Crear cuenta</button>
          </>
        )}
      </nav>
    </header>
  );
}