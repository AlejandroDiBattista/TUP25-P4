// Normaliza texto: minúsculas y sin acentos
export function norm(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

// Compara nombres normalizados (alfabéticamente)
export function cmpNombre(a, b) {
  return norm(a.nombre).localeCompare(norm(b.nombre));
}

// Busca coincidencia en nombre, teléfono o legajo
export function includesContacto(alumno, texto) {
  const t = norm(texto);
  return (
    norm(alumno.nombre).includes(t) ||
    norm(alumno.telefono).includes(t) ||
    norm(alumno.legajo).includes(t)
  );
}