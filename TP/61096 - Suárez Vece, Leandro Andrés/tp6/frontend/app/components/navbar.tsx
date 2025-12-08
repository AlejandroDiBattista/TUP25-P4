import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cerrarSesion } from "../services/usuarios";
import React from "react";

interface NavbarProps {
    token: string
    setToken: React.Dispatch<React.SetStateAction<string>>
}


export default function Navbar({ token, setToken }: NavbarProps) {


    const logout = async () => {
        try {
            const res = await cerrarSesion(token!)
            if (res) {
                localStorage.clear();
                setToken("")
            }
        } catch (error) {
            console.error("Error al cerrar sesión: " + error);
        }
    }


    return (
        <nav className="flex items-center justify-end space-x-4 p-4">
            <Link
                href="/"
                className="text-sm font-medium hover:text-primary transition-colors"
            >
                Productos
            </Link>
            {
                !token ? (<>
                    <Link
                        href="/login"
                        className="text-sm font-medium hover:text-primary transition-colors"
                    >
                        Ingresar
                    </Link>

                    <Button variant="outline">
                        <Link href="/registro">
                            Crear cuenta
                        </Link>
                    </Button>
                </>) :
                    (<>
                        <Link
                            href="/historial"
                            className="text-sm font-medium hover:text-primary transition-colors"
                        >
                            Mis Compras
                        </Link>
                        <Button variant="outline" onClick={logout}>
                            <Link href="/">
                                Salir
                            </Link>
                        </Button>
                    </>)
            }


        </nav>
    );
}