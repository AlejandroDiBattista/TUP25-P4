'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [contraseña, setContraseña] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, register, isAuthenticated } = useAuth()
  const router = useRouter()

  if (isAuthenticated) {
    router.push('/')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (isLogin) {
        await login(email, contraseña)
      } else {
        await register(nombre, email, contraseña)
      }
      router.push('/')
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Error al procesar la solicitud')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isLogin ? 'Iniciar Sesión' : 'Registrarse'}</CardTitle>
          <CardDescription>
            {isLogin
              ? 'Ingresa tus credenciales para continuar'
              : 'Crea una cuenta nueva'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contraseña">Contraseña</Label>
              <Input
                id="contraseña"
                type="password"
                value={contraseña}
                onChange={(e) => setContraseña(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin
                ? '¿No tienes cuenta? Regístrate'
                : '¿Ya tienes cuenta? Inicia sesión'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

