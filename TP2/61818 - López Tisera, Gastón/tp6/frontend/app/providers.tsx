'use client';

import type { ReactNode } from "react";

import { AuthProvider } from "@/contexts/auth-context";
import { CartProvider } from "@/contexts/cart-context";

export function Providers({ children }: { children: ReactNode }): JSX.Element {
  return (
    <AuthProvider>
      <CartProvider>{children}</CartProvider>
    </AuthProvider>
  );
}

