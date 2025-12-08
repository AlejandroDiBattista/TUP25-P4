// Utilidades de texto para normalización y comparación

// Normaliza texto: minúsculas y sin acentos
 export default function norm(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

// Compara nombres normalizados
export function cmpNombre(a, b) {
  return norm(a).localeCompare(norm(b));
}

// Busca coincidencia en nombre, teléfono o legajo
export function includesContacto(alumno, query) {
  const q = norm(query);
  return [alumno.nombre, alumno.telefono, alumno.legajo].some(campo => norm(campo).includes(q));
}
