
// Función para normalizar texto (sin acentos y en minúsculas)
function norm(texto) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

// Función para parsear el contenido del archivo VCF
export function parseVcf(vcf) {
  const tarjetas = vcf.split('BEGIN:VCARD').slice(1);
  return tarjetas.map((tarjeta) => {
    const nombre = tarjeta.match(/FN:(.+)/)?.[1]?.trim() || '';
    const telefono = tarjeta.match(/TEL;TYPE=CELL:(.+)/)?.[1]?.trim() || '';
    const note = tarjeta.match(/NOTE:(.+)/)?.[1]?.trim() || '';
    const legajo = note.match(/Legajo: (\d+)/)?.[1] || '';
    const github = note.match(/Github: (\S+)/)?.[1] || '';

    return {
      id: legajo,
      nombre,
      telefono,
      legajo,
      github,
      favorito: false,
    };
  });
}

const alumnosUrl = "/alumnos.vcf";

export async function loadAlumnos() {
  const response = await fetch(alumnosUrl);
  const vcf = await response.text();
  return parseVcf(vcf);
}