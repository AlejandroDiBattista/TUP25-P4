'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { User, LoginResponse } from '../services/auth';

type Session = { token: string; user: User } | null;

type AuthContextValue = {
    session: Session;
    hydrated: boolean; 
    login: (auth: { token: string; user: User }) => void;
    loginFromResponse: (res: LoginResponse) => void;
    logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const STORAGE_KEY = 'tp6_auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session>(null);
    const [hydrated, setHydrated] = useState(false); 

    useEffect(() => {
        try {
        const oldToken = localStorage.getItem('tp6_token');
        const oldUserRaw = localStorage.getItem('tp6_user');
        if (oldToken && oldUserRaw) {
            const oldUser = JSON.parse(oldUserRaw);
            const migrated = { token: oldToken, user: oldUser as User };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
            localStorage.removeItem('tp6_token');
            localStorage.removeItem('tp6_user');
        }

        const raw = localStorage.getItem(STORAGE_KEY);
        setSession(raw ? (JSON.parse(raw) as Session) : null);
        } catch {
        setSession(null);
        } finally {
        setHydrated(true); 
        }
    }, []);

    useEffect(() => {
        const onStorage = (e: StorageEvent) => {
        if (e.key === STORAGE_KEY) {
            try {
            setSession(e.newValue ? (JSON.parse(e.newValue) as Session) : null);
            } catch {
            setSession(null);
            }
        }
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    const login = useCallback((auth: { token: string; user: User }) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
        setSession(auth);
    }, []);

    const loginFromResponse = useCallback((res: LoginResponse) => {
        login({ token: res.access_token, user: res.user });
    }, [login]);

    const logout = useCallback(() => {
        localStorage.removeItem(STORAGE_KEY);
        setSession(null);
    }, []);

    const value = useMemo<AuthContextValue>(
        () => ({ session, hydrated, login, loginFromResponse, logout }),
        [session, hydrated, login, loginFromResponse, logout]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
    }

    export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
    return ctx;
}
