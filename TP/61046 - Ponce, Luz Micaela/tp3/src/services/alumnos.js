import alumnosVcf from '../../public/alumnos.vcf?raw';

export function parseVcf(vcfText){
  // separo por END:VCARD (sin dejar entradas vacías)
  const tarjetas = vcfText
    .split(/END:VCARD\s*/i)
    .map(t => t.trim())
    .filter(Boolean);

  return tarjetas
    .map(t => {
      const nombre = t.match(/FN:(.*)/i)?.[1]?.trim();
      // intento TEL;TYPE=CELL: pero si no, pruebo TEL:
      const telefono = t.match(/TEL;TYPE=CELL:(.*)/i)?.[1]?.trim()
                       || t.match(/TEL:(.*)/i)?.[1]?.trim();
      const note = t.match(/NOTE:(.*)/i)?.[1]?.trim();

      if (!nombre || !telefono || !note) return null;

      // permito espacio después de "Legajo:" y case-insensitive
      const legajo = note.match(/Legajo:\s*(\d+)/i)?.[1]?.trim();
      if (!legajo) return null; // si no hay legajo, descartamos (evita id undefined)

      // Github puede tener guiones/números/letras
      const github = note.match(/Github:\s*([A-Za-z0-9\-]+)/i)?.[1]?.trim() || "";

      return {
        id: legajo,
        nombre,
        telefono,
        legajo,
        github,
        favorito: false,
      };
    })
    .filter(Boolean);
}

export function loadAlumnos(){
  return parseVcf(alumnosVcf);
}
