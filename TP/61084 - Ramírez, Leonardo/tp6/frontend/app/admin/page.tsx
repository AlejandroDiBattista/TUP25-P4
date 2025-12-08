'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { Producto } from '../types';

export default function AdminPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newStock, setNewStock] = useState<number>(0);
  const [message, setMessage] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    if (!token) {
      router.push('/auth');
      return;
    }

    loadProductos();
  }, [token, router]);

  const loadProductos = async () => {
    try {
      const response = await fetch(`${API_URL}/productos`, { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        setProductos(data);
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStock = async (productoId: number) => {
    try {
      const response = await fetch(`${API_URL}/productos/${productoId}/stock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ existencia: newStock }),
      });

      if (response.ok) {
        setMessage('Stock actualizado correctamente');
        setEditingId(null);
        loadProductos();
        setTimeout(() => setMessage(''), 3000);
      } else {
        const error = await response.json();
        setMessage(error.detail || 'Error al actualizar stock');
      }
    } catch (error) {
      setMessage('Error de conexión');
    }
  };

  if (!token) return null;

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-light tracking-tight">Administración de Stock</h1>
          <a
            href="/"
            className="border border-black hover:bg-black hover:text-white text-black px-6 py-2 transition-colors text-sm uppercase tracking-wider"
          >
            Volver al catálogo
          </a>
        </div>

        {message && (
          <div className="mb-6 p-4 border border-black text-black text-sm bg-gray-50">
            {message}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Cargando productos...</div>
        ) : (
          <div className="border border-gray-200">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Producto</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Categoría</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Precio</th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">Stock Actual</th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {productos.map((producto) => (
                  <tr key={producto.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-700">{producto.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="font-normal">{producto.titulo}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{producto.categoria}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">${producto.precio}</td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          producto.existencia === 0
                            ? 'bg-red-100 text-red-800'
                            : producto.existencia < 10
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {producto.existencia} unidades
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {editingId === producto.id ? (
                        <div className="flex items-center gap-2 justify-center">
                          <input
                            type="number"
                            min="0"
                            value={newStock}
                            onChange={(e) => setNewStock(parseInt(e.target.value) || 0)}
                            className="w-20 px-2 py-1 border border-gray-300 text-sm text-center"
                            autoFocus
                          />
                          <button
                            onClick={() => handleUpdateStock(producto.id)}
                            className="bg-black hover:bg-gray-800 text-white px-3 py-1 text-xs uppercase tracking-wider"
                          >
                            Guardar
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="border border-gray-300 hover:bg-gray-100 text-gray-700 px-3 py-1 text-xs uppercase tracking-wider"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingId(producto.id);
                            setNewStock(producto.existencia);
                          }}
                          className="border border-black hover:bg-black hover:text-white text-black px-4 py-1 text-xs uppercase tracking-wider transition-colors"
                        >
                          Modificar Stock
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
