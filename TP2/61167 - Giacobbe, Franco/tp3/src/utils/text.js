export function norm(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export function cmpNombre(a, b) {
  return norm(a.nombre).localeCompare(norm(b.nombre));
}

export function includesContacto(alumno, filtro) {
  const f = norm(filtro);
  return (
    norm(alumno.nombre).includes(f) ||
    norm(alumno.telefono).includes(f) ||
    norm(alumno.legajo).includes(f)
  );
}