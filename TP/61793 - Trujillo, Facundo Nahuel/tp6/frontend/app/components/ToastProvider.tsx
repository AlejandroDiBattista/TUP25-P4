"use client"

import React, { createContext, useContext, useState, useCallback } from 'react'

type ToastType = 'success' | 'error' | 'info'
type ToastAction = { label: string; href?: string }
type Toast = { id: string; message: string; type?: ToastType; action?: ToastAction }

const ToastContext = createContext<{ show: (message: string, type?: ToastType, action?: ToastAction) => void } | undefined>(undefined)

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const show = useCallback((message: string, type: ToastType = 'info', action?: ToastAction) => {
    const id = String(Date.now()) + Math.random().toString(16).slice(2)
    setToasts((t) => [...t, { id, message, type, action }])
    
    setTimeout(() => {
      setToasts((t) => t.filter(x => x.id !== id))
    }, 6000)
  }, [])

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div style={{ position: 'fixed', right: 16, top: 16, zIndex: 9999 }}>
        {toasts.map(t => (
          <div key={t.id} className={`mb-2 max-w-sm w-full px-4 py-2 rounded shadow-lg text-white ${t.type === 'success' ? 'bg-green-600' : t.type === 'error' ? 'bg-red-600' : 'bg-gray-800'}`}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 text-sm">{t.message}</div>
              {t.action && (
                <button
                  onClick={() => {
                    try {
                      if (t.action?.href) window.location.href = t.action.href
                    } catch (_) {}
                  }}
                  className="ml-3 px-3 py-1 bg-white text-gray-900 rounded text-xs"
                >
                  {t.action.label}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export default ToastProvider
