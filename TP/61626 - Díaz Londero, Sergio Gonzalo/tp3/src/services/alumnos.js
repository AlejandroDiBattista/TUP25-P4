// Servicio de datos para alumnos
// Funciones: parseVcf, loadAlumnos

export function parseVcf(vcfText) {
  const tarjetas = vcfText.split(/END:VCARD/).filter(Boolean);
  return tarjetas.map(t => {
    const nombre = t.match(/FN:(.*)/)?.[1]?.trim() || "";
    const telefono = t.match(/TEL;TYPE=CELL:(.*)/)?.[1]?.trim() || "";
    const note = t.match(/NOTE:(.*)/)?.[1]?.trim() || "";
    const legajo = note.match(/Legajo:\s*(\d+)/)?.[1] || "";
    const github = note.match(/Github:\s*([\w-]+)/i)?.[1] || "";
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
  // Import dinámico del VCF como texto
  const vcfText = (await import('../alumnos.vcf?raw')).default;
  return parseVcf(vcfText);
}
