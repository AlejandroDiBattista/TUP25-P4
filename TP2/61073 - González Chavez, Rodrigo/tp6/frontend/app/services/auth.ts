const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export async function registrarUsuario(nombre: string, email: string, password: string) {
    const response = await fetch(`${API_URL}/registrar`, {
        "method": "POST",
        "headers": {"Content-Type": "application/json"},
        "body": JSON.stringify({nombre, email, password})
    })

    if (!response.ok)
        throw new Error("Error al registrar usuario")

    return response.json()
}

export async function iniciarSesionService(email: string, password: string) {
    const response = await fetch(`${API_URL}/iniciar-sesion`, {
        "method": "POST",
        "headers": {"Content-Type": "application/json"},
        "body": JSON.stringify({email, password})
    })

    if (!response.ok) throw new Error("Credenciales Inválidas")

    return response.json()
}

export async function cerrarSesion(token: string) {
    const response = await fetch(`${API_URL}/cerrar-sesion`, {
        "method": "POST",
        "headers": {Authorization: `Bearer ${token}`}
    })

    if (!response.ok)
        throw new Error("Error al cerrar sesión")

    return response.json()
}
