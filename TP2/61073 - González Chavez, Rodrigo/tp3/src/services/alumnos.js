export async function parseVcf(alumno) {
    const cards = await alumno.split('END:VCARD')
      .filter(c => c.trim() !== '')
      
    return cards.map(card => {
        const nombre = card.match(/FN:(.*)/)?.[1]?.trim() || '';
        const telefono = card.match(/TEL;TYPE=CELL:(.*)/)?.[1]?.trim() || '';  
        const note = card.match(/NOTE:(.*)/)?.[1]?.trim() || '';

        const legajo = note.match(/Legajo:\s*(\d+)/)?.[1] || '';
        const githubMatch = note.match(/Github:\s*([A-Za-z0-9_-]+)/i);
        const github = githubMatch ? githubMatch[1] : "";


        return {
            id: legajo,
            nombre,
            telefono,
            legajo,
            github,
            favorito: false,
        }
    })
}

export async function loadAlumnos() {
    const response = await fetch('/alumnos.vcf')
    const data = await response.text()
    return parseVcf(data)
}