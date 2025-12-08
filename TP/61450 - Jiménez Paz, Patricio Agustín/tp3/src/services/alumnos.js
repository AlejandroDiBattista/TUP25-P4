// Servicio para parsear alumnos.vcf y exponer loadAlumnos/parseVcf
import alumnosVcf from '../../public/alumnos.vcf?raw'

function parseVcf(raw) {
  // Divide por tarjetas VALOR ENTRE BEGIN:VCARD ... END:VCARD
  const cards = raw.split(/END:VCARD\s*/i)
    .map(s => s.trim())
    .filter(Boolean)

  const res = cards.map(card => {
    // Extraer FN (línea completa)
    const fnMatch = card.match(/^FN:(.+)$/im)
    const nombre = fnMatch ? fnMatch[1].trim() : ''

    // Extraer todas las líneas TEL: capturando attrs y valor por línea
    // Ej: TEL;TYPE=CELL:549115555555
    const telMatches = Array.from(card.matchAll(/^TEL([^:]*):(.+)$/gim))
    let telefono = ''
    if (telMatches.length) {
      const telEntries = telMatches.map(m => ({ attrs: m[1] || '', value: m[2].trim() }))
      // Preferir líneas que tengan TYPE=CELL/MOBILE/CEL en los attrs
      const preferred = telEntries.find(e => /CELL|MOBILE|CEL/i.test(e.attrs)) || telEntries[0]
      telefono = preferred ? preferred.value : ''
    }

    // NOTE: contiene 'Legajo: <número>' y opcional 'Github: <usuario>'
    const noteMatch = card.match(/NOTE:([\s\S]+)/i)
    const note = noteMatch ? noteMatch[1].trim() : ''

    let legajo = ''
    let github = ''

    // Buscar Legajo: número
    const legMatch = note.match(/Legajo\s*[:\-]?\s*(\d+)/i)
    if (legMatch) legajo = legMatch[1]

    // Buscar Github: usuario
    const gitMatch = note.match(/Github\s*[:\-]?\s*([A-Za-z0-9\-_.]+)/i)
    if (gitMatch) github = gitMatch[1]

    const id = legajo || telefono || nombre

    return {
      id,
      nombre,
      telefono,
      legajo,
      github: github || '',
      favorito: false,
    }
  })

  return res
}

export async function loadAlumnos() {
  try {
    // alumnosVcf importado como raw
    const raw = alumnosVcf
    const arr = parseVcf(raw)
    return arr
  } catch (err) {
    console.error('Error cargando alumnos.vcf:', err)
    return []
  }
}

export { parseVcf }
