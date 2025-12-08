"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { AUTH_USER_UPDATED_EVENT } from "@/lib/auth";
import { cn } from "@/lib/utils";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type ToastState = {
  message: string;
  type: "success" | "error";
} | null;

type AddToCartButtonProps = {
  productoId: number;
  titulo: string;
  disponible?: boolean;
};

export function AddToCartButton({
  productoId,
  titulo,
  disponible = true,
}: AddToCartButtonProps) {
  const [token, setToken] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const syncToken = () => {
      setToken(window.localStorage.getItem("token"));
    };

    const handleStorage = () => syncToken();
    const handleAuthEvent = () => syncToken();

    syncToken();
    window.addEventListener("storage", handleStorage);
    window.addEventListener(AUTH_USER_UPDATED_EVENT, handleAuthEvent);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(AUTH_USER_UPDATED_EVENT, handleAuthEvent);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => setToast(null), 3500);
  };

  const handleAddToCart = async () => {
    if (!disponible) {
      return;
    }

    if (!token) {
      showToast("Inicia sesión para agregar productos al carrito.", "error");
      return;
    }

    setIsAdding(true);
    try {
      const response = await fetch(`${API_BASE_URL}/carrito`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ producto_id: productoId, cantidad: 1 }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.detail ?? "No se pudo agregar el producto");
      }

      const successMessage =
        data?.mensaje ?? `Agregaste 1 unidad de "${titulo}" a tu carrito.`;
      showToast(successMessage, "success");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Ocurrió un error inesperado.";
      showToast(message, "error");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <>
      <Button
        className="rounded-xl bg-slate-900 py-6 text-base text-white hover:bg-slate-800 disabled:pointer-events-none disabled:bg-slate-900 disabled:text-white disabled:opacity-100 disabled:hover:bg-slate-800"
        onClick={handleAddToCart}
        disabled={isAdding || !disponible}
        type="button"
      >
        {!disponible ? "Agotado" : isAdding ? "Agregando..." : "Agregar al carrito"}
      </Button>

      {toast && (
        <div className="pointer-events-none fixed bottom-6 right-6 z-50">
          <div
            className={cn(
              "min-w-[240px] rounded-2xl border px-4 py-3 text-sm font-medium shadow-xl",
              toast.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-700"
            )}
            role="status"
            aria-live="polite"
          >
            {toast.message}
          </div>
        </div>
      )}
    </>
  );
}
