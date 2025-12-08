import { Producto } from '../types';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Star, Package2 } from 'lucide-react';

interface ProductoCardProps {
  producto: Producto;
}

export default function ProductoCard({ producto }: ProductoCardProps) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
      <div className="relative h-64 bg-muted">
        <Image
          src={`${API_URL}/${producto.imagen}`}
          alt={producto.titulo}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-contain p-4"
          unoptimized
        />
      </div>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2 mb-2">
          <Badge variant="secondary" className="text-xs">
            {producto.categoria}
          </Badge>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
            <span className="text-sm font-medium">{producto.valoracion}</span>
          </div>
        </div>
        <CardTitle className="line-clamp-2 text-lg">
          {producto.titulo}
        </CardTitle>
        <CardDescription className="line-clamp-2">
          {producto.descripcion}
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-between items-center pt-3">
        <span className="text-2xl font-bold text-primary">
          ${producto.precio}
        </span>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Package2 className="h-4 w-4" />
          <span>Stock: {producto.existencia}</span>
        </div>
      </CardFooter>
    </Card>
  );
}
