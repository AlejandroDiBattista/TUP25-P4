'use client';

import { useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';

interface ToastProps {
  mensaje: string;
  onClose: () => void;
  duracion?: number;
}

export default function Toast({ mensaje, onClose, duracion = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duracion);

    return () => clearTimeout(timer);
  }, [onClose, duracion]);

  return (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 animate-in zoom-in-95 duration-300">
      <div className="bg-green-600 text-white px-8 py-6 rounded-lg shadow-2xl flex items-center gap-4 min-w-[350px]">
        <CheckCircle className="h-8 w-8 flex-shrink-0" />
        <p className="flex-1 font-medium text-lg">{mensaje}</p>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}
