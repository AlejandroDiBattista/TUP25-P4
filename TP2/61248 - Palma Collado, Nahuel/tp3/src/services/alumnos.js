export function parseVcf(vcfText = '') {
    if (!vcfText) return [];

    // Separar tarjetas
    const rawCards = vcfText
        .split(/END:VCARD\s*/i)
        .map(s => s.trim())
        .filter(Boolean);

    const alumnos = rawCards.map(card => {
        // Normalizar líneas
        const unfolded = card.replace(/\r?\n[ \t]+/g, ' ');

        // Nombre completo
        const fnMatch = unfolded.match(/FN:(.+)/i);
        const nombre = fnMatch ? fnMatch[1].trim() : '';

        // Teléfono
        let telefono = '';
        const telCell = unfolded.match(/TEL[^:\r\n]*CELL[^:]*:(.+)/i);
        if (telCell) telefono = telCell[1].trim();
        else {
            const telAny = unfolded.match(/TEL[^:]*:(.+)/i);
            if (telAny) telefono = telAny[1].trim();
        }

        // Extraer legajo y github si existen
        const noteMatch = unfolded.match(/NOTE:(.+)/i);
        let legajo = '';
        let github = '';
        if (noteMatch) {
            const note = noteMatch[1].trim();
            const legMatch = note.match(/Legajo:\s*(\d+)/i);
            if (legMatch) legajo = legMatch[1];

            const ghMatch = note.match(/Github:\s*([A-Za-z0-9-]+)/i);
            if (ghMatch) github = ghMatch[1].trim();
        }

        return {
            id: legajo,
            nombre,
            telefono,
            legajo,
            github: github || '',
            favorito: false,
        };
    });

    return alumnos;
}

export async function loadAlumnos() {
    const res = await fetch('/alumnos.vcf');
    if (!res.ok) throw new Error('No se pudo cargar /alumnos.vcf');
    const text = await res.text();
    return parseVcf(text);
}