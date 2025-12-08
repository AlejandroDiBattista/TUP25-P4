/**
 * Servicio para cargar y procesar datos de alumnos desde archivo VCF
 * Importamos el archivo VCF directamente como texto usando ?raw (como especifica el enunciado)
 */

// Esta es la forma EXACTA que pide el enunciado: importar el VCF como texto
import alumnosVcf from '../assets/alumnos.vcf?raw';

/**
 * Parsea el contenido de un archivo VCF y extrae los datos de los alumnos
 * @param {string} vcfContent - El contenido completo del archivo VCF como texto
 * @returns {Array} Array de objetos alumno con estructura: {id, nombre, telefono, legajo, github, favorito}
 */
export function parseVcf(vcfContent) {
  // Dividimos el contenido en tarjetas individuales
  // Cada tarjeta empieza con "BEGIN:VCARD", así que split y quitamos el primer elemento vacío
  const tarjetas = vcfContent.split('BEGIN:VCARD').slice(1);
  
  // Procesamos cada tarjeta para extraer los datos
  const alumnos = tarjetas.map(tarjeta => {
    // Dividimos la tarjeta en líneas individuales
    const lineas = tarjeta.split('\n');
    
    // Variables para almacenar los datos que vamos extrayendo
    let nombre = '';
    let telefono = '';
    let legajo = '';
    let github = '';
    
    // Revisamos cada línea de la tarjeta
    for (const linea of lineas) {
      // El formato es "CAMPO:VALOR", así que dividimos por ":"
      const partes = linea.split(':');
      
      if (linea.startsWith('FN:')) {
        // FN = Full Name (nombre completo)
        nombre = partes[1] || '';
      } 
      else if (linea.startsWith('TEL;TYPE=CELL:')) {
        // TEL;TYPE=CELL = teléfono celular
        telefono = partes[1] || '';
      } 
      else if (linea.startsWith('NOTE:')) {
        // NOTE contiene información adicional como legajo y github
        // Formato esperado: "Legajo: 12345 - Comision: ... - Github: usuario"
        const nota = linea.substring(5); // Quitamos "NOTE:"
        
        // Extraemos el legajo usando expresión regular
        const legajoMatch = nota.match(/Legajo:\s*(\d+)/);
        if (legajoMatch) {
          legajo = legajoMatch[1];
        }
        
        // Extraemos el usuario de GitHub usando expresión regular
        const githubMatch = nota.match(/Github:\s*([^\s-]+)/);
        if (githubMatch) {
          github = githubMatch[1];
        }
      }
    }
    
    // Creamos y retornamos el objeto alumno con todos los datos
    return {
      id: legajo,              // Usamos el legajo como ID único
      nombre: nombre,
      telefono: telefono,
      legajo: legajo,
      github: github,
      favorito: false          // Por defecto ningún alumno es favorito
    };
  });
  
  // Filtramos alumnos que pudieran tener datos vacíos o incorrectos
  return alumnos.filter(alumno => alumno.nombre && alumno.legajo);
}

/**
 * Carga los datos de alumnos desde el archivo VCF
 * 
 * ¿Cómo funciona esto?
 * Ya importamos el archivo VCF como texto en la línea de arriba con ?raw
 * Ahora solo tenemos que parsearlo y devolverlo.
 * Es mucho más simple que usar fetch()!
 * 
 * @returns {Array} Array de objetos alumno procesados
 */
export function loadAlumnos() {
  try {
    // El contenido del archivo ya está disponible en la variable alumnosVcf
    // gracias a la importación con ?raw
    return parseVcf(alumnosVcf);
  } catch (error) {
    console.error('Error procesando el archivo de alumnos:', error);
    return []; // Retornamos array vacío en caso de error
  }
}
