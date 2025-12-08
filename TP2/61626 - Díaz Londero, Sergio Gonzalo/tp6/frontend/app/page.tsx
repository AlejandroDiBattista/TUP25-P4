'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Limpiar sesión al iniciar la aplicación
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Redirigir a productos
    router.push('/productos');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-lg text-muted-foreground">Redirigiendo...</div>
    </div>
  );
}
