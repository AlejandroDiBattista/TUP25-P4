import { cmpNombre } from '../utils/text';

function unfoldVcf(raw) {
    return raw
        .replace(/\r\n/g, '\n')   
        .replace(/\n[ \t]/g, '');   
}

export function parseVcf(raw) {
    const text = unfoldVcf(raw);

    const cards = [...text.matchAll(/BEGIN:VCARD([\s\S]*?)END:VCARD/g)].map(m => m[1]);

    const alumnos = cards.map((chunk, i) => {
        const get = (re) => {
            const m = chunk.match(re);
            return m ? m[1].trim() : '';
        };

        const nombre = get(/(?:^|\n)FN:(.+)/);
        const telRaw = get(/(?:^|\n)TEL[^:]*:(.+)/);
        const telefono = telRaw.replace(/[^\d+]/g, '').replace(/^00/, '+');

        const note = get(/(?:^|\n)NOTE:(.+)/);
        const legajo = (() => {
            const m = note.match(/legajo:\s*(\d+)/i);
            return m ? Number(m[1]) : null;
        })();

    const github = (() => {
        const m = note.match(/github:\s*([A-Za-z0-9-]+)/i);
        return m ? m[1] : '';
    })();

    return {
        id: legajo ?? `${i}-${nombre}-${telefono || 'sintel'}`,
        nombre,
        telefono,
        legajo,
        github,
        favorito: false,
        avatar: github ? `https://github.com/${github}.png?size=100` : null,
        };
    });

    return alumnos.sort((a, b) => cmpNombre(a.nombre, b.nombre));
}

export async function loadAlumnos() {
    const res = await fetch('/alumnos.vcf');
    if (!res.ok) throw new Error('No pude cargar /alumnos.vcf');
    const raw = await res.text();
    return parseVcf(raw);
}