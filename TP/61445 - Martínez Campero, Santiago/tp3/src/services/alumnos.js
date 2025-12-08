function extraerLegajo(nota) {
  if (!nota) return 0;
  
  const match = nota.match(/Legajo:\s*(\d+)/i);
  return match ? parseInt(match[1], 10) : 0;
}

function extraerGitHub(nota) {
  if (!nota) return '';
  
  const match = nota.match(/Github:\s*([a-zA-Z0-9-_]+)/i);
  return match ? match[1].trim() : '';
}

function procesarTarjeta(lineasTarjeta) {
  const alumno = {
    nombre: '',
    telefono: '',
    legajo: 0,
    github: '',
    favorito: false
  };
  
  for (let linea of lineasTarjeta) {
    linea = linea.trim();
    
    if (linea.startsWith('FN:')) {
      alumno.nombre = linea.substring(3).trim();
    }
    
    else if (linea.startsWith('TEL')) {
      const colonIndex = linea.indexOf(':');
      if (colonIndex !== -1) {
        alumno.telefono = linea.substring(colonIndex + 1).trim();
      }
    }
    
    else if (linea.startsWith('NOTE:')) {
      const nota = linea.substring(5).trim();
      alumno.legajo = extraerLegajo(nota);
      alumno.github = extraerGitHub(nota);
    }
  }
  
  if (!alumno.nombre || alumno.legajo === 0) {
    return null;
  }
  
  alumno.id = alumno.legajo;
  
  return alumno;
}

export function parseVcf(textoVcf) {
  if (!textoVcf) {
    console.warn('Archivo VCF vacío o no encontrado');
    return [];
  }
  
  const alumnos = [];
  const lineas = textoVcf.split('\n').map(l => l.trim());
  
  let dentroTarjeta = false;
  let lineasTarjetaActual = [];
  
  for (let i = 0; i < lineas.length; i++) {
    const linea = lineas[i];
    
    if (linea === 'BEGIN:VCARD') {
      dentroTarjeta = true;
      lineasTarjetaActual = [];
    }
    else if (linea === 'END:VCARD') {
      if (dentroTarjeta && lineasTarjetaActual.length > 0) {
        const alumno = procesarTarjeta(lineasTarjetaActual);
        if (alumno) {
          alumnos.push(alumno);
        }
      }
      dentroTarjeta = false;
      lineasTarjetaActual = [];
    }
    else if (dentroTarjeta) {
      lineasTarjetaActual.push(linea);
    }
  }
  
  console.log(`✅ Parser VCF: Se cargaron ${alumnos.length} alumnos correctamente`);
  return alumnos;
}

export async function loadAlumnos() {
  try {
    const response = await fetch('/alumnos.vcf');
    if (!response.ok) {
      throw new Error(`Error cargando archivo VCF: ${response.status}`);
    }
    
    const alumnosVcf = await response.text();
    const alumnos = parseVcf(alumnosVcf);
    
    const conGitHub = alumnos.filter(a => a.github).length;
    console.log(`📊 Estadísticas: ${alumnos.length} alumnos, ${conGitHub} con GitHub`);
    
    return alumnos;
  } catch (error) {
    console.error('❌ Error cargando alumnos:', error);
    return [];
  }
}