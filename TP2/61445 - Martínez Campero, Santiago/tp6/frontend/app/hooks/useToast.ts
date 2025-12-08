'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  mensaje: string;
  duracion?: number;
}

interface ToastContextType {
  toasts: Toast[];
  agregarToast: (mensaje: string, tipo: ToastType, duracion?: number) => void;
  removerToast: (id: string) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider(props: { children: ReactNode }): React.ReactElement {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removerToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const agregarToast = useCallback((mensaje: string, tipo: ToastType = 'info', duracion = 3000) => {
    const id = Date.now().toString();
    const nuevoToast: Toast = { id, mensaje, type: tipo, duracion };
    
    setToasts(prev => [...prev, nuevoToast]);

    if (duracion > 0) {
      setTimeout(() => removerToast(id), duracion);
    }
  }, [removerToast]);

  return React.createElement(
    ToastContext.Provider,
    { value: { toasts, agregarToast, removerToast } },
    props.children
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe usarse dentro de ToastProvider');
  }
  return context;
}
