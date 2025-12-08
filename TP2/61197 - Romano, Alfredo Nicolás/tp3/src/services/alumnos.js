// Este archivo contiene funciones relacionadas con la gestión de datos de alumnos.

const alumnos = [];

// Función para obtener todos los alumnos
export const obtenerAlumnos = () => {
    return alumnos;
};

// Función para agregar un nuevo alumno
export const agregarAlumno = (alumno) => {
    alumnos.push(alumno);
};

// Función para eliminar un alumno por su índice
export const eliminarAlumno = (indice) => {
    if (indice > -1 && indice < alumnos.length) {
        alumnos.splice(indice, 1);
    }
};

export function parseVcf(text) {
  const tarjetas = text.split('END:VCARD').filter(Boolean);
  return tarjetas.map(card => {
    const lineas = card.split('\n').map(l => l.trim());
    let nombre = '', telefono = '', legajo = '', github = '';
    let note = '';
    for (const linea of lineas) {
      if (linea.startsWith('FN:')) {
        nombre = linea.slice(3).trim();
      } else if (linea.startsWith('TEL;TYPE=CELL:')) {
        telefono = linea.slice(14).trim();
      } else if (linea.startsWith('NOTE:')) {
        note = linea.slice(5).trim();
      }
    }
    // Extraer legajo y github del note
    if (note) {
      const partes = note.split(' ');
      for (let i = 0; i < partes.length; i++) {
        if (partes[i].toLowerCase() === 'legajo:') {
          legajo = partes[i + 1] || '';
        }
        if (partes[i].toLowerCase() === 'github:') {
          github = partes[i + 1] || '';
        }
      }
    }
    return {
      id: legajo,
      nombre,
      telefono,
      legajo,
      github,
      favorito: false
    };
  }).filter(a => a.id);
}

export async function loadAlumnos() {
  const res = await fetch('/public/alumnos.vcf');
  const text = await res.text();
  return parseVcf(text);
}