"use client";
import { CartProvider } from "../context/CartContext";
import Navbar from "./Navbar";
import CartDrawer from "./CartDrawer"; // ya es client component
import { ToastProvider } from "../context/ToastContext";
import { AuthProvider } from "../context/AuthContext";
import { useEffect } from "react";
import { useToast } from "@/context/ToastContext";

function FlashToaster() {
  const { toast } = useToast();
  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = "flash";
    const msg = sessionStorage.getItem(key);
    if (msg) {
      toast(msg);
      sessionStorage.removeItem(key);
    }
  }, [toast]);
  return null;
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <Navbar />
          <FlashToaster />
          <main className="w-full p-4">{children}</main>
          <CartDrawer />
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}