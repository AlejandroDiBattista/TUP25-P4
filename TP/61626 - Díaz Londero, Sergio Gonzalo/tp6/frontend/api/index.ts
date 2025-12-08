import axios from 'axios';

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token a las peticiones (cliente)
api.interceptors.request.use((config: any) => {
  try {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch (e) {
    // ignore
  }
  return config;
});

export const login = async (email: string, password: string) => {
  const response = await api.post('/iniciar-sesion', { username: email, password });
  return response.data;
};

export const register = async (nombre: string, email: string, password: string) => {
  const response = await api.post('/registrar', { nombre, email, password });
  return response.data;
};

export const logout = async () => {
  const response = await api.post('/cerrar-sesion');
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
  return response.data;
};

export const getProducts = async (categoria?: string, busqueda?: string) => {
  const params = new URLSearchParams();
  if (categoria) params.append('categoria', categoria);
  if (busqueda) params.append('busqueda', busqueda);
  
  const response = await api.get(`/productos?${params.toString()}`);
  return response.data;
};

export const getProductById = async (id: number) => {
  const response = await api.get(`/productos/${id}`);
  return response.data;
};

export const addToCart = async (producto_id: number, cantidad: number) => {
  const response = await api.post('/carrito', { producto_id, cantidad });
  return response.data;
};

export const getCart = async () => {
  const response = await api.get('/carrito');
  return response.data;
};

export const removeFromCart = async (producto_id: number) => {
  const response = await api.delete(`/carrito/${producto_id}`);
  return response.data;
};

export const checkout = async (direccion: string, tarjeta: string) => {
  const response = await api.post('/carrito/finalizar', { direccion, tarjeta });
  return response.data;
};

export const cancelCart = async () => {
  const response = await api.post('/carrito/cancelar');
  return response.data;
};

export const getOrders = async () => {
  const response = await api.get('/compras');
  return response.data;
};

export const getOrderById = async (id: number) => {
  const response = await api.get(`/compras/${id}`);
  return response.data;
};
