// frontend/app/services/productos.ts
import { Producto } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Tipo del producto como viene del backend
interface ProductoBackend {
  id: number;
  titulo: string; // Cambiado de 'nombre' a 'titulo'
  precio: number;
  descripcion?: string;
  categoria?: string;
  valoracion?: number;
  existencia: number;
  imagen?: string;
}

// Mapear respuesta del backend al tipo Producto del frontend
function mapearProducto(productoBackend: ProductoBackend): Producto {
  return {
    id: productoBackend.id,
    nombre: productoBackend.titulo, // Mapear titulo a nombre
    precio: productoBackend.precio,
    descripcion: productoBackend.descripcion,
    categoria: productoBackend.categoria,
    valoracion: productoBackend.valoracion,
    stock: productoBackend.existencia, // Mapear existencia a stock
    imagen: productoBackend.imagen,
  };
}

export async function obtenerProductos(): Promise<Producto[]> {
  const response = await fetch(`${API_URL}/productos/`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Error al obtener productos');
  }

  const data = await response.json();
  return data.map(mapearProducto);
}

export async function obtenerProductoPorId(id: number): Promise<Producto> {
  const response = await fetch(`${API_URL}/productos/${id}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Error al obtener producto');
  }

  const data = await response.json();
  return mapearProducto(data);
}

export async function buscarProductos(query: string): Promise<Producto[]> {
  let url = `${API_URL}/productos/`;
  
  if (query.trim()) {
    url += `?q=${encodeURIComponent(query)}`;
  }
  
  const response = await fetch(url, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Error al buscar productos');
  }

  const data = await response.json();
  return data.map(mapearProducto);
}

export async function filtrarPorCategoria(categoria: string): Promise<Producto[]> {
  let url = `${API_URL}/productos/`;
  
  if (categoria && categoria !== 'todas') {
    url += `?categoria=${encodeURIComponent(categoria)}`;
  }
  
  const response = await fetch(url, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Error al filtrar productos por categoría');
  }

  const data = await response.json();
  return data.map(mapearProducto);
}

export async function obtenerCategorias(): Promise<string[]> {
  const productos = await obtenerProductos();
  const categorias = productos
    .map(producto => producto.categoria)
    .filter((categoria): categoria is string => Boolean(categoria))
    .filter((categoria, index, array) => array.indexOf(categoria) === index)
    .sort();
  
  return categorias;
}
