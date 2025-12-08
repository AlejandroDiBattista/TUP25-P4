'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AuthModal({ open, onClose }: AuthModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md backdrop-blur-md">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-semibold text-sky-700">
            Iniciá sesión para continuar
          </DialogTitle>
        </DialogHeader>

        <p className="text-center text-gray-600 mb-4">
          Para agregar productos al carrito necesitás iniciar sesión o crear una cuenta.
        </p>

        {/* Botones centrados y simétricos */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
          <Button
            onClick={() => (window.location.href = '/login')}
            className="bg-sky-600 hover:bg-sky-700 text-white px-6 flex-1 sm:flex-none"
          >
            Iniciar sesión
          </Button>

          <Button
            onClick={() => (window.location.href = '/registrar')}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 flex-1 sm:flex-none"
          >
            Crear cuenta
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

