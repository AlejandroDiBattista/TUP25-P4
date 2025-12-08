"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '../components/ToastProvider'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const toast = useToast()
  const router = useRouter()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000') + '/iniciar-sesion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        let body = ''
        try { body = JSON.stringify(await res.json()) } catch (_) { body = await res.text().catch(() => '') }
        throw new Error(`Credenciales incorrectas: ${res.status} ${body}`)
      }
      const data = await res.json()
      if (typeof window !== 'undefined' && data.access_token) {
        window.localStorage.setItem('token', data.access_token)
        try { console.log('[DEBUG] login: token saved preview=', data.access_token?.slice?.(0,16)) } catch (_) {}
        try {
          
          window.dispatchEvent(new CustomEvent('tp6:auth', { detail: { token: data.access_token } }))
        } catch (_) {}
      }
      toast.show('Login exitoso. Redirigiendo a Productos...', 'success')
      
      if (typeof window !== 'undefined') {
        window.location.href = '/'
      } else {
        try { router.replace('/') } catch (_) { /* ignore */ }
      }
    } catch (e: any) {
      toast.show('Error: ' + (e?.message || e), 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-semibold mb-4">Ingresar</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm">Email</label>
          <input className="mt-1 w-full border px-3 py-2 rounded" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm">Password</label>
          <input type="password" className="mt-1 w-full border px-3 py-2 rounded" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>{loading ? 'Ingresando...' : 'Ingresar'}</button>
        </div>
      </form>
    </div>
  )
}
