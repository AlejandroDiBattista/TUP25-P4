'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Producto } from '../../types';
import { agregarAlCarrito } from '../../services/carrito';
import { useAuth } from '../../contexts/AuthContext';
import { useCarrito } from '../../contexts/CarritoContext';
import { obtenerProductoPorId } from '../../services/productos';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function ProductoDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { estaLogueado } = useAuth();
  const { agregarItem } = useCarrito();
  
  const [producto, setProducto] = useState<Producto | null>(null);
  const [id, setId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [agregarCargando, setAgregarCargando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');

  // Resolver params y cargar producto
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setId(resolvedParams.id);
    };
    resolveParams();
  }, [params]);

  useEffect(() => {
    if (!id) return;

    const cargarProducto = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await obtenerProductoPorId(id);
        setProducto(data);
      } catch (err: any) {
        setError(err.message || 'Error al cargar el producto');
      } finally {
        setLoading(false);
      }
    };

    cargarProducto();
  }, [id]);

  const handleAgregarAlCarrito = async () => {
    if (!estaLogueado) {
      router.push('/login');
      return;
    }

    if (!producto || cantidad <= 0) return;

    setAgregarCargando(true);
    setError('');
    setMensajeExito('');

    try {
      // Agregar al carrito en el backend
      await agregarAlCarrito(producto.id, cantidad);

      // Crear item temporal para el contexto (sin id ni usuario_id, que vienen del servidor)
      const itemTemporal = {
        id: 0, // Placeholder
        usuario_id: 0, // Placeholder
        producto_id: producto.id,
        cantidad: cantidad,
      };
      
      // Actualizar el contexto local
      agregarItem(itemTemporal, producto);
      
      setMensajeExito(`✓ ${producto.titulo} agregado al carrito`);
      setCantidad(1);
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setMensajeExito(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Error al agregar al carrito');
    } finally {
      setAgregarCargando(false);
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-800 text-lg">Cargando producto...</p>
        </div>
      </div>
    );
  }

  // Error o No encontrado
  if (error || !producto) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-10">
          <h1 className="text-2xl font-bold mb-4">❌ Producto no encontrado</h1>
          <p className="text-gray-800 mb-6">
            {error || 'El producto que buscas no existe'}
          </p>
          <Link href="/productos" className="text-blue-600 hover:underline text-lg font-semibold">
            ← Volver al catálogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        {/* Breadcrumb */}
        <Link 
          href="/productos" 
          className="text-blue-600 hover:underline mb-6 inline-block"
        >
          ← Volver a Productos
        </Link>

        {/* Grid principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-lg shadow-lg p-8">
          
          {/* Imagen */}
          <div className="bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center min-h-96">
            {producto.imagen ? (
              <Image
                src={`${API_URL}/imagenes/${producto.imagen}`}
                alt={producto.titulo}
                width={500}
                height={500}
                className="object-contain p-8 w-full h-full"
                unoptimized
              />
            ) : (
              <span className="text-6xl">📦</span>
            )}
          </div>

          {/* Detalles */}
          <div className="flex flex-col">
            {/* Categoría */}
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full self-start mb-4">
              {producto.categoria}
            </span>

            {/* Título */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {producto.titulo}
            </h1>

            {/* Rating y Stock */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b">
              <div className="flex items-center gap-2">
                <span className="text-yellow-500 text-2xl">★</span>
                <span className="text-lg font-semibold">{producto.valoracion}</span>
              </div>
              <div>
                {producto.existencia > 0 ? (
                  <span className="text-green-600 font-semibold">
                    ✓ En stock ({producto.existencia} disponibles)
                  </span>
                ) : (
                  <span className="text-red-600 font-semibold">❌ Agotado</span>
                )}
              </div>
            </div>

            {/* Descripción */}
            <p className="text-gray-700 mb-6 text-lg leading-relaxed">
              {producto.descripcion}
            </p>

            {/* Precio */}
            <div className="mb-6">
              <p className="text-gray-800 text-sm font-medium mb-2">Precio</p>
              <p className="text-4xl font-bold text-blue-600">
                ${producto.precio.toFixed(2)}
              </p>
            </div>

            {/* Controles de cantidad */}
            <div className="mb-6">
              <p className="text-gray-800 text-sm font-medium mb-2">Cantidad</p>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                  disabled={cantidad <= 1}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  max={producto.existencia}
                  value={cantidad}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (val > 0 && val <= producto.existencia) {
                      setCantidad(val);
                    }
                  }}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center text-black font-semibold"
                />
                <button
                  onClick={() => setCantidad(Math.min(producto.existencia, cantidad + 1))}
                  disabled={cantidad >= producto.existencia}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
                >
                  +
                </button>
              </div>
            </div>

            {/* Mensajes */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            {mensajeExito && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                {mensajeExito}
              </div>
            )}

            {/* Botones */}
            <div className="flex gap-4 mt-auto">
              <button
                onClick={handleAgregarAlCarrito}
                disabled={producto.existencia === 0 || agregarCargando}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {agregarCargando ? 'Agregando...' : '🛒 Agregar al Carrito'}
              </button>
              <Link
                href="/productos"
                className="flex-1 bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-400 transition text-center"
              >
                Seguir Comprando
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}