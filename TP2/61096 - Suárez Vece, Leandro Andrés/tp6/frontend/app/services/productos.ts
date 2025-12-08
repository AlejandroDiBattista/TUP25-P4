import { Producto } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function obtenerProductos(): Promise<Producto[]> {
  const response = await fetch(`${API_URL}/productos`, {
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error('Error al obtener productos');
  }

  return response.json();
}

export async function buscarProductos(categoria: string, buscar: string): Promise<Producto[]> {
  var url = `${API_URL}/productos`
  var cat = categoria ? `categoria=${categoria}` : "";
  var bus = buscar ? `buscar=${buscar}` : "";

  let params = [];
  if (cat) params.push(cat);
  if (bus) params.push(bus);

  if (params.length > 0) {
    url += `?${params.join('&')}`;
  }

  console.log(url);

  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error('Error al buscar productos');
  return response.json();
}

export async function obtenerProductoPorId(id: number): Promise<Producto> {
  const response = await fetch(`${API_URL}/productos/${id}`, { cache: 'no-store' });
  if (!response.ok) throw new Error('Producto no encontrado');
  return response.json();
}

