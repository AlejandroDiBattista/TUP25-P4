"use client";

import Link from "next/link";
import { useAuthStore } from "../store/useAuthStore";
import { Button } from "./ui/button";
import { usePathname } from "next/navigation";

export default function NavBar() {
const { token, usuario, cerrarSesion } = useAuthStore();
const pathname = usePathname()

const linkClasses = (path: string) =>
    `text-base transition font-medium ${pathname === path ? 
        "text-gray-950 font-semibold" : 
        "text-gray-500 hover:text-gray-800"
    }`

return (
    <header className="border-b bg-white sticky top-0 z-50 pb-2">
        <nav className="mas-w-7xl mx-auto flex items-center justify-between px-6 py-3">
            <Link href="/" className="text-lg font-semibold tracking-wide">
                TP6
            </Link>

            <div className="flex items-center gap-5">
                <Link href="/" className={linkClasses("/")}>
                    Productos
                </Link>
                    {!token ? (
                            <>
                                <Link href="/login" className={linkClasses("/login")}>
                                    Ingresar
                                </Link>
                                <Button asChild className="text-base px-3 py-1">
                                    <Link href="/register">Crear Cuenta</Link>
                                </Button>
                        </>
                    ) : (
                        <>
                            <Link href="/mis-compras" className={linkClasses("/mis-compras")}>
                                Mis Compras
                            </Link>
                            <span className="text-base text-gray-600">Hola, <strong>{usuario}</strong></span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    cerrarSesion()
                                    window.location.href = "/"
                                }}
                            >
                                Cerrar Sesión
                            </Button>
                        </>
                    )}
            </div>
        </nav>
    </header>
)
}