// Función para normalizar texto (sin acentos y en minúsculas)
export function norm(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// Función para comparar nombres de contactos (ordenamiento alfabético)
export function cmpNombre(a, b) {
  const nombreA = norm(a.nombre);
  const nombreB = norm(b.nombre);
  return nombreA.localeCompare(nombreB);
}

// Función para verificar si un contacto incluye el término de búsqueda
export function includesContacto(contacto, searchTerm) {
  const termNorm = norm(searchTerm);
  return (
    norm(contacto.nombre).includes(termNorm) ||
    norm(contacto.telefono).includes(termNorm) ||
    norm(contacto.legajo.toString()).includes(termNorm)
  );
}
