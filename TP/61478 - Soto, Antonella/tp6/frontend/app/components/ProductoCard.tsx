"use client";
import { Producto } from '../types';
import Image from 'next/image';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

interface ProductoCardProps {
  producto: Producto;
  onCartChange?: () => void;
}

export default function ProductoCard({ producto, onCartChange }: ProductoCardProps) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const titulo = (producto as any).titulo || (producto as any).nombre || 'Producto';
  const valoracion = (producto as any).valoracion || 0;
  const existencia = producto.existencia || 0;
  const { addToCart, triggerHighlight } = useCart();
  const { isAuthenticated } = useAuth();
  
  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      triggerHighlight();
      return;
    }
    await addToCart(producto.id, 1);
    if (onCartChange) onCartChange();
  };
  
  return (
    <div className="group bg-slate-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
      <div className="relative h-64 bg-white overflow-hidden">
        <Image
          src={`${API_URL}/${producto.imagen}`}
          alt={titulo}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
          unoptimized
        />
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold text-slate-100 mb-2 line-clamp-2 group-hover:text-cyan-400 transition-colors">
          {titulo}
        </h3>
        <p className="text-sm text-slate-400 mb-4 line-clamp-2">
          {producto.descripcion}
        </p>
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-semibold text-cyan-400 bg-cyan-400/10 px-3 py-1.5 rounded-lg border border-cyan-400/20">
            {producto.categoria}
          </span>
          {valoracion > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-yellow-400">★</span>
              <span className="text-sm text-slate-300 font-medium">{valoracion}</span>
            </div>
          )}
        </div>
        <div className="flex justify-between items-center mb-4">
          <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
            ${producto.precio}
          </span>
          <span className="text-xs text-slate-400 bg-slate-700 px-3 py-1.5 rounded-lg">
            Stock: {existencia}
          </span>
        </div>
        <button 
          onClick={handleAddToCart}
          disabled={existencia === 0}
          className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
            existencia === 0 
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
              : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5'
          }`}
        >
          {existencia === 0 ? 'Agotado' : 'Agregar al carrito'}
        </button>
      </div>
    </div>
  );
}
