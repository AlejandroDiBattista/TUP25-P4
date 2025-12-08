

export async function obtenerAlumnosVcf() {
  const response = await fetch('/alumnos.vcf'); // lee desde public
  if (!response.ok) {
    throw new Error('Error al cargar alumnos.vcf');
  }
  const data = await response.text();
  return data;
}

export function parseVcf(vcf) {
  const tarjetas = vcf.split('BEGIN:VCARD').slice(1); // Salta la primera vacía

  return tarjetas.map(tarjeta => {
    const nombre = tarjeta.match(/FN:(.+)/)?.[1]?.trim() ?? '';
    const telefono = tarjeta.match(/TEL;TYPE=CELL:(.+)/)?.[1]?.trim() ?? '';
    const note = tarjeta.match(/NOTE:(.+)/)?.[1]?.trim() ?? '';

    const legajoMatch = note.match(/Legajo:\s*(\d+)/);
    const githubMatch = note.match(/Github:\s*(\S+)/i);

    const legajo = legajoMatch ? legajoMatch[1] : '';
    const github = githubMatch ? githubMatch[1] : '';

    return {
      id: legajo,
      nombre,
      telefono,
      legajo,
      github,
      favorito: false
    };
  });
}

export function loadAlumnos() {
  return parseVcf(alumnosVcf);
}