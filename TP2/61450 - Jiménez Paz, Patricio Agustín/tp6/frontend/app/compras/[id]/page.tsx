'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { obtenerDetalleCompra } from '../../services/compras';
import { Compra } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import DetalleCompra from '../../components/DetalleCompra';

export default function DetalleCompraPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const compra_id = parseInt(params.id as string);
  const [compra, setCompra] = useState<Compra | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
      return;
    }
    cargarCompra();
  }, [isAuthenticated, compra_id]);

  const cargarCompra = async () => {
    try {
      setLoading(true);
      const data = await obtenerDetalleCompra(compra_id);
      setCompra(data);
    } catch (err: any) {
      const errorMsg = err.message || 'Error al cargar el detalle de la compra';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-xl text-gray-600">Cargando detalle...</p>
      </div>
    );
  }

  if (error || !compra) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600 mb-4">{error || 'Compra no encontrada'}</p>
            <Link href="/compras">
              <Button className="w-full">Volver a Mis Compras</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <Link href="/compras">
            <Button variant="outline" size="sm">
              ← Volver a Mis Compras
            </Button>
          </Link>
        </div>

        <DetalleCompra compra={compra} mostrarExito={true} />

        <div className="mt-6">
          <Link href="/">
            <Button className="w-full">
              Seguir Comprando
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
