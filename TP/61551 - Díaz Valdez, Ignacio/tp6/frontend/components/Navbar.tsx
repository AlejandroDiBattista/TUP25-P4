"use client";
import { useCart } from "../context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { toggle, count } = useCart();
  const { authenticated, userName, logout } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const handleLogout = () => {
    const ok = window.confirm("¿Quieres cerrar sesión?");
    if (!ok) return;
    logout();
    toast("Sesión cerrada");
    router.push("/");
  };
  return (
    <nav className="w-full bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-6 text-sm text-gray-900">
        <a href="/" className="text-base font-semibold">TP6 Shop</a>
        <Button asChild variant="ghost" size="sm"><a href="/">Productos</a></Button>
        {authenticated && (
          <Button asChild variant="ghost" size="sm"><a href="/compras">Mis compras</a></Button>
        )}
        <div className="ml-auto flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={toggle} className="relative w-9 h-9 p-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <path d="M3 3h2l3.6 7.59a1 1 0 0 0 .9.59H17a1 1 0 0 0 .92-.62L21 6H6" />
            <circle cx="9" cy="21" r="1" />
            <circle cx="19" cy="21" r="1" />
          </svg>
          {count > 0 && (
            <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full animate-pulse">
              {count}
            </span>
          )}
        </Button>
          {authenticated ? (
            <>
              {userName && <span className="text-sm text-gray-700">{userName}</span>}
              <Button variant="ghost" size="sm" onClick={handleLogout}>Salir</Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm"><a href="/login">Ingresar</a></Button>
              <Button asChild variant="ghost" size="sm"><a href="/register">Crear cuenta</a></Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
