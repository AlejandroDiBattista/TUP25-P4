"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '../components/ToastProvider'

export default function RegisterPage() {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const toast = useToast()
  const router = useRouter()
  const [duplicateEmail, setDuplicateEmail] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const res = await fetch(base + '/registrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, password }),
      })
      if (!res.ok) {
        let body = ''
        try { body = JSON.stringify(await res.json()) } catch (_) { body = await res.text().catch(() => '') }
        throw new Error(`Error registrando: ${res.status} ${body}`)
      }
  toast.show('Registro exitoso. Ahora podés ingresar.', 'success')
      router.push('/login')
    } catch (e: any) {
      const msg = (e?.message || e || '').toString()
      
      if (msg.includes('Email ya registrado') || msg.toLowerCase().includes('email')) {
        toast.show('Email ya registrado. ¿Querés iniciar sesión?', 'info', { label: 'Iniciar sesión', href: '/login' })
        setDuplicateEmail(true)
      } else {
        toast.show('Error: ' + msg, 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-semibold mb-4">Crear cuenta</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm">Nombre</label>
          <input className="mt-1 w-full border px-3 py-2 rounded" value={nombre} onChange={e => setNombre(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm">Email</label>
          <input className="mt-1 w-full border px-3 py-2 rounded" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm">Password</label>
          <input type="password" className="mt-1 w-full border px-3 py-2 rounded" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>{loading ? 'Registrando...' : 'Crear cuenta'}</button>
        </div>
      </form>
      {duplicateEmail && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <div className="text-sm text-yellow-800">El email ya está registrado.</div>
          <a href="/login" className="text-sm text-blue-600 hover:underline">Ir a Iniciar sesión</a>
        </div>
      )}
    </div>
  )
}
