// Utilidades de texto: normalización (sin acentos, minúsculas), comparación por nombre e includes

export function norm(s = '') {
  return String(s)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
}

export function cmpNombre(a, b) {
  const na = norm(a.nombre || a)
  const nb = norm(b.nombre || b)
  if (na < nb) return -1
  if (na > nb) return 1
  return 0
}

export function includesContacto(contact, q) {
  const nq = norm(q)
  if (!nq) return true
  const fields = [contact.nombre, contact.telefono, contact.legajo]
  return fields.some(f => norm(f).includes(nq))
}
