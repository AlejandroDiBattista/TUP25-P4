const BASE_URL = "http://127.0.0.1:8000"; // Asegúrate de que esta URL sea correcta

export async function registrarUsuario(nombre: string, email: string, contraseña: string) {
  try {
    const body = JSON.stringify({ nombre, email, contraseña });
    
    const response = await fetch(`${BASE_URL}/registrar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: body,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = "Error al registrar usuario";
      
      try {
        const error = JSON.parse(errorText);
        errorMessage = error.detail || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error: any) {
    if (error.message === 'Failed to fetch') {
      throw new Error("No se puede conectar con el servidor. Asegúrate de que el backend esté corriendo en http://127.0.0.1:8000");
    }
    throw error;
  }
}

export async function iniciarSesion(email: string, contraseña: string) {
  try {
    const body = JSON.stringify({ email, contraseña });
    
    const response = await fetch(`${BASE_URL}/iniciar-sesion`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: body,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = "Error al iniciar sesión";
      
      try {
        const error = JSON.parse(errorText);
        errorMessage = error.detail || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    if (typeof window !== 'undefined') {
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("usuario", JSON.stringify(data.usuario));
    }
    
    return data;
  } catch (error: any) {
    if (error.message === 'Failed to fetch') {
      throw new Error("No se puede conectar con el servidor. Asegúrate de que el backend esté corriendo en http://127.0.0.1:8000");
    }
    throw error;
  }
}

export function cerrarSesion() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
  }
}

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  if (typeof window === 'undefined') {
    throw new Error("Esta función solo puede ejecutarse en el cliente");
  }

  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No se encontró un token de autenticación");
  }

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const response = await fetch(`${BASE_URL}${url}`, { ...options, headers });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: "Error en la solicitud" }));
    throw new Error(errorData.detail || "Error en la solicitud protegida");
  }
  
  return response.json();
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  const token = localStorage.getItem("token");
  return !!token;
}

export function getUsuario() {
  if (typeof window === 'undefined') {
    return null;
  }
  
  const usuario = localStorage.getItem("usuario");
  if (!usuario) return null;
  
  try {
    return JSON.parse(usuario);
  } catch (error) {
    console.error("Error al parsear usuario:", error);
    return null;
  }
}
