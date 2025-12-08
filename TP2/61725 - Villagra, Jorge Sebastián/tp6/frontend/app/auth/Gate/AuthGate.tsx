'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type User = { id: number; nombre: string };

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Aquí podrías validar el token con el backend
      setUser({ id: 1, nombre: 'Usuario' }); // Placeholder
    }
    setLoading(false);
  }, []);

  // Nuevo: useEffect para redirigir cuando !user (después del render)
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [loading, user, router]);

  if (loading) return <div>Cargando...</div>;

  // Removido: No redirigir aquí, solo retornar null si no hay user (temporalmente)
  if (!user) return null;

  return <>{children}</>;
}