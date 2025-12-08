import { CarritoRead, CompraRead, FinalizarCompraRequest, ItemCarritoCreate, Producto, UsuarioCreate, UsuarioRead } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function getProductos(query?: string, categoria?: string): Promise<Producto[]> {
    const params = new URLSearchParams();
    if (query) params.append("q", query);
    if (categoria) params.append("categoria", categoria);

    const res = await fetch(`${API_URL}/productos?${params.toString()}`);

    if (!res.ok) {
        throw new Error("Error al obtener los productos");
    }

    const productos: Producto[] = await res.json();
    return productos.map(p => ({ ...p, imagen: `${API_URL}/${p.imagen}` }));
}

export async function registrarUsuario(usuario: UsuarioCreate): Promise<UsuarioRead> {
    const res = await fetch(`${API_URL}/registrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(usuario),
    });
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Error al registrar usuario");
    }
    return res.json();
}

export async function iniciarSesion(email: string, password: string): Promise<{ access_token: string }> {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const res = await fetch(`${API_URL}/iniciar-sesion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
    });
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Error al iniciar sesión");
    }
    return res.json();
}

export async function getMiPerfil(token: string): Promise<UsuarioRead> {
    const res = await fetch(`${API_URL}/usuarios/me`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Sesión inválida");
    return res.json();
}

// --- Carrito ---

function procesarRespuestaCarrito(carrito: CarritoRead): CarritoRead {
    if (carrito && carrito.items) {
        carrito.items.forEach(item => {
            if (item.producto && item.producto.imagen && !item.producto.imagen.startsWith('http')) {
                item.producto.imagen = `${API_URL}/${item.producto.imagen}`;
            }
        });
    }
    return carrito;
}

export async function getCarrito(token: string): Promise<CarritoRead> {
    const res = await fetch(`${API_URL}/carrito`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Error al obtener el carrito");
    const carrito = await res.json();
    return procesarRespuestaCarrito(carrito);
}

export async function agregarAlCarrito(item: ItemCarritoCreate, token: string): Promise<CarritoRead> {
    const res = await fetch(`${API_URL}/carrito`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(item),
    });
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Error al agregar al carrito");
    }
    const carrito = await res.json();
    return procesarRespuestaCarrito(carrito);
}

export async function quitarDelCarrito(productoId: number, token: string): Promise<CarritoRead> {
    const res = await fetch(`${API_URL}/carrito/${productoId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Error al quitar del carrito");
    }
    const carrito = await res.json();
    return procesarRespuestaCarrito(carrito);
}

export async function cancelarCompra(token: string): Promise<void> {
    const res = await fetch(`${API_URL}/carrito/cancelar`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Error al cancelar la compra");
    }
    // No hay cuerpo de respuesta para el código 204
}

// --- Compras ---

export async function finalizarCompra(data: FinalizarCompraRequest, token: string): Promise<CompraRead> {
    const res = await fetch(`${API_URL}/carrito/finalizar`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Error al finalizar la compra");
    }
    return res.json();
}

export async function getMisCompras(token: string): Promise<CompraRead[]> {
    const res = await fetch(`${API_URL}/compras`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Error al obtener el historial de compras");
    return res.json();
}

export async function getCompraPorId(id: number, token: string): Promise<CompraRead> {
    const res = await fetch(`${API_URL}/compras/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Error al obtener el detalle de la compra");
    }
    return res.json();
}