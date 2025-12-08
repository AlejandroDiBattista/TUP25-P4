"use client";

import { Producto } from '../app/types';
import Image from "next/image";
import { Button } from './button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './card';
import { Badge } from './badge';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../app/context/AuthContext';
import { agregarAlCarrito } from '../app/services/carrito';

interface ProductoCardProps {
  producto: Producto;
}

export default function ProductoCard({ producto }: ProductoCardProps) {
  
  const { isLoggedIn, token } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null); // <-- 1. NUEVO ESTADO DE ÉXITO

  const hayStock = producto.existencia > 0;
  
  const imageId = String(producto.id).padStart(4, '0');
  const imageUrl = `http://localhost:8000/imagenes/${imageId}.png`;

  const handleAddToCart = async () => {
    setError(null);
    setSuccess(null); // <-- 2. Reseteamos los mensajes
    
    if (!isLoggedIn || !token) {
      alert("Debes iniciar sesión para agregar productos al carrito.");
      router.push('/login');
      return;
    }

    setIsLoading(true);
    try {
      await agregarAlCarrito(
        {
          producto_id: producto.id,
          cantidad: 1,
        },
        token
      );
      
      // alert(`¡"${producto.nombre}" fue agregado al carrito!`); // <-- 3. ELIMINAMOS EL ALERT
      
      setSuccess("¡Agregado al carrito!"); // <-- 4. USAMOS EL ESTADO DE ÉXITO
      
      router.refresh(); // <-- 5. Refrescamos el stock (esto ahora sí se ejecuta)

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ocurrió un error desconocido.");
      }
    } finally {
      setIsLoading(false); // <-- 6. Esto ahora se ejecuta inmediatamente
    }
  };

  return (
    <Card className="flex flex-col justify-between overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="p-0">
        <div className="relative h-64 w-full">
          <Image
            src={imageUrl}
            alt={producto.nombre}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-contain p-4"
            unoptimized={true}
          />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
          {producto.nombre}
        </CardTitle>
        <p className="text-sm text-gray-600 mb-3 line-clamp-3">
          {producto.descripcion}
        </p>
         <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {producto.categoria}
         </span>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-4 p-4">
        <div className="flex justify-between items-center w-full">
            <span className="text-2xl font-bold text-blue-600">
              ${producto.precio.toFixed(2)}
            </span>
            {hayStock ? (
              <Badge variant="default">En Stock ({producto.existencia})</Badge>
            ) : (
              <Badge variant="destructive">Agotado</Badge>
            )}
        </div>
        
        <Button
          className="w-full"
          disabled={!hayStock || isLoading}
          onClick={handleAddToCart}
        >
          {isLoading 
            ? "Agregando..." 
            : (hayStock ? "Agregar al Carrito" : "Sin Stock")
          }
        </Button>

        {/* --- 7. MOSTRAMOS ÉXITO O ERROR --- */}
        {error && (
          <p className="text-red-500 text-sm mt-2">{error}</p>
        )}
        {success && (
          <p className="text-green-500 text-sm mt-2">{success}</p>
        )}
      </CardFooter>
    </Card>
  );
}