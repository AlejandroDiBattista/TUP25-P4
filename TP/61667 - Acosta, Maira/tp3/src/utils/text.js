
export function norm(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

export function cmpNombre(a, b) {
  return norm(a).localeCompare(norm(b))
}

export function includesContacto(alumno, q) {
  return (
    norm(alumno.nombre).includes(q) ||
    norm(alumno.telefono).includes(q) ||
    norm(alumno.legajo).includes(q)
  )
}

