export function norm(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function cmpNombre(a, b) {
  return norm(a.nombre).localeCompare(norm(b.nombre));
}

export function includesContacto(alumno, query) {
  const q = norm(query);
  return (
    norm(alumno.nombre).includes(q) ||
    alumno.telefono.includes(query) ||
    alumno.legajo.includes(query)
  );
}
