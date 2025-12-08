    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    export type User = { id: number; nombre: string; email: string };

    export type LoginResponse = {
    access_token: string;
    token_type: string;
    user: User;
    };

    // ---------------------------------------------
    // Auth storage helpers (localStorage)
    // ---------------------------------------------
    const STORAGE_KEY = 'tp6_auth';

    export function saveAuth(data: { token: string; user: User }) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    export function getAuth():
    | { token: string; user: User }
    | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw) as { token: string; user: User };
    } catch {
        return null;
    }
    }

    export function clearAuth() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
    }

    // Adapter: LoginResponse -> saveAuth(...)
    export function saveAuthFromResponse(res: LoginResponse) {
    saveAuth({ token: res.access_token, user: res.user });
    }

    // ---------------------------------------------
    // API calls
    // ---------------------------------------------
    export async function registrar(params: {
    nombre: string;
    email: string;
    password: string;
    }): Promise<User> {
    const res = await fetch(`${API_URL}/registrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
    });

    if (!res.ok) {
        const msg = await safeMsg(res);
        throw new Error(msg || 'No se pudo registrar el usuario');
    }
    return res.json();
    }

    export async function iniciarSesion(params: {
    email: string;
    password: string;
    }): Promise<LoginResponse> {
    const res = await fetch(`${API_URL}/iniciar-sesion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
    });

    if (!res.ok) {
        const msg = await safeMsg(res);
        throw new Error(msg || 'Correo o contraseña inválidos');
    }
    return res.json();
    }

    // ---------------------------------------------
    // helpers
    // ---------------------------------------------
    async function safeMsg(res: Response) {
    try {
        const data = await res.json();
        return (data && (data.detail || data.message)) as string | undefined;
    } catch {
        return undefined;
    }
}
