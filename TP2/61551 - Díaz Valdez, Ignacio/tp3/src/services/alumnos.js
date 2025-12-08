export function leerAlumnosVcf(vcfText) {
  const tarjetas = vcfText.split('END:VCARD');
  let alumnos = [];
  tarjetas.forEach(card => {
    const nombre = (card.match(/FN:(.*)/) || [])[1] || '';
    const telefono = (card.match(/TEL;TYPE=CELL:(.*)/) || [])[1] || '';
    const note = (card.match(/NOTE:(.*)/) || [])[1] || '';
    const legajo = (note.match(/Legajo:\s*(\d+)/i) || [])[1] || '';
    const github = (note.match(/Github:\s*([^\s]+)/i) || [])[1] || '';
    if (legajo) {
      alumnos.push({
        id: legajo,
        nombre: nombre.trim(),
        telefono: telefono.trim(),
        legajo,
        github: github || "",
        favorito: false
      });
    }
  });
  return alumnos;
}