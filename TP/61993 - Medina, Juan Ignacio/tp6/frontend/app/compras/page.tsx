'use client';

import { useEffect, useState } from 'react';
import { Compra } from '../types';
import { useRouter } from 'next/navigation';

export default function ComprasPage() {
  const [compras, setCompras] = useState<Compra[]>([]);
  const router = useRouter();
  const token = localStorage.getItem('token') || '';

  useEffect(() => {
    if (!token) return router.push('/login');
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/compras`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.json()).then(setCompras);
  }, [token]);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Historial de Compras</h2>
      {compras.length === 0 ? <p>No hay compras realizadas</p> :
        compras.map(c => (
          <div key={c.id} className="border p-3 mb-2 cursor-pointer" onClick={() => router.push(`/compras/${c.id}`)}>
            <span>Compra #{c.id} - ${c.total} - {c.fecha}</span>
          </div>
        ))}
    </div>
  );
}
