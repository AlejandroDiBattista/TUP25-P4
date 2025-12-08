'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Minus, Plus, ShoppingCart, ArrowLeft } from 'lucide-react';
import { Producto } from '@/app/types';
import Toast from '@/app/components/Toast';
import { useCart } from '@/app/context/CartContext';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { agregarAlCarrito } = useCart();
  const [producto, setProducto] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);
  const [cantidad, setCantidad] = useState(1);
  const [mostrarToast, setMostrarToast] = useState(false);

  useEffect(() => {
    cargarProducto();
  }, [params.id]);

  const cargarProducto = async () => {
    try {
      const response = await fetch(`http://localhost:8000/productos/${params.id}`);
      
      if (!response.ok) {
        throw new Error('Producto no encontrado');
      }
      
      const data = await response.json();
      setProducto(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const incrementarCantidad = () => {
    if (producto && cantidad < producto.existencia) {
      setCantidad(cantidad + 1);
    }
  };

  const decrementarCantidad = () => {
    if (cantidad > 1) {
      setCantidad(cantidad - 1);
    }
  };

  const handleAgregarAlCarrito = async () => {
    if (producto) {
      try {
        // Llamar al backend para descontar stock
        const response = await fetch('http://localhost:8000/carrito/agregar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            producto_id: producto.id,
            cantidad: cantidad
          })
        });

        if (!response.ok) {
          const error = await response.json();
          alert(error.detail || 'Error al agregar al carrito');
          return;
        }

        // Si todo está bien, agregar al carrito localmente
        agregarAlCarrito(producto, cantidad);
        setMostrarToast(true);
        
        // Actualizar el producto con el nuevo stock
        const data = await response.json();
        setProducto({ ...producto, existencia: data.stock_restante });
        setCantidad(1);
      } catch (error) {
        console.error('Error:', error);
        alert('Error al agregar al carrito');
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-center text-gray-500">Cargando producto...</p>
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-center text-red-500">Producto no encontrado</p>
        <div className="text-center mt-4">
          <Button onClick={() => router.push('/products')}>
            Volver a productos
          </Button>
        </div>
      </div>
    );
  }

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Toast de confirmación */}
      {mostrarToast && (
        <Toast
          mensaje={`¡${cantidad} ${cantidad === 1 ? 'producto agregado' : 'productos agregados'} al carrito!`}
          onClose={() => setMostrarToast(false)}
        />
      )}

      {/* Botón volver */}
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => router.push('/products')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver a productos
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Imagen del producto */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="relative aspect-square">
            <Image
              src={`${API_URL}/${producto.imagen}`}
              alt={producto.titulo}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain"
              unoptimized
            />
          </div>
        </div>

        {/* Información del producto */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="mb-4">
            <span className="inline-block bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full">
              {producto.categoria}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {producto.titulo}
          </h1>

          <div className="flex items-center gap-2 mb-6">
            <div className="flex items-center">
              <span className="text-yellow-500 text-xl">★</span>
              <span className="ml-1 text-lg font-semibold">{producto.valoracion}</span>
            </div>
            <span className="text-gray-400">|</span>
            <span className="text-gray-600">
              {producto.existencia > 0 
                ? `${producto.existencia} disponibles` 
                : 'Sin stock'}
            </span>
          </div>

          <p className="text-gray-700 text-lg mb-6 leading-relaxed">
            {producto.descripcion}
          </p>

          <div className="mb-8">
            <p className="text-4xl font-bold text-blue-600">
              ${producto.precio.toFixed(2)}
            </p>
          </div>

          {/* Selector de cantidad */}
          {producto.existencia > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cantidad
              </label>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={decrementarCantidad}
                  disabled={cantidad <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-2xl font-semibold min-w-[3rem] text-center">
                  {cantidad}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={incrementarCantidad}
                  disabled={cantidad >= producto.existencia}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Botón agregar al carrito */}
          <Button
            className="w-full"
            size="lg"
            onClick={handleAgregarAlCarrito}
            disabled={producto.existencia === 0}
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            {producto.existencia > 0 ? 'Agregar al carrito' : 'Sin stock'}
          </Button>

          {producto.existencia > 0 && producto.existencia < 10 && (
            <p className="text-sm text-orange-600 mt-4">
              ¡Quedan pocas unidades!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
