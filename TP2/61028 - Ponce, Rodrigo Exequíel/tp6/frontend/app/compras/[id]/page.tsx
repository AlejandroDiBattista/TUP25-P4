"use client";

// 1. Importamos 'use' de React
import { useEffect, useState, use } from 'react'; 
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Rutas relativas (subimos 3 niveles)
import { useAuth } from '../../context/AuthContext';
import { obtenerDetalleCompra } from '../../services/compra';
import { CompraResponse } from '../../types';

// Componentes de Shadcn (¡RUTAS CORREGIDAS!)
// Todos deben apuntar a la carpeta 'ui'
import { Button } from '../../../components/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/card';
import { Separator } from '../../../components/ui/separator';
import { ArrowLeft } from 'lucide-react';

// 'params' sigue siendo una Promesa
export default function DetalleCompraPage({ params }: { params: Promise<{ id: string }> }) {
  
  const { token, isLoggedIn } = useAuth();
  const router = useRouter();
  const [compra, setCompra] = useState<CompraResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // <-- CAMBIO 1: Añadimos el estado 'isClient'
  const [isClient, setIsClient] = useState(false);

  // 2. Usamos el hook 'use()' para "desenvolver" la Promesa
  const resolvedParams = use(params); 
  // 3. Ahora SÍ podemos leer el 'id' del objeto resuelto
  const { id: compraId } = resolvedParams; 

  useEffect(() => {
    // <-- CAMBIO 2: Le decimos a React que ya estamos en el cliente
    setIsClient(true);

    if (!isLoggedIn) {
      router.push('/login');
      return; 
    }

    const fetchDetalle = async () => {
      if (token && compraId) { 
        try {
          const idNumerico = parseInt(compraId);
          const data = await obtenerDetalleCompra(idNumerico, token);
          setCompra(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Error al cargar el detalle');
        } finally {
          setIsLoading(false); 
        }
      } else if (!token) {
         router.push('/login');
      }
    };

    fetchDetalle();
  }, [token, isLoggedIn, router, compraId]); 

  if (isLoading) return <div className="p-8 text-center">Cargando detalle de la compra...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!compra) return <div className="p-8 text-center">No se encontró la compra.</div>;

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      <Link href="/compras">
        <Button variant="ghost" className="mb-4 pl-0 text-blue-600 hover:bg-transparent hover:text-blue-700">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al Historial
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl">Detalle de Compra #{compra.id}</CardTitle>
            <span className="text-sm text-gray-500">
              {/* <-- CAMBIO 3: Arreglamos el error de hidratación */}
              {isClient ? (
                new Date(compra.fecha).toLocaleDateString('es-AR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              ) : (
                '...' // Mostramos '...' en el render del servidor
              )}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold">Dirección de envío:</p>
              <p className="text-gray-600">{compra.direccion}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">Estado:</p>
              <p className="text-green-600 font-medium">Completada</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Productos Comprados</h3>
            {compra.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{item.nombre_producto}</p>
                  <p className="text-sm text-gray-500">
                    {item.cantidad} x ${item.precio_unitario.toFixed(2)}
                  </p>
                </div>
                <p className="font-semibold">${item.subtotal.toFixed(2)}</p>
              </div>
            ))}
          </div>

          <Separator />

          <div className="space-y-2 text-right">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Envío:</span>
              <span>${compra.envio.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold mt-2">
              <span>Total Pagado:</span>
              <span className="text-blue-600">${compra.total.toFixed(2)}</span>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}