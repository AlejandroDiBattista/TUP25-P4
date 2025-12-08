// Utilidades de texto: normalización y búsqueda

export function norm(input) {
  const s = String(input ?? '')
  // Normaliza, quita diacríticos, compacta espacios y pasa a minúsculas
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

// Comparador por nombre normalizado (para objetos contacto)
export function cmpNombre(a, b) {
  return norm(a?.nombre).localeCompare(norm(b?.nombre))
}

// Búsqueda por coincidencia en nombre, teléfono o legajo
export function includesContacto(contacto, query) {
  const q = norm(query)
  if (!q) return true
  return (
    norm(contacto?.nombre).includes(q) ||
    String(contacto?.telefono ?? '').toLowerCase().includes(q) ||
    String(contacto?.legajo ?? '').toLowerCase().includes(q)
  )
}

