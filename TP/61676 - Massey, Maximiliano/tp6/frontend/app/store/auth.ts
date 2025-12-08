import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
    token: string | null;
    user: {
        id: number;
        nombre: string;
        email: string;
    } | null;
    setAuth: (token: string, user: { id: number; nombre: string; email: string }) => void;
    clearAuth: () => void;
    logout: () => void;
}

const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            user: null,
            setAuth: (token, user) => {
                console.log('🔐 Guardando sesión:', user.nombre);
                set({ token, user });
            },
            clearAuth: () => {
                console.log('🚪 Cerrando sesión');
                set({ token: null, user: null });
            },
            logout: () => {
                console.log('🚪 Cerrando sesión');
                set({ token: null, user: null });
            }
        }),
        {
            name: 'auth-storage',
        }
    )
);

export { useAuthStore };
export default useAuthStore;
