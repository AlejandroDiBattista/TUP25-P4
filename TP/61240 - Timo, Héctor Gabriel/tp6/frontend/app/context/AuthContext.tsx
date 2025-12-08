"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getCarrito, agregarAlCarrito, quitarDelCarrito, iniciarSesion, registrarUsuario, getMiPerfil } from '@/services/api';
import { CarritoRead, Usuario, UsuarioCreate } from '@/types';

interface AuthContextType {
    isAuthenticated: boolean;
    user: Usuario | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    register: (nombre: string, email: string, password: string) => Promise<void>;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<Usuario | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchUser = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const profile = await getMiPerfil(token);
                setUser(profile);
            } catch (error) {
                console.error("Error fetching user profile, logging out.", error);
                localStorage.removeItem('token');
                setUser(null);
            }
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const login = async (email: string, password: string) => {
        try {
            const { access_token } = await iniciarSesion(email, password);
            localStorage.setItem('token', access_token);
            
            // Obtener el perfil del usuario con el nuevo token y actualizar el estado directamente
            const profile = await getMiPerfil(access_token);
            setUser(profile);
        } catch (error) {
            throw error; // Relanzamos el error para que el componente que llama lo pueda manejar
        }
    };

    const register = async (nombre: string, email: string, password: string) => {
        const newUser: UsuarioCreate = { nombre, email, password };
        await registrarUsuario(newUser);
        // No es necesario hacer login aquí si la página de registro ya lo hace
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        router.push('/login');
    };

    const isAuthenticated = !loading && !!user;

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout, register, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}