
import alumnosVcf from '../../public/alumnos.vcf?raw'


const regex = /BEGIN:VCARD([\s\S]*?)END:VCARD/g

export function parseVcf(vcfText) {
  const contactos = []
  let match
  while ((match = regex.exec(vcfText)) !== null) {
    const card = match[1]

    const nombre = /FN:(.+)/.exec(card)?.[1]?.trim() ?? ""
    const telefono = /TEL;TYPE=CELL:(.+)/.exec(card)?.[1]?.trim() ?? ""
    const note = /NOTE:(.+)/.exec(card)?.[1]?.trim() ?? ""

    const legajo = /Legajo:\s*(\d+)/i.exec(note)?.[1] ?? ""
    const github = /Github:\s*([^\s]+)/i.exec(note)?.[1] ?? ""

    contactos.push({
      id: legajo,
      nombre,
      telefono,
      legajo,
      github,
      favorito: false
    })
  }
  return contactos
}

export function loadAlumnos() {
  return parseVcf(alumnosVcf)
}
