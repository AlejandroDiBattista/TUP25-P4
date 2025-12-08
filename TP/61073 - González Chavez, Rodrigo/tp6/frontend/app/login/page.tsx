"use client"

import {useState} from "react"
import {useRouter} from "next/navigation"
import { useAuthStore } from "../store/useAuthStore"
import {Button} from "../components/ui/button"
import {Input} from "../components/ui/input"
import {Card, CardContent, CardHeader, CardTitle} from "../components/ui/card"
import {Eye, EyeOff} from "lucide-react"
import { toast } from "sonner"
import { iniciarSesionService } from "../services/auth"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const router = useRouter()
    const {iniciarSesion} = useAuthStore()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const data = await iniciarSesionService(email, password)
            iniciarSesion(data.access_token, data.nombre)
            toast.success("Inicio de sesión exitoso")
            router.push("/")
        } catch (error) {
            console.error("Error al iniciar sesión", error)
            toast.error("Email o contraseña incorrectos")
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <Card className="w-[500px]">
                <CardHeader>
                    <CardTitle>
                        Iniciar Sesión
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                        <div className="relative">
                            <Input
                                placeholder="Contraseña"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        <Button type="submit" className="w-full" >
                            Iniciar Sesión
                        </Button>
                    </form>
                    <p className="text-sm mt-4 text-center">
                        ¿No tenés cuenta? {""}
                        <a href="/register" className="text-black-600 hover:underline">
                        Registrate
                        </a>
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}

