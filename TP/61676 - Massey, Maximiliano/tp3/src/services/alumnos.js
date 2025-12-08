import alumnosVcf from '../alumnos.vcf?raw';

export function parseVcf(vcfText) {
  const alumnos = [];
  const tarjetas = vcfText.split('BEGIN:VCARD').slice(1);
  
  tarjetas.forEach(tarjeta => {
    const lineas = tarjeta.split('\n');
    let nombre = '';
    let telefono = '';
    let legajo = '';
    let github = '';
    
    lineas.forEach(linea => {
      if (linea.startsWith('FN:')) {
        nombre = linea.replace('FN:', '').trim();
      } else if (linea.startsWith('TEL;TYPE=CELL:')) {
        telefono = linea.replace('TEL;TYPE=CELL:', '').trim();
      } else if (linea.startsWith('NOTE:')) {
        const nota = linea.replace('NOTE:', '').trim();
        
        const legajoMatch = nota.match(/Legajo:\s*(\d+)/);
        if (legajoMatch) {
          legajo = parseInt(legajoMatch[1]);
        }
        
        const githubMatch = nota.match(/Github:\s*([^\s-]+)/);
        if (githubMatch) {
          github = githubMatch[1];
        }
      }
    });
    
    if (nombre && telefono && legajo) {
      alumnos.push({
        id: legajo,
        nombre,
        telefono,
        legajo,
        github: github || '',
        favorito: false
      });
    }
  });
  
  return alumnos;
}

export async function loadAlumnos() {
  return new Promise((resolve, reject) => {
    try {
      setTimeout(() => {
        const alumnos = parseVcf(alumnosVcf);
        resolve(alumnos);
      }, 300);
    } catch (error) {
      reject(error);
    }
  });
}