'use client';

import { useCartContext } from "@/contexts/cart-context";

export function useCart() {
  return useCartContext();
}

