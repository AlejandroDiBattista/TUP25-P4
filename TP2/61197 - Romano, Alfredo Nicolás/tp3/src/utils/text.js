export function norm(str) {
  // Normaliza acentos y pasa a minúsculas sin usar regex
  return Array.from(str.normalize('NFD'))
    .filter(c => c.charCodeAt(0) < 0x300 || c.charCodeAt(0) > 0x036f)
    .join('')
    .toLowerCase();
}

export function cmpNombre(a, b) {
  return norm(a.nombre).localeCompare(norm(b.nombre));
}

export function includesContacto(alumno, filtro) {
  const f = norm(filtro);
  return (
    norm(alumno.nombre).indexOf(f) !== -1 ||
    norm(alumno.telefono).indexOf(f) !== -1 ||
    norm(alumno.legajo).indexOf(f) !== -1
  );
}