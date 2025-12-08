export function norm(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

export function cmpNombre(a, b) {
  return norm(a.nombre).localeCompare(norm(b.nombre));
}

export function incluye(alumno, texto) {
  const t = norm(texto);
  return norm(alumno.nombre).includes(t) ||
    norm(alumno.telefono).includes(t) ||
    norm(alumno.legajo).includes(t);
}