export function parseVcf(text) {
  const cards = text.split("END:VCARD").map(c => c.trim()).filter(Boolean)

  return cards.map(card => {
    const fn = /FN:(.+)/.exec(card)?.[1] ?? ""
    const tel = /TEL;TYPE=CELL:(.+)/.exec(card)?.[1] ?? ""
    const note = /NOTE:(.+)/.exec(card)?.[1] ?? ""

    const legajoMatch = /Legajo:\s*(\d+)/i.exec(note)
    const githubMatch = /Github:\s*(\S+)/i.exec(note)

    return {
      id: legajoMatch ? legajoMatch[1] : fn,
      nombre: fn,
      telefono: tel,
      legajo: legajoMatch ? legajoMatch[1] : "",
      github: githubMatch ? githubMatch[1] : "",
      favorito: false
    }
  })
}
