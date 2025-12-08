


// Normaliza texto (sin acentos, minúsculas)
export function norm(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

// Compara nombres normalizados (alfabéticamente)
export function cmpNombre(a, b) {
  return norm(a.nombre).localeCompare(norm(b.nombre));
}

// Busca coincidencia en nombre, teléfono o legajo (normalizado)
export function includesContacto(alumno, texto) {
  const n = norm(texto);
  return (
    norm(alumno.nombre).includes(n) ||
    norm(alumno.telefono).includes(n) ||
    norm(alumno.legajo).includes(n)
  );
}