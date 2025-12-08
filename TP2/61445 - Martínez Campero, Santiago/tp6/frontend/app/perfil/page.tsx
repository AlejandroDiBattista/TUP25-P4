'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PerfilForm from '@/app/components/PerfilForm';
import { UsuarioData, obtenerUsuario } from '@/app/services/usuarios';

export default function PerfilPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<UsuarioData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargarUsuario = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const datosUsuario = await obtenerUsuario(token);
        setUsuario(datosUsuario);
      } catch (err) {
        const mensaje = err instanceof Error ? err.message : 'Error al cargar el perfil';
        setError(mensaje);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    cargarUsuario();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (error || !usuario) {
    return (
      <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error || 'No se pudo cargar tu perfil'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bienvenido, {usuario.nombre}
          </h1>
          <p className="text-gray-600">
            Aquí puedes ver y actualizar tu información personal
          </p>
        </div>

        <PerfilForm usuario={usuario} />

        {/* Información adicional */}
        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Consejo</h3>
          <p className="text-sm text-blue-800">
            Mantén tu perfil actualizado para recibir mejor servicio y notificaciones sobre tus pedidos.
          </p>
        </div>
      </div>
    </div>
  );
}
