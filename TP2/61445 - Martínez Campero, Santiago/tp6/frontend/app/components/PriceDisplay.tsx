'use client';

interface PriceDisplayProps {
  precio: number;
  precioOriginal?: number;
  mostrarMoneda?: boolean;
}

export default function PriceDisplay({ 
  precio, 
  precioOriginal,
  mostrarMoneda = true 
}: PriceDisplayProps) {
  const descuento = precioOriginal 
    ? Math.round(((precioOriginal - precio) / precioOriginal) * 100)
    : 0;

  return (
    <div className="flex items-baseline gap-3">
      <span className="text-3xl font-bold text-primary">
        {mostrarMoneda ? '$' : ''}{precio.toFixed(2)}
      </span>
      {precioOriginal && precioOriginal > precio && (
        <>
          <span className="text-lg text-gray-500 line-through">
            ${precioOriginal.toFixed(2)}
          </span>
          <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
            -{descuento}%
          </span>
        </>
      )}
    </div>
  );
}
