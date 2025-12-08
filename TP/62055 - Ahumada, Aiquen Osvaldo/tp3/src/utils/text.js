// src/utils/text.js

// Normaliza texto: minúsculas + sin acentos
export function norm(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

// Comparador de nombres alfabético normalizado
export function cmpNombre(a, b) {
  return norm(a.nombre).localeCompare(norm(b.nombre))
}

// Búsqueda en nombre, teléfono o legajo
export function includesContacto(contacto, query) {
  if (!query) return true
  const q = norm(query)
  return (
    norm(contacto.nombre).includes(q) ||
    norm(contacto.telefono).includes(q) ||
    norm(contacto.legajo).includes(q)
  )
}
