export function norm(str = '') {
  return String(str)
    .normalize('NFD')               
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}


export function cmpNombre(a, b) {
  const na = norm(a.nombre)
  const nb = norm(b.nombre)
  return na.localeCompare(nb, 'es')
}


export function includesContacto(contact, q) {
  const qn = norm(q)
  if (!qn) return true
  const fields = [contact.nombre, contact.telefono, contact.legajo].map(norm)
  return fields.some(f => f.includes(qn))
}
