"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/componentsShadCN/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/componentsShadCN/ui/navigation-menu";
import { Separator } from "@/componentsShadCN/ui/separator";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [token, setToken] = useState<string | null>(null);
  const [nombre, setNombre] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const loadSession = () => {
      const storedToken = window.localStorage.getItem("token");
      const storedNombre = window.localStorage.getItem("usuarioNombre");
      setToken(storedToken);
      setNombre(storedToken ? storedNombre : null);
    };

    loadSession();

    const handleStorage = () => {
      loadSession();
    };

    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const handleLogout = () => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.removeItem("token");
    window.localStorage.removeItem("usuarioNombre");
    setToken(null);
    setNombre(null);
    setMessage("Sesión cerrada");
    router.push("/");
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/globe.svg" alt="TP6 Shop" width={40} height={40} />
          <div>
            <Link href="/" className="text-sm font-semibold text-blue-600">TP6 Shop</Link>
          </div>
        </div>

        <nav className="flex items-center gap-4 text-sm text-gray-600">
          <NavigationMenu viewport={false} className="flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink asChild active={pathname === "/"}>
                  <Link href="/" className={navigationMenuTriggerStyle({ className: "text-gray-700" })}>
                    Productos
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              {token && (
                <NavigationMenuItem>
                  <NavigationMenuLink
                    asChild
                    active={pathname?.startsWith("/compras")}
                  >
                    <Link href="/compras" className={navigationMenuTriggerStyle({ className: "text-gray-700" })}>
                      Mis compras
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              )}
            </NavigationMenuList>
          </NavigationMenu>

          <Separator orientation="vertical" className="hidden h-6 md:block" />

          {token ? (
            <div className="flex items-center gap-3">
              {nombre && <span className="text-sm font-medium text-gray-800">{nombre}</span>}
              <Button variant="outline" size="sm" onClick={handleLogout} className="border-red-200 text-red-600 hover:bg-red-50">
                Salir
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/login?mode=login">Ingresar</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/login?mode=register">Crear cuenta</Link>
              </Button>
            </div>
          )}
        </nav>
      </div>
      {message && (
        <div className="bg-green-50 border-t border-green-200 text-green-600 text-sm text-center py-1" role="status" aria-live="polite">
          {message}
        </div>
      )}
    </header>
  );
}
