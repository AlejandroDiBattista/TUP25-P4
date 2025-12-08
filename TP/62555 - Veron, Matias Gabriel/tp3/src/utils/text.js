import { norm } from '../services/alumnos'

// compara nombres normalizados (para ordenar alfabéticamente)
export function cmpNombre(a, b) {
  return norm(a.nombre).localeCompare(norm(b.nombre))
}

// verifica si un alumno coincide con el término de búsqueda
export function includesContacto(alumno, term) {
  const t = norm(term)
  return (
    norm(alumno.nombre).includes(t) ||
    alumno.telefono.includes(term) ||
    String(alumno.legajo).includes(term)
  )
}
