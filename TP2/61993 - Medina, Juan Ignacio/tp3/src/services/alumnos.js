export async function loadAlumnos() {
  try {
    const res = await fetch('/alumnos.vcf');
    const vcf = await res.text();
    const entries = vcf.split('BEGIN:VCARD').slice(1);
    return entries.map(entry => {
      const nombreMatch = entry.match(/FN:(.*)/);
      const telMatch = entry.match(/TEL;TYPE=CELL:(.*)/);
      const noteMatch = entry.match(/NOTE:(.*)/);

      const nombre = nombreMatch ? nombreMatch[1].trim() : '';
      const telefono = telMatch ? telMatch[1].trim() : '';
      let legajo = '';
      let github = '';

      if (noteMatch) {
        const note = noteMatch[1];
        const legajoMatch = note.match(/Legajo:\s*(\d+)/);
        const githubMatch = note.match(/Github:\s*([\w-]+)/);
        legajo = legajoMatch ? legajoMatch[1] : '';
        github = githubMatch ? githubMatch[1] : '';
      }

      return { id: legajo, nombre, telefono, legajo, github, favorito: false };
    });
  } catch (e) {
    console.error('Error cargando alumnos:', e);
    return [];
  }
}
