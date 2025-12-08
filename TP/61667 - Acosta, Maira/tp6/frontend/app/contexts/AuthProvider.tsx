"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

type Usuario = {
  nombre: string
  email: string
}

type AuthContextType = {
  usuario: Usuario | null
  token: string | null
  login: (email: string, password: string) => Promise<boolean>
  register: (nombre: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const savedToken = localStorage.getItem("token")
      const savedUsuario = localStorage.getItem("usuario")
      
      if (savedToken && savedUsuario && savedUsuario !== "undefined") {
        const parsedUser = JSON.parse(savedUsuario)
        if (parsedUser && parsedUser.email) {
          setToken(savedToken)
          setUsuario(parsedUser)
        } else {
          localStorage.removeItem("token")
          localStorage.removeItem("usuario")
        }
      }
    } catch (error) {
      console.error("Error loading auth data:", error)
      localStorage.removeItem("token")
      localStorage.removeItem("usuario")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const register = async (nombre: string, email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch("http://127.0.0.1:8000/registrar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre,
          email,
          password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setToken(data.access_token)
        setUsuario(data.user)
        localStorage.setItem("token", data.access_token)
        localStorage.setItem("usuario", JSON.stringify(data.user))
        return true
      } else {
        console.error("Error de registro:", data.detail)
        return false
      }
    } catch (error) {
      console.error("Error de conexión:", error)
      return false
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch("http://127.0.0.1:8000/iniciar-sesion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setToken(data.access_token)
        setUsuario(data.user)
        localStorage.setItem("token", data.access_token)
        localStorage.setItem("usuario", JSON.stringify(data.user))
        return true
      } else {
        console.error("Error de login:", data.detail)
        return false
      }
    } catch (error) {
      console.error("Error de conexión:", error)
      return false
    }
  }

  const logout = () => {
    setUsuario(null)
    setToken(null)
    localStorage.removeItem("token")
    localStorage.removeItem("usuario")
  }

  return (
    <AuthContext.Provider value={{ usuario, token, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de AuthProvider")
  }
  return context
}
