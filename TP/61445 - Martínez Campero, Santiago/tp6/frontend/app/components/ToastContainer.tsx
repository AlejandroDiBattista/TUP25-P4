'use client';

import { useEffect } from 'react';
import { Toast, useToast } from '@/app/hooks/useToast';

interface ToastItemProps {
  toast: Toast;
}

function ToastItem({ toast }: ToastItemProps) {
  const { removerToast } = useToast();

  useEffect(() => {
    if (toast.duracion && toast.duracion > 0) {
      const timer = setTimeout(() => removerToast(toast.id), toast.duracion);
      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.duracion, removerToast]);

  const bgColor = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  }[toast.type];

  const icon = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️',
  }[toast.type];

  return (
    <div className={`flex items-center gap-3 p-4 border rounded-lg ${bgColor} animate-in slide-in-from-top-2 duration-300`}>
      <span className="text-lg">{icon}</span>
      <div className="flex-1">
        <p className="text-sm font-medium">{toast.mensaje}</p>
      </div>
      <button
        onClick={() => removerToast(toast.id)}
        className="ml-2 text-lg leading-none opacity-70 hover:opacity-100"
      >
        ✕
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md pointer-events-none">
      {toasts.map(toast => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} />
        </div>
      ))}
    </div>
  );
}
