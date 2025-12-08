"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {cerrarSesion} from '../services/auth';

export default function LogoutPage() {
  const router = useRouter();
  useEffect(() => {
    try {
      cerrarSesion();
    } 
    catch(error) {
      console.error("Error al cerrar sesión:", error);
    }
    router.replace("/login");
  }, [router]);
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground">Cerrando sesión...</p>
    </div>
  );
}
