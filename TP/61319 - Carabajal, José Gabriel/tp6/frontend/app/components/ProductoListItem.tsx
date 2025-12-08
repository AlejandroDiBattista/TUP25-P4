'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Producto } from '../types';
import { useAuth } from './AuthProvider';
import { addItem } from '../services/carrito';

interface Props {
    producto: Producto;
    onAdd?: (id: number) => void; 
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export default function ProductoListItem({ producto, onAdd }: Props) {
    const agotado = producto.existencia <= 0;
    const { session } = useAuth();
    const [adding, setAdding] = useState(false);

    async function handleAdd() {
        if (agotado) return;
        if (!session) {
        alert('Inicia sesión para agregar productos al carrito');
        return;
        }
        try {
        setAdding(true);
        await addItem(session.user.id, producto.id, 1);
        onAdd?.(producto.id);
        window.dispatchEvent(new CustomEvent('cart:updated'));
        } finally {
        setAdding(false);
        }
    }

    return (
        <div className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        {/* Imagen */}
        <div className="relative h-28 w-40 shrink-0 bg-gray-100 rounded-md overflow-hidden">
            <Image
            src={`${API_URL}/${producto.imagen}`}
            alt={producto.titulo}
            fill
            className="object-contain"
            unoptimized
            />
        </div>

        {/* Título + descripción */}
        <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
            {producto.titulo}
            </h3>
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
            {producto.descripcion}
            </p>
            <p className="text-xs text-gray-500">Categoría: {producto.categoria}</p>
        </div>

        {/* Precio + stock + botón */}
        <div className="text-right w-40">
            <div className="text-xl font-semibold text-gray-900">{money.format(producto.precio)}</div>
            <div className="text-sm text-gray-600 mt-1">
            {agotado ? (
                <span className="inline-block rounded-md bg-gray-200 text-gray-600 px-2 py-0.5 text-xs">
                Sin stock
                </span>
            ) : (
                <>Disponible: {producto.existencia}</>
            )}
            </div>
            <button
            className={`mt-3 w-full rounded-md px-3 py-2 text-sm font-medium transition
                ${
                agotado || adding
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
            disabled={agotado || adding}
            onClick={handleAdd}
            >
            {agotado ? 'Sin stock' : adding ? 'Agregando…' : 'Agregar al carrito'}
            </button>
        </div>
        </div>
    );
}
