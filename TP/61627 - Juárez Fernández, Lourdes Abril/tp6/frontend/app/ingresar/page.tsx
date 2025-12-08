"use client"
import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { LogIn, Mail, Lock } from 'lucide-react'

export default function IngresarPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setCargando(true)

    try {
      const response = await fetch('http://127.0.0.1:8000/iniciar-sesion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      if (!response.ok) {
        throw new Error('Credenciales incorrectas')
      }

      const data = await response.json()
      localStorage.setItem('token', data.access_token)
      localStorage.setItem('nombre', data.nombre)
      window.location.href = '/'
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <Card className="w-full max-w-md border-pink-100 shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-12 h-12 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <LogIn className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">Iniciar sesión</CardTitle>
          <CardDescription>
            Ingresa con tu cuenta para continuar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              {cargando ? 'Ingresando...' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex-col space-y-2">
          <div className="text-sm text-center text-gray-600">
            ¿No tienes cuenta?{' '}
            <Link href="/crear-cuenta" className="text-pink-600 hover:underline font-medium">
              Regístrate
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
