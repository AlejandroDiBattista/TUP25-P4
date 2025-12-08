'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Navigation from './components/Navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir a productos al cargar
    router.push('/productos');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-600">Redirigiendo...</p>
        </div>
      </div>
    </div>
  );
}
