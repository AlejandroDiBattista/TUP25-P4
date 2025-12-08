'use client';

import { useEffect, useState } from 'react';
import { Compra } from '../../types';
import { useParams } from 'next/navigation';

export default function CompraDetallePage() {
  const [compra, setCompra] = useState<Compra | null>(null);
  const params = useParams();
  const token = localStorage.getItem('token') || '';
  const id = params.id;

  useEffect(() => {
    if (!token) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/compras/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.json()).then(setCompra);
  }, [id, token]);

  if (!compra) return <p>Cargando...</p>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Detalle Compra #{compra.id}</h2>
      <p>Fecha: {compra.fecha}</p>
      <p>Dirección: {compra.direccion}</p>
      <p>Total: ${compra.total}</p>
      <div className="mt-4">
        {compra.items.map(item => (
          <div key={item.producto_id} className="flex justify-between border-b py-2">
            <span>{item.nombre}</span>
            <span>Cantidad: {item.cantidad}</span>
            <span>${item.precio_unitario}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
