import alumnosVcf from "../../public/alumnos.vcf?raw"; 
import { norm } from "../utils/text.js";


export function parseVcf(text) {
  const tarjetas = text.split("END:VCARD"); 
  const alumnos = [];

  tarjetas.forEach((tarjeta) => {
    const nombreMatch = tarjeta.match(/FN:(.+)/);
    const telMatch = tarjeta.match(/TEL;TYPE=CELL:(.+)/);
    const noteMatch = tarjeta.match(/NOTE:(.+)/);

    if (nombreMatch && telMatch && noteMatch) {
      const nombre = nombreMatch[1].trim();
      const telefono = telMatch[1].trim();
      const note = noteMatch[1].trim();

      
      const legajoMatch = note.match(/Legajo:\s*(\d+)/i);
      const githubMatch = note.match(/Github:\s*(\S+)/i);

      const legajo = legajoMatch ? legajoMatch[1] : "";
      const github = githubMatch ? githubMatch[1] : "";

      alumnos.push({
        id: legajo,
        nombre,
        telefono,
        legajo,
        github,
        favorito: false,
      });
    }
  });

  return alumnos;
}

export function loadAlumnos() {
  return parseVcf(alumnosVcf);
}