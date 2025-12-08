// Servicio de datos: parseo de VCF y carga

/**
 * Parsea un texto VCF (vCard 3.0) con formato fijo.
 * Devuelve: { id, nombre, telefono, legajo, github, favorito }
 */
export function parseVcf(text) {
  if (!text) return []

  // Capturar cada tarjeta completa
  const cards = text.match(/BEGIN:VCARD[\s\S]*?END:VCARD/g) || []

  const alumnos = []
  for (const raw of cards) {
    const get = (re) => (raw.match(re)?.[1] ?? '').trim()
    const fn = get(/(?:^|\r?\n)FN:([^\r\n]+)/i)
    const telefono = get(/(?:^|\r?\n)TEL;TYPE=CELL:([^\r\n]+)/i)
    const note = get(/(?:^|\r?\n)NOTE:([^\r\n]+)/i)

    const legajo = note.match(/Legajo:\s*(\d+)/i)?.[1] ?? ''
    const github = note.match(/Github:\s*([\w-]+)/i)?.[1] ?? ''

    if (!fn || !legajo) continue

    alumnos.push({
      id: legajo,
      nombre: fn,
      telefono,
      legajo,
      github,
      favorito: false,
    })
  }

  return alumnos
}

// Carga el archivo VCF importándolo como texto (Vite ?raw)
import alumnosVcf from '../alumnos.vcf?raw'

export async function loadAlumnos() {
  return parseVcf(alumnosVcf)
}

