"use client"

import {useState} from "react"
import {useRouter} from "next/navigation"
import { registrarUsuario } from "../services/auth"
import {Button} from "../components/ui/button"
import {Input} from "../components/ui/input"
import {Card, CardContent, CardHeader, CardTitle} from  "../components/ui/card"
import {Eye, EyeOff} from "lucide-react"
import { toast } from "sonner"

export default function RegisterPage() {
    const [nombre, setNombre] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await registrarUsuario(nombre, email, password)
            toast.success("Usuario registrado con éxito")
            router.push("/login")
        } catch {
            toast.error("Error al registrar el usuario")
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <Card className="w-[500px]">
                <CardHeader>
                    <CardTitle>Registro</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <Input placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
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
                        <Button type="submit" className="w-full">Registrarse</Button>
                    </form>
                    <p className="text-sm mt-4 text-center">
                        ¿Ya tenés cuenta? {""}
                        <a href="/login" className="text-black-600 hover:underline">
                            Iniciar Sesión
                        </a>
                    </p>
                </CardContent>
            </Card>
        </div>        
    )
}
