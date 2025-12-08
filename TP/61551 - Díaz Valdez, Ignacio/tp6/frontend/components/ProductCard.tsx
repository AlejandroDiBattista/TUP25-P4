"use client";
import { Producto } from '../lib/api';
import { useCart } from '../context/CartContext';
import { useState } from 'react';

export default function ProductCard({ producto }: { producto: Producto }) {
  const { add } = useCart();
  const [adding, setAdding] = useState(false);
  const handleAdd = async () => {
    try {
      setAdding(true);
      await add(producto.id, 1);
    } catch (e) {
      console.error(e);
    } finally {
      setAdding(false);
    }
  };
  return (
    <div className="border rounded p-3 flex flex-col gap-2">
      <h2 className="font-medium">{producto.titulo}</h2>
      <p className="text-sm text-gray-600 line-clamp-3">{producto.descripcion}</p>
      <p className="font-semibold">${producto.precio}</p>
      <button disabled={adding} onClick={handleAdd} className="bg-indigo-600 disabled:opacity-50 text-white rounded px-3 py-1 text-sm">
        {adding ? 'Agregando...' : 'Agregar'}
      </button>
    </div>
  );
}
