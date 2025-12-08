"use client";
import React, { createContext, useCallback, useContext, useState } from "react";

type Toast = { id: number; message: string };

interface ToastCtx {
  toast: (message: string) => void;
}

const Ctx = createContext<ToastCtx | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      {/* Contenedor bottom-right */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 items-end pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto bg-gray-900 text-white text-sm px-3 py-2 rounded shadow-lg animate-fade-in"
          >
            {t.message}
          </div>
        ))}
      </div>
      <style jsx global>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 160ms ease-out; }
      `}</style>
    </Ctx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useToast debe usarse dentro de ToastProvider");
  return ctx;
}
