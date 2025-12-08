import { notFound } from 'next/navigation';
import Image from 'next/image';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default async function ProductPage({ params }: { params: { id: string } }) {
  const res = await fetch(`${API_URL}/productos/${params.id}`, { cache: 'no-store' });
  if (!res.ok) {
    notFound();
  }
  const producto = await res.json();

  const title = producto.titulo ?? producto.nombre ?? 'Producto';

  return (
    <div className="max-w-4xl mx-auto py-10">
      <div className="bg-white rounded-lg shadow p-6 flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/2 h-96 relative bg-gray-100">
          <Image src={`${API_URL}/${producto.imagen}`} alt={title} fill className="object-contain p-6" unoptimized />
        </div>
        <div className="w-full md:w-1/2">
          <h1 className="text-2xl font-bold mb-2">{title}</h1>
          <p className="text-gray-700 mb-4">{producto.descripcion}</p>
          <p className="text-xl font-semibold text-blue-600 mb-2">${producto.precio}</p>
          <p className="text-sm text-gray-500 mb-4">Stock: {producto.existencia}</p>
          <AddToCartForm producto={producto} />
        </div>
      </div>
    </div>
  );
}

function AddToCartForm({ producto }: any) {
  'use client';
  const addToCart = (cantidad: number) => {
    const key = 'tp6_cart';
    const raw = localStorage.getItem(key);
    let cart = raw ? JSON.parse(raw) : [];
    const existing = cart.find((i: any) => i.producto_id === producto.id);
    if (existing) existing.cantidad += cantidad; else cart.push({ producto_id: producto.id, cantidad });
    localStorage.setItem(key, JSON.stringify(cart));
    alert('Agregado al carrito');
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={() => addToCart(1)}>Agregar 1</button>
        <button className="px-4 py-2 bg-gray-200 rounded" onClick={() => addToCart(5)}>Agregar 5</button>
      </div>
    </div>
  );
}
