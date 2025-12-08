import alumnosVcf from '../alumnos.vcf?raw';

/**
 * Parsea el contenido VCF y extrae la información de los alumnos
 * @param {string} vcfContent - Contenido del archivo VCF
 * @returns {Array} Array de objetos alumno
 */
export function parseVcf(vcfContent) {
  const alumnos = [];
  const tarjetas = vcfContent.split('BEGIN:VCARD').slice(1); // Remover primera entrada vacía

  tarjetas.forEach(tarjeta => {
    try {
      // Extraer nombre completo
      const fnMatch = tarjeta.match(/FN:(.+)/);
      const nombre = fnMatch ? fnMatch[1].trim() : '';

      // Extraer teléfono
      const telMatch = tarjeta.match(/TEL;TYPE=CELL:(.+)/);
      const telefono = telMatch ? telMatch[1].trim() : '';

      // Extraer información de la nota (legajo y github)
      const noteMatch = tarjeta.match(/NOTE:(.+)/);
      if (noteMatch) {
        const note = noteMatch[1];
        
        // Extraer legajo
        const legajoMatch = note.match(/Legajo:\s*(\d+)/);
        const legajo = legajoMatch ? parseInt(legajoMatch[1], 10) : 0;

        // Extraer usuario de GitHub
        const githubMatch = note.match(/Github:\s*([^\s]+)/);
        const github = githubMatch ? githubMatch[1].trim() : '';

        // Crear objeto alumno si tiene datos válidos
        if (nombre && telefono && legajo) {
          alumnos.push({
            id: legajo,
            nombre,
            telefono,
            legajo,
            github,
            favorito: false
          });
        }
      }
    } catch (error) {
      console.warn('Error al parsear tarjeta VCF:', error);
    }
  });

  return alumnos;
}

/**
 * Carga los datos de alumnos desde el archivo VCF
 * @returns {Array} Array de objetos alumno
 */
export function loadAlumnos() {
  return parseVcf(alumnosVcf);
}