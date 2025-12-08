// Utilidades de texto para normalizar y buscar

// Normaliza texto: minúsculas, sin acentos
export function norm(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^\w\s]/g, '');
}

// Compara nombres normalizados
export function cmpNombre(a, b) {
  return norm(a).localeCompare(norm(b));
}

// Busca coincidencia en nombre, teléfono o legajo
export function includesContacto(alumno, query) {
  const q = norm(query);
  return (
    norm(alumno.nombre).includes(q) ||
    norm(alumno.telefono).includes(q) ||
    norm(alumno.legajo).includes(q)
  );
}
