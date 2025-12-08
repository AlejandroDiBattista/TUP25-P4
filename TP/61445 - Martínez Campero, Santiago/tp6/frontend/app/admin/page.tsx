'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/app/hooks/useToast';
import { obtenerProductos } from '@/app/services/productos';
import { eliminarProducto } from '@/app/services/admin';
import { Producto } from '@/app/types';
import AdminProductForm from '@/app/components/AdminProductForm';

export default function AdminPage() {
  const router = useRouter();
  const { agregarToast } = useToast();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState<Producto | null>(null);
  const [mostrando, setMostrando] = useState<'lista' | 'crear'>('lista');
  const [eliminando, setEliminando] = useState<number | null>(null);

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const datos = await obtenerProductos();
        setProductos(datos);
      } catch (error) {
        console.error('Error:', error);
        agregarToast('Error al cargar productos', 'error');
      } finally {
        setLoading(false);
      }
    };

    cargarProductos();
  }, [router, agregarToast]);

  const handleEliminar = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      return;
    }

    try {
      setEliminando(id);
      await eliminarProducto(id);
      setProductos(prev => prev.filter(p => p.id !== id));
      agregarToast('Producto eliminado correctamente', 'success');
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido';
      agregarToast(mensaje, 'error');
    } finally {
      setEliminando(null);
    }
  };

  const handleExito = () => {
    setEditando(null);
    setMostrando('lista');
    // Recargar productos
    obtenerProductos()
      .then(datos => setProductos(datos))
      .catch(error => console.error('Error:', error));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-xl text-gray-600">Cargando...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            Panel de Administración
          </h1>
          <Button
            onClick={() => setMostrando('crear')}
            className="bg-green-600 hover:bg-green-700"
          >
            + Nuevo Producto
          </Button>
        </div>

        {mostrando === 'crear' ? (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editando ? 'Editar Producto' : 'Crear Nuevo Producto'}
            </h2>
            <AdminProductForm
              producto={editando || undefined}
              onSuccess={handleExito}
              onCancel={() => {
                setMostrando('lista');
                setEditando(null);
              }}
            />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Nombre</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Categoría</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Precio</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Existencia</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {productos.map(producto => (
                    <tr key={producto.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-600">#{producto.id}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-xs truncate">
                        {producto.nombre}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{producto.categoria}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">${producto.precio.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          producto.existencia > 0
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {producto.existencia === 0 ? '🔴 AGOTADO' : `✅ ${producto.existencia} unid.`}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm space-x-2">
                        {producto.existencia === 0 && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setEditando(producto);
                              setMostrando('crear');
                            }}
                            className="bg-orange-600 hover:bg-orange-700 text-white"
                          >
                            Reabastecer
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditando(producto);
                            setMostrando('crear');
                          }}
                          className="text-blue-600 hover:bg-blue-50"
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEliminar(producto.id)}
                          disabled={eliminando === producto.id}
                          className="text-red-600 hover:bg-red-50"
                        >
                          {eliminando === producto.id ? 'Eliminando...' : 'Eliminar'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {productos.length === 0 && (
              <div className="text-center py-12">
                <p className="text-lg text-gray-600 mb-4">No hay productos registrados</p>
                <Button
                  onClick={() => setMostrando('crear')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Crear primer producto
                </Button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
