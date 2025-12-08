import Link from 'next/link'
import { useState, useEffect } from 'react'
import { fetchMe } from '../lib/api'

function decodeToken(token) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(typeof atob === 'function' ? atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    }).join('') : '')
    return JSON.parse(jsonPayload)
  } catch (err) {
    return null
  }
}

export default function Navbar(){
  // Start with no user on server render to keep SSR output deterministic.
  const [displayName, setDisplayName] = useState(null)

  useEffect(() => {
    try {
      const token = (localStorage.getItem('authToken') || localStorage.getItem('token')) || null
      if (!token) {
        setDisplayName(null)
        return
      }
      // Prefer server-backed user info when available
      fetchMe().then(res => {
        if (res && res.nombre) setDisplayName(res.nombre)
        else {
          // fallback to token decode
          const user = decodeToken(token)
          const name = user?.name || user?.username || user?.sub || null
          setDisplayName(name)
        }
      }).catch(err => {
        const user = decodeToken(token)
        const name = user?.name || user?.username || user?.sub || null
        setDisplayName(name)
      })
    } catch (e) {
      setDisplayName(null)
    }
  }, [])

  function handleLogout(){
    if (typeof window !== 'undefined'){
      localStorage.removeItem('token')
      localStorage.removeItem('authToken')
      window.location.href = '/'
    }
  }

  return (
    <nav className="bg-white shadow-sm">
      <div className="container flex items-center justify-between h-14">
        <Link href="/" className="font-bold text-emerald-700">Mi E-commerce</Link>
        <div className="flex items-center gap-4">
          <Link href="/cart" className="text-sm text-slate-700 hover:text-emerald-600">Carrito</Link>
          {displayName ? (
            <>
              <span className="text-sm text-slate-700">Hola, {displayName}</span>
              <button onClick={handleLogout} className="text-sm text-slate-700 hover:text-emerald-600">Cerrar sesión</button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-slate-700 hover:text-emerald-600">Ingresar</Link>
              <Link href="/register" className="text-sm text-slate-700 hover:text-emerald-600">Registrarse</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
