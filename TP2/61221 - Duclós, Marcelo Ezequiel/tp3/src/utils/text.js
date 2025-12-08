/**
 * Utilidades para manejo de texto en la aplicación de directorio de alumnos
 */

/**
 * Normaliza una cadena de texto removiendo acentos y convirtiendo a minúsculas
 * 
 * ¿Para qué sirve esto?
 * Cuando el usuario busca "José", también queremos que encuentre "jose" o "JOSE"
 * Esta función convierte todo a un formato común para comparar fácilmente
 * 
 * @param {string} str - La cadena a normalizar
 * @returns {string} La cadena normalizada sin acentos y en minúsculas
 */
export function norm(str) {
  // Si no hay texto, devolvemos cadena vacía
  if (!str) return '';
  
  // Paso 1: Convertimos todo a minúsculas
  // Paso 2: normalize('NFD') separa las letras de sus acentos (á se vuelve a + ´)  
  // Paso 3: El regex /[\u0300-\u036f]/g encuentra todos los acentos y los elimina
  // Resultado: "José" se convierte en "jose"
  return str.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Compara dos nombres para ordenamiento alfabético
 * 
 * ¿Para qué sirve esto?
 * JavaScript necesita una función para saber cómo ordenar nombres.
 * Usamos norm() para que "Álvarez" y "alvarez" se ordenen igual.
 * 
 * @param {string} nombre1 - Primer nombre a comparar
 * @param {string} nombre2 - Segundo nombre a comparar
 * @returns {number} -1 si nombre1 va antes, 1 si va después, 0 si son iguales
 */
export function cmpNombre(nombre1, nombre2) {
  // Normalizamos ambos nombres para compararlos sin acentos ni mayúsculas
  const nom1 = norm(nombre1);
  const nom2 = norm(nombre2);
  
  // localeCompare es una función de JavaScript que ordena textos alfabéticamente
  // considerando el idioma (español en nuestro caso)
  return nom1.localeCompare(nom2);
}

/**
 * Verifica si un contacto coincide con un término de búsqueda
 * 
 * ¿Para qué sirve esto?
 * Cuando el usuario escribe "juan" queremos encontrar todos los alumnos que tengan
 * "juan" en su nombre, teléfono o legajo. Sin importar mayúsculas o acentos.
 * 
 * @param {Object} contacto - El objeto contacto con {nombre, telefono, legajo}
 * @param {string} termino - El término de búsqueda
 * @returns {boolean} true si el contacto coincide con el término
 */
export function includesContacto(contacto, termino) {
  // Si no hay término de búsqueda, mostramos todos los contactos
  if (!termino) return true;
  
  // Normalizamos el término para buscar sin acentos ni mayúsculas
  const terminoNormalizado = norm(termino);
  
  // Verificamos si el término aparece en alguno de estos campos:
  const nombreCoincide = norm(contacto.nombre).includes(terminoNormalizado);
  const telefonoCoincide = norm(contacto.telefono).includes(terminoNormalizado);
  const legajoCoincide = norm(contacto.legajo.toString()).includes(terminoNormalizado);
  
  // Retorna true si encuentra coincidencia en cualquiera de los tres campos
  // El operador || significa "OR" - si cualquiera es true, el resultado es true
  return nombreCoincide || telefonoCoincide || legajoCoincide;
}
