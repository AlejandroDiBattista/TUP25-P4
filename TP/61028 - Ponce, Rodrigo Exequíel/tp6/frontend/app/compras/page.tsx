"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
// Importaciones con rutas relativas corregidas
import { useAuth } from '../context/AuthContext';
import { obtenerHistorialCompras } from '../services/compra'; // <-- ¡Ahora sí existe!
import { CompraResumenResponse } from '../types';

// --- ¡RUTAS DE SHADCN CORREGIDAS! ---
import { Button } from '../../components//button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/card';
import { Badge } from '../../components/badge';
// ---

export default function HistorialPage() {
  const { token, isLoggedIn } = useAuth();
  const router = useRouter();
  const [compras, setCompras] = useState<CompraResumenResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Proteger la ruta
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    const fetchCompras = async () => {
      if (token) {
        try {
          const data = await obtenerHistorialCompras(token);
          setCompras(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Error al cargar el historial');
        } finally {
          setIsLoading(false);
        }
      } else {
        router.push('/login');
      }
    };

    fetchCompras();
  }, [token, isLoggedIn, router]);

  if (isLoading) return <div className="p-8 text-center">Cargando historial...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Mis Compras</h1>

      {compras.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 mb-4">Aún no has realizado ninguna compra.</p>
          <Link href="/">
            <Button>Ir a comprar</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {compras.map((compra) => (
            <Card key={compra.id} className="flex flex-col md:flex-row items-center justify-between p-4">
              <div className="flex flex-col gap-1 mb-4 md:mb-0">
                <CardTitle className="text-lg">Compra #{compra.id}</CardTitle>
                <p className="text-sm text-gray-500">
                  {new Date(compra.fecha).toLocaleDateString('es-AR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <Badge variant="secondary" className="w-fit">
                  {compra.cantidad_items} productos
                </Badge>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-xl font-bold">${compra.total.toFixed(2)}</span>
                <Link href={`/compras/${compra.id}`}>
                  <Button variant="outline">Ver Detalle</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}