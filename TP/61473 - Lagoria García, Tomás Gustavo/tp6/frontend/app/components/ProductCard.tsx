'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { Producto } from '../types';

interface ProductCardProps {
  producto: Producto;
  onAddToCart?: (producto: Producto) => void;
}

export function ProductCard({ producto, onAddToCart }: ProductCardProps) {
  const precioFormateado = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(producto.precio);

  const stockBajo = producto.existencia > 0 && producto.existencia <= 5;
  const sinStock = producto.existencia === 0;

  // Construir URL completa de la imagen desde el backend
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const imagenUrl = producto.imagen 
    ? `${API_URL}/${producto.imagen}` 
    : '/placeholder.jpg';

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-300 flex flex-col h-full max-w-sm mx-auto w-full">
      <Link href={`/productos/${producto.id}`} className="flex-1 flex flex-col">
        {/* Imagen */}
        <div className="relative aspect-square overflow-hidden rounded-t-xl bg-gray-100">
          <Image
            src={imagenUrl}
            alt={producto.titulo}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
            unoptimized
          />
          
          {/* Badge de stock */}
          {sinStock && (
            <Badge variant="destructive" className="absolute top-2 right-2">
              Sin stock
            </Badge>
          )}
          {stockBajo && !sinStock && (
            <Badge variant="secondary" className="absolute top-2 right-2 bg-yellow-500 text-white">
              Últimas unidades
            </Badge>
          )}
        </div>

        {/* Contenido */}
        <CardContent className="flex-1 p-4">
          {/* Categoría */}
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            {producto.categoria}
          </p>

          {/* Título */}
          <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
            {producto.titulo}
          </h3>

          {/* Descripción */}
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {producto.descripcion}
          </p>

          {/* Precio */}
          <p className="text-2xl font-bold text-gray-900">
            {precioFormateado}
          </p>

          {/* Stock disponible */}
          <p className="text-xs text-gray-500 mt-1">
            {sinStock ? 'No disponible' : `Stock: ${producto.existencia} unidades`}
          </p>
        </CardContent>
      </Link>

      {/* Footer con botón */}
      <CardFooter className="p-4 pt-0">
        <Button
          onClick={(e) => {
            e.preventDefault();
            onAddToCart?.(producto);
          }}
          disabled={sinStock}
          className="w-full"
          size="sm"
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {sinStock ? 'Sin stock' : 'Agregar al carrito'}
        </Button>
      </CardFooter>
    </Card>
  );
}
