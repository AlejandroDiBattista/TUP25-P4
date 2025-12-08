"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'

type AuthContextType = {
  token: string | null
  setToken: (t: string | null) => void
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  setToken: () => {},
  logout: async () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null)

  useEffect(() => {
    // re-hydrate from localStorage on mount
    if (typeof window !== 'undefined') {
      const t = window.localStorage.getItem('token')
      if (t) setTokenState(t)

      // listen for storage events from other tabs
      const onStorage = (e: StorageEvent) => {
        if (e.key === 'token') setTokenState(e.newValue)
      }
      // listen for custom auth event dispatched after login
      const onAuthEvent = (e: Event) => {
        try {
          const detail = (e as CustomEvent).detail
          if (detail && detail.token) setTokenState(detail.token)
        } catch (_) {}
      }
      window.addEventListener('storage', onStorage)
      window.addEventListener('tp6:auth', onAuthEvent as EventListener)
      return () => {
        window.removeEventListener('storage', onStorage)
        window.removeEventListener('tp6:auth', onAuthEvent as EventListener)
      }
    }
  }, [])

  const setToken = (t: string | null) => {
    try {
      if (typeof window !== 'undefined') {
        if (t) window.localStorage.setItem('token', t)
        else window.localStorage.removeItem('token')
      }
    } catch (_) {}
    setTokenState(t)
  }

  const logout = async () => {
    if (!token) return
    try {
      await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000') + '/cerrar-sesion', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
    } catch (_) {}
    setToken(null)
    // signal other tabs
    if (typeof window !== 'undefined') window.dispatchEvent(new StorageEvent('storage', { key: 'token', newValue: null, oldValue: token }))
  }

  return (
    <AuthContext.Provider value={{ token, setToken, logout }}>{children}</AuthContext.Provider>
  )
}
