"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";

export default function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const check = () => {
      const token = localStorage.getItem("token");
      setIsAuthenticated(!!token);
    };
    check();
    const handler = () => check();
    window.addEventListener("auth:changed", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("auth:changed", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  return (
    <nav className="w-full border-b bg-white">
      <div className="mx-auto flex items-center justify-between px-6 py-3">
        <div className="text-lg font-semibold">Tienda de Tito 👨🏻‍💻</div>

        <NavigationMenu>
          <NavigationMenuList className="flex gap-2">
            <NavigationMenuItem>
              <Link href="/">
                <NavigationMenuLink className="px-3 py-2 rounded-md hover:bg-gray-100">
                  Productos 📦
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link href="/compras">
                <NavigationMenuLink className="px-3 py-2 rounded-md hover:bg-gray-100">
                  Mis compras 🛒
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link href={isAuthenticated ? "/logout" : "/login"}>
                <NavigationMenuLink className="px-3 py-2 rounded-md hover:bg-gray-100">
                  {isAuthenticated ? "Salir 🚪" : "Iniciar sesión"}
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </nav>
  );
}
