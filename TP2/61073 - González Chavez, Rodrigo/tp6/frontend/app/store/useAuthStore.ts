import {create} from "zustand"
import {persist} from "zustand/middleware"
import { AuthState } from "../types"

export const useAuthStore = create<AuthState>() (
    persist (
        (set) => ({
            token: null,
            usuario: null,
            iniciarSesion: (token, usuario) => {
                if (!token || !usuario) return
                set({token, usuario})
            },
            cerrarSesion: () => set({token: null, usuario: null}),
        }),
        {
            name: "auth-storage"
        }
    )    
)