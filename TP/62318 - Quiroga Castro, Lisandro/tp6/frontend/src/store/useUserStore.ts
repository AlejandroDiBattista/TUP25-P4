// src/store/useUserStore.ts
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type Usuario = {
  id: number;
  nombre?: string;
  email?: string;
};

type UserState = {
  usuario: Usuario | null;
  token: string | null;

  setUsuario: (u: Usuario | null, token?: string | null) => void;
  logout: () => void;
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      usuario: null,
      token: null,

      setUsuario: (u, token = null) =>
        set({
          usuario: u,
          token: token || null,
        }),

      logout: () =>
        set({
          usuario: null,
          token: null,
        }),
    }),
    {
      name: "user-storage",
      getStorage: () => localStorage,
    }
  )
);
//
