"use client"
import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { UserPlus, Mail, Lock, User } from 'lucide-react'

export default function CrearCuentaPage() {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [exito, setExito] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setCargando(true)

    try {
      const response = await fetch('http://127.0.0.1:8000/registrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, password })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || 'Error al registrar')
      }

      const loginResponse = await fetch('http://127.0.0.1:8000/iniciar-sesion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      if (loginResponse.ok) {
        const loginData = await loginResponse.json()
        localStorage.setItem('token', loginData.access_token)
        localStorage.setItem('nombre', loginData.nombre)
      }

      setExito(true)
      setTimeout(() => {
        window.location.href = '/'
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear cuenta')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <Card className="w-full max-w-md border-pink-100 shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-12 h-12 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <UserPlus className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">Crear cuenta</CardTitle>
          <CardDescription>
            Completa los datos para registrarte
          </CardDescription>
        </CardHeader>
        <CardContent>
          {exito ? (
            <div className="text-center py-8 space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-semibold text-green-600">¡Cuenta creada!</p>
                <p className="text-sm text-gray-600 mt-1">Redirigiendo al inicio de sesión...</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="nombre"
                    type="text"
                    placeholder="Tu nombre completo"
                    className="pl-10"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
              </div>
              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                  {error}
                </div>
              )}
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                disabled={cargando}
              >
                {cargando ? 'Creando cuenta...' : 'Crear cuenta'}
              </Button>
            </form>
          )}
        </CardContent>
        {!exito && (
          <CardFooter className="flex-col space-y-2">
            <div className="text-sm text-center text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <Link href="/ingresar" className="text-pink-600 hover:underline font-medium">
                Inicia sesión
              </Link>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
