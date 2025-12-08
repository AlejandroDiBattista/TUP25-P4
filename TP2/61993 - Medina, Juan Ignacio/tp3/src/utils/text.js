export function norm(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

export function cmpNombre(a, b) {
  return norm(a.nombre).localeCompare(norm(b.nombre))
}

export function includesContacto(alumno, busqueda) {
  const n = norm(busqueda)
  return [alumno.nombre, alumno.telefono, alumno.legajo].some(f => norm(f).includes(n))
}
