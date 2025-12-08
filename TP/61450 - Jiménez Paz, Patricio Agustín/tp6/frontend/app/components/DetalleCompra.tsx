'use client';

import { Compra } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { CheckCircle2 } from 'lucide-react';
import Image from 'next/image';

interface DetalleCompraProps {
  compra: Compra;
  mostrarExito?: boolean;
}

export default function DetalleCompra({ compra, mostrarExito = false }: DetalleCompraProps) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calcular subtotal e IVA
  const calcularTotales = () => {
    let subtotal = 0;
    let ivaTotal = 0;
    
    compra.items.forEach(item => {
      subtotal += item.subtotal;
    });
    
    // IVA es la diferencia entre el total y el subtotal
    ivaTotal = compra.total - subtotal;
    
    return { subtotal, iva: ivaTotal };
  };

  const { subtotal, iva } = calcularTotales();

  return (
    <div className="space-y-4">
      {mostrarExito && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 flex items-center gap-4">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">¡Compra Exitosa!</h2>
            <p className="text-gray-600">Tu pedido ha sido procesado correctamente</p>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">Orden #{compra.id}</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {formatearFecha(compra.fecha)}
              </p>
            </div>
            <Badge 
              variant={compra.estado === 'completada' ? 'default' : 'secondary'}
              className="capitalize"
            >
              {compra.estado}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Dirección de Envío</p>
              <p className="font-medium">{compra.direccion}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Productos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {compra.items.map((item, index) => (
              <div key={index} className="flex gap-4 pb-4 border-b last:border-b-0">
                {item.imagen && (
                  <div className="relative w-20 h-20 bg-gray-100 rounded shrink-0">
                    <Image
                      src={`${API_URL}/${item.imagen}`}
                      alt={item.titulo}
                      fill
                      className="object-contain p-2"
                      unoptimized
                    />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-medium text-lg">{item.titulo}</p>
                  <p className="text-sm text-gray-600">Cantidad: {item.cantidad}</p>
                  <p className="text-sm text-gray-600">
                    Precio unitario: ${item.precio_unitario.toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Subtotal</p>
                  <p className="text-lg font-bold">${item.subtotal.toFixed(2)}</p>
                </div>
              </div>
              ))}
              <div className="pt-4 border-t space-y-2">
                <div className="flex justify-between items-center text-gray-700">
                  <span className="text-base">Subtotal</span>
                  <span className="text-base font-semibold">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-gray-700">
                  <span className="text-base">IVA</span>
                  <span className="text-base font-semibold">
                    ${iva.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-xl font-bold">Total</span>
                  <span className="text-2xl font-bold text-blue-600">
                    ${compra.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
