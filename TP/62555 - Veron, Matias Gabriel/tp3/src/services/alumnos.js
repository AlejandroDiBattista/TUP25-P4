import alumnosVcf from '../../public/alumnos.vcf?raw'

// Normaliza texto quitando acentos y pasando a minúsculas
const norm = (str) =>
  str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

// Parsea el VCF (asumimos formato fijo como indicó tu profe)
export function parseVcf(vcfText) {
  const tarjetas = vcfText.split('END:VCARD')
  const alumnos = []

  for (const card of tarjetas) {
    const fn = card.match(/FN:(.+)/)
    const tel = card.match(/TEL;TYPE=CELL:(.+)/)
    const note = card.match(/NOTE:(.+)/)

    if (fn && tel && note) {
      const nombre = fn[1].trim()
      const telefono = tel[1].trim()
      const legajoMatch = note[1].match(/Legajo:\s*(\d+)/)
      const githubMatch = note[1].match(/Github:\s*(\S+)/)

      alumnos.push({
        id: legajoMatch ? legajoMatch[1] : telefono,
        nombre,
        telefono,
        legajo: legajoMatch ? legajoMatch[1] : '',
        github: githubMatch ? githubMatch[1] : '',
        favorito: false,
      })
    }
  }

  return alumnos
}

export function loadAlumnos() {
  return parseVcf(alumnosVcf)
}

// Funciones auxiliares
export { norm }
