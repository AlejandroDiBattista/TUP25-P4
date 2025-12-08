'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/cerrar-sesion`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('No se pudo cerrar sesión.');
      }

  router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      onClick={handleLogout}
      disabled={isLoading}
      variant="outline"
      className="border-slate-200 text-slate-700 hover:border-slate-300"
    >
      {isLoading ? 'Saliendo...' : 'Salir'}
    </Button>
  );
}
