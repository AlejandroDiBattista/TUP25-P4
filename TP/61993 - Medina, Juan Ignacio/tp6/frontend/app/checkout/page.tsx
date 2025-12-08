'use client';

import { useState } from 'react';
import { finalizarCompra } from '../services/carrito';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const [direccion, setDireccion] = useState('');
  const [tarjeta, setTarjeta] = useState('');
  const router = useRouter();
  const token = localStorage.getItem('token') || '';

  async function handleFinalizar(e: React.FormEvent) {
    e.preventDefault();
    try {
      await finalizarCompra(token, direccion, tarjeta);
      alert('Compra realizada con éxito');
      router.push('/compras');
    } catch {
      alert('Error al finalizar compra');
    }
  }

  return (
    <div className="min-h-screen flex justify-center items-center">
      <form onSubmit={handleFinalizar} className="bg-white p-6 rounded shadow-md w-80">
        <h2 className="text-xl font-bold mb-4">Finalizar Compra</h2>
        <input type="text" placeholder="Dirección" value={direccion} onChange={e => setDireccion(e.target.value)}
          className="w-full border p-2 mb-3 rounded" required />
        <input type="text" placeholder="Número de tarjeta" value={tarjeta} onChange={e => setTarjeta(e.target.value)}
          className="w-full border p-2 mb-3 rounded" required />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">Pagar</button>
      </form>
    </div>
  );
}
