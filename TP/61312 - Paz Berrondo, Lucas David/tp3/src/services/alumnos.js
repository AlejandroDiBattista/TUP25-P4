import alumnosVcf from '../alumnos.vcf?raw';

// Función para parsear el contenido VCF
export function parseVcf(vcfContent) {
  const vcards = vcfContent.split('BEGIN:VCARD').filter(card => card.trim() !== '');
  
  return vcards.map(vcard => {
    // Extraer nombre (FN)
    const fnMatch = vcard.match(/FN:(.+)/);
    const nombre = fnMatch ? fnMatch[1].trim() : '';
    
    // Extraer teléfono (TEL;TYPE=CELL)
    const telMatch = vcard.match(/TEL;TYPE=CELL:(.+)/);
    const telefono = telMatch ? telMatch[1].trim() : '';
    
    // Extraer nota (NOTE) que contiene legajo y GitHub
    const noteMatch = vcard.match(/NOTE:(.+)/);
    const note = noteMatch ? noteMatch[1].trim() : '';
    
    // Extraer legajo de la nota
    const legajoMatch = note.match(/Legajo:\s*(\d+)/);
    const legajo = legajoMatch ? parseInt(legajoMatch[1]) : 0;
    
    // Extraer usuario de GitHub de la nota
    const githubMatch = note.match(/Github:\s*(\S+)/);
    const github = githubMatch ? githubMatch[1] : '';
    
    return {
      id: legajo,
      nombre,
      telefono,
      legajo,
      github,
      favorito: false
    };
  }).filter(contacto => contacto.nombre && contacto.legajo); // Filtrar contactos válidos
}

// Función para cargar todos los alumnos
export function loadAlumnos() {
  return parseVcf(alumnosVcf);
}
