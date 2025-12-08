
export function norm(text) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}


export function cmpNombre(a, b) {
  return norm(a.nombre).localeCompare(norm(b.nombre));
}


export function includesContacto(alumno, query) {
  const q = norm(query);
  return (
    norm(alumno.nombre).includes(q) ||
    norm(alumno.telefono ?? '').includes(q) ||
    norm(alumno.legajo   ?? '').includes(q)
  );
}