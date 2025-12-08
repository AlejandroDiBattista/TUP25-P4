'use client';

interface RatingProps {
  valoracion: number;
  mostrarNumero?: boolean;
  tamaño?: 'pequeño' | 'medio' | 'grande';
}

export default function Rating({ 
  valoracion, 
  mostrarNumero = true, 
  tamaño = 'medio' 
}: RatingProps) {
  const tamañoMap = {
    pequeño: 'text-sm',
    medio: 'text-base',
    grande: 'text-2xl',
  };

  const estrellas = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= valoracion) {
      estrellas.push(
        <span key={i} className={`${tamañoMap[tamaño]} text-yellow-400`}>
          ★
        </span>
      );
    } else if (i - valoracion < 1) {
      estrellas.push(
        <span key={i} className={`${tamañoMap[tamaño]} text-yellow-400`}>
          ⭐
        </span>
      );
    } else {
      estrellas.push(
        <span key={i} className={`${tamañoMap[tamaño]} text-gray-300`}>
          ★
        </span>
      );
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">{estrellas}</div>
      {mostrarNumero && (
        <span className={`${tamañoMap[tamaño]} text-gray-600 font-medium`}>
          {valoracion.toFixed(1)}
        </span>
      )}
    </div>
  );
}
