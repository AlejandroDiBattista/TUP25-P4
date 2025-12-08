// Utilidades de texto para búsqueda y ordenación

/**
 * Normaliza un texto: minúsculas, sin acentos, sin espacios extra
 * @param {string} str
 * @returns {string}
 */
export function norm(str) {
  return str
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Compara dos nombres normalizados alfabéticamente
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
export function cmpNombre(a, b) {
  return norm(a).localeCompare(norm(b));
}

/**
 * Devuelve true si el contacto coincide con el término de búsqueda
 * @param {object} alumno
 * @param {string} term
 * @returns {boolean}
 */
export function includesContacto(alumno, term) {
  const nterm = norm(term);
  return (
    norm(alumno.nombre).includes(nterm) ||
    norm(alumno.telefono).includes(nterm) ||
    norm(alumno.legajo).includes(nterm)
  );
}
