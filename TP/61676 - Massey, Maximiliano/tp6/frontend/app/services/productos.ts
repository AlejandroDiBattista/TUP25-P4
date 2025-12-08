import { API_URL } from '../config';
import { Producto } from '../types';

export type { Producto };

interface FiltrosProductos {
    search?: string;
    categoria?: string;
}

export async function obtenerProductos(filtros?: FiltrosProductos): Promise<Producto[]> {
    // Construir query params
    const params = new URLSearchParams();
    if (filtros?.search) params.append('search', filtros.search);
    if (filtros?.categoria) params.append('categoria', filtros.categoria);
    
    const url = `${API_URL}/productos${params.toString() ? '?' + params.toString() : ''}`;
    
    // Primero intentamos obtener datos del backend
    try {
        const response = await fetch(url, {
            cache: 'no-store',
            headers: {
                'Content-Type': 'application/json'
            },
            signal: AbortSignal.timeout(3000) // Timeout de 3 segundos
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Datos obtenidos del backend:', data.length, 'productos');
        return data;
    } catch (error) {
        console.log('⚠️ Backend no disponible, usando datos de ejemplo');
        // Datos de ejemplo mientras solucionamos el backend
        return [
            {
                id: 1,
                nombre: "Mochila Fjallraven Foldsack",
                descripcion: "Mochila resistente para uso diario con funda acolchada para laptop de 15 pulgadas.",
                precio: 109.95,
                categoria: "Ropa de hombre",
                existencia: 5,
                imagen: "https://via.placeholder.com/300x300/3b82f6/ffffff?text=Mochila"
            },
            {
                id: 2,
                nombre: "Camiseta ajustada premium",
                descripcion: "Camiseta entallada de mangas raglán, tejido ligero y cómodo para estilo casual.",
                precio: 22.30,
                categoria: "Ropa de hombre",
                existencia: 4,
                imagen: "https://via.placeholder.com/300x300/10b981/ffffff?text=Camiseta"
            },
            {
                id: 3,
                nombre: "Chaqueta algodón hombre",
                descripcion: "Chaqueta ligera de algodón para hombre, ideal para actividades al aire libre en clima frío.",
                precio: 55.99,
                categoria: "Ropa de hombre",
                existencia: 4,
                imagen: "https://via.placeholder.com/300x300/f59e0b/ffffff?text=Chaqueta"
            },
            {
                id: 4,
                nombre: "Prenda casual entallada",
                descripcion: "Prenda casual entallada para hombre con ajuste cómodo, verifica tallas antes de comprar.",
                precio: 15.99,
                categoria: "Ropa de hombre",
                existencia: 5,
                imagen: "https://via.placeholder.com/300x300/8b5cf6/ffffff?text=Prenda"
            }
        ];
    }
}

export async function obtenerProducto(id: number): Promise<Producto | null> {
    try {
        const response = await fetch(`${API_URL}/productos/${id}`, {
            cache: 'no-store',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error al obtener producto ${id}:`, error);
        return null;
    }
}
