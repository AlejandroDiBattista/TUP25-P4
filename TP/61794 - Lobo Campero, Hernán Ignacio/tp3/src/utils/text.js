/**
 * Normaliza texto removiendo acentos y convirtiendo a minúsculas
 * @param {string} text - Texto a normalizar
 * @returns {string} Texto normalizado
 */
export function norm(text) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

/**
 * Compara dos nombres normalizados para ordenamiento alfabético
 * @param {string} a - Primer nombre
 * @param {string} b - Segundo nombre
 * @returns {number} Resultado de comparación
 */
export function cmpNombre(a, b) {
  const nameA = norm(a);
  const nameB = norm(b);
  return nameA.localeCompare(nameB);
}

/**
 * Verifica si un contacto coincide con la búsqueda
 * @param {Object} contacto - Objeto contacto con nombre, telefono, legajo
 * @param {string} busqueda - Término de búsqueda
 * @returns {boolean} True si hay coincidencia
 */
export function includesContacto(contacto, busqueda) {
  if (!busqueda) return true;
  
  const termino = norm(busqueda);
  const nombre = norm(contacto.nombre);
  const telefono = norm(contacto.telefono);
  const legajo = norm(contacto.legajo.toString());
  
  return nombre.includes(termino) || 
         telefono.includes(termino) || 
         legajo.includes(termino);
}