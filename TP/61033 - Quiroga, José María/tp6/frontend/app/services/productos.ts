export async function obtenerProductos() {
  const res = await fetch("http://127.0.0.1:8000/productos");
  if (!res.ok) throw new Error("Error al cargar productos");
  return res.json();
}
