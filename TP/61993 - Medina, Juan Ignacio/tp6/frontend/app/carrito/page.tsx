'use client';

import { useEffect, useState } from 'react';
import { CarritoItem } from '../types';
import { obtenerCarrito, quitarDelCarrito } from '../services/carrito';
import CarritoItemComponent from '../components/CarritoItem';
import { useRouter } from 'next/navigation';

export default function CarritoPage() {
  const [carrito, setCarrito] = useState<CarritoItem[]>([]);
  const router = useRouter();
  const token = localStorage.getItem('token') || '';

  useEffect(() => {
    if (!token) return router.push('/login');
    obtenerCarrito(token).then(setCarrito);
  }, [token]);

  async function handleQuitar(id: number) {
    await quitarDelCarrito(token, id);
    setCarrito(carrito.filter(item => item.producto.id !== id));
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Carrito</h2>
      {carrito.length === 0 ? <p>Carrito vacío</p> :
        carrito.map(item => <CarritoItemComponent key={item.producto.id} item={item} onQuitar={handleQuitar} />)}
    </div>
  );
}
