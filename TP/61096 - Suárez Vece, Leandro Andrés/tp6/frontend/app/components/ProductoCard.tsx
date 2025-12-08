import { Button } from '@/components/ui/button';
import { CarritoRead, Producto } from '../types';
import Image from 'next/image';
import { agregarAlCarrito } from '../services/Carrito';

interface ProductoCardProps {
  producto: Producto;
  setCarritoData: React.Dispatch<React.SetStateAction<CarritoRead[]>>;
  carritoData: CarritoRead[];
  setProductos: React.Dispatch<React.SetStateAction<Producto[]>>;
}

export default function ProductoCard({ producto, setCarritoData, carritoData, setProductos }: ProductoCardProps) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const token = localStorage.getItem("token");

  const handleAddToCart = async (producto: Producto) => {

    const IfExist = carritoData.some(item => item.producto.id === producto.id);
    if (IfExist) return;

    try {
      await agregarAlCarrito(token!, producto.id, 1);
      setCarritoData(prev => [
        ...prev,
        { producto, cantidad: 1 }
      ]);

      setProductos(prev => {
        return prev.map(p => {
          if (p.id === producto.id) {
            return {
              ...p,
              existencia: p.existencia - 1
            };
          }
          return p;
        });
      });

    } catch (error) {
      console.error("Error al agregar al carrito:", error);
    }

  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-64 bg-gray-100">
        <Image
          src={`${API_URL}/${producto.imagen}`}
          alt={producto.titulo}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-contain p-4"
          unoptimized
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
          {producto.titulo}
        </h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {producto.descripcion}
        </p>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {producto.categoria}
          </span>
          <div className="flex items-center gap-1">
            <span className="text-yellow-500">★</span>
            <span className="text-sm text-gray-700">{producto.valoracion}</span>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold text-blue-600">
            ${producto.precio}
          </span>
          <span className="text-md text-gray-500">
            Stock: {(producto.existencia >= 1) ? producto.existencia : "Agotado"}
          </span>
        </div>
        <Button
          className="bg-black hover:bg-gray-800 text-white mt-4 w-full"
          onClick={() => handleAddToCart(producto)}
          disabled={!token}
        >
          Agregar al carrito
        </Button>
      </div>
    </div>
  );
}
