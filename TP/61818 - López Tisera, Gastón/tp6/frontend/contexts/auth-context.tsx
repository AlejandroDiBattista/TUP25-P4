'use client';

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { getProfile, loginUser, registerUser } from "@/lib/api/auth";
import type {
  Credentials,
  RegisterPayload,
  User,
} from "@/types/auth";
import { ApiError } from "@/lib/api/client";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (credentials: Credentials) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "tp6_auth_token";

function resolveErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Ocurrió un error inesperado.";
}

export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const persistToken = useCallback((value: string | null) => {
    if (typeof window === "undefined") return;
    if (value) {
      window.localStorage.setItem(STORAGE_KEY, value);
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const loadProfile = useCallback(
    async (authToken: string | null) => {
      if (!authToken) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const profile = await getProfile(authToken);
        setUser(profile);
        setError(null);
      } catch (err) {
        setUser(null);
        setToken(null);
        persistToken(null);
        setError(resolveErrorMessage(err));
      } finally {
        setLoading(false);
      }
    },
    [persistToken],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedToken = window.localStorage.getItem(STORAGE_KEY);
    setToken(storedToken);
    void loadProfile(storedToken);
  }, [loadProfile]);

  const login = useCallback(
    async (credentials: Credentials) => {
      setLoading(true);
      try {
        const auth = await loginUser(credentials);
        setToken(auth.access_token);
        persistToken(auth.access_token);
        await loadProfile(auth.access_token);
      } catch (err) {
        setError(resolveErrorMessage(err));
        setLoading(false);
        throw err;
      }
    },
    [loadProfile, persistToken],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      setLoading(true);
      try {
        await registerUser(payload);
        await login({ email: payload.email, password: payload.password });
      } catch (err) {
        setError(resolveErrorMessage(err));
        setLoading(false);
        throw err;
      }
    },
    [login],
  );

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setError(null);
    persistToken(null);
  }, [persistToken]);

  const refreshProfile = useCallback(async () => {
    await loadProfile(token);
  }, [loadProfile, token]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loading,
      error,
      login,
      register,
      logout,
      refreshProfile,
    }),
    [user, token, loading, error, login, register, logout, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext debe utilizarse dentro de AuthProvider");
  }
  return context;
}

