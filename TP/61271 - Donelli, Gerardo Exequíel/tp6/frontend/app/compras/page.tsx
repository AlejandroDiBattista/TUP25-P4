'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { obtenerHistorialCompras, type CompraResumen } from '../services/compras';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Loader2, ShoppingBag, Package, ArrowLeft } from 'lucide-react';

export default function ComprasPage() {
  const { estaAutenticado, cargando, token } = useAuth();
  const router = useRouter();
  const [compras, setCompras] = useState<CompraResumen[]>([]);
  const [totalCompras, setTotalCompras] = useState(0);
  const [cargandoCompras, setCargandoCompras] = useState(true);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    if (!cargando && !estaAutenticado) {
      router.push('/auth/login');
    }
  }, [estaAutenticado, cargando, router]);

  useEffect(() => {
    if (estaAutenticado && token) {
      cargarHistorial();
    }
  }, [estaAutenticado, token]);

  const cargarHistorial = async () => {
    if (!token) return;

    setCargandoCompras(true);
    try {
      const data = await obtenerHistorialCompras(token);
      setCompras(data.compras);
      setTotalCompras(data.total_compras || data.compras.length);
      setMensaje(data.mensaje || '');
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar historial');
    } finally {
      setCargandoCompras(false);
    }
  };

  const formatearFecha = (fechaISO: string) => {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!estaAutenticado) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header con botón volver */}
      <div className="mb-8">
        <Button
          onClick={() => router.push('/')}
          variant="ghost"
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a productos
        </Button>
        <h1 className="text-4xl font-bold tracking-tight">Mis Compras</h1>
        <p className="text-muted-foreground mt-2 flex items-center gap-2">
          <ShoppingBag className="h-4 w-4" />
          {totalCompras > 0 
            ? `${totalCompras} ${totalCompras === 1 ? 'compra realizada' : 'compras realizadas'}`
            : 'Historial de tus compras'}
        </p>
      </div>

      {/* Error */}
      {error && (
        <Card className="bg-destructive/10 border-destructive/20 text-destructive px-4 py-3 mb-6">
          {error}
        </Card>
      )}

      {/* Contenido */}
      {cargandoCompras ? (
        <div className="text-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Cargando historial...</p>
        </div>
      ) : compras.length === 0 ? (
        <Card className="text-center py-12">
          <div className="mb-4">
            <ShoppingBag className="mx-auto h-24 w-24 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">
            {mensaje || 'No tienes compras realizadas'}
          </h3>
          <p className="text-muted-foreground mb-6">
            Cuando realices una compra, aparecerá aquí tu historial
          </p>
          <Button onClick={() => router.push('/')}>
            <Package className="h-4 w-4 mr-2" />
            Ver productos
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {compras.map((compra) => (
            <Card
              key={compra.id}
              className="hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
              onClick={() => router.push(`/compras/${compra.id}`)}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">
                      Compra #{compra.id}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {formatearFecha(compra.fecha)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      ${compra.total.toFixed(2)}
                    </p>
                    <Badge variant="secondary" className="mt-1">
                      {compra.envio === 0 ? 'Envío gratis' : `Envío: $${compra.envio.toFixed(2)}`}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Dirección de envío</p>
                    <p className="text-sm font-medium">
                      {compra.direccion}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Productos</p>
                    <p className="text-sm font-medium">
                      {compra.cantidad_productos} {compra.cantidad_productos === 1 ? 'artículo' : 'artículos'}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <span className="inline-flex items-center text-sm font-medium text-primary hover:underline">
                    Ver detalles
                    <svg
                      className="ml-2 h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
