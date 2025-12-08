// Función para normalizar y parsear el VCF
export function parseVcf(text) {
    const tarjetas = text.split("END:VCARD").map(t => t.trim()).filter(Boolean);

    return tarjetas.map(t => {
        const nombre = (t.match(/FN:(.*)/)?.[1] || "").trim();
        const telefono = (t.match(/TEL;TYPE=CELL:(.*)/)?.[1] || "").trim();
        const nota = (t.match(/NOTE:(.*)/)?.[1] || "").trim();

    // Extraer legajo y github 
    const legajoMatch = nota.match(/Legajo:\s*(\d+)/i);
    const githubMatch = nota.match(/Github:\s*(\S+)/i);

    const legajo = legajoMatch ? legajoMatch[1] : "";
    const github = githubMatch ? githubMatch[1] : "";

    return {
        id: legajo,
        nombre,
        telefono,
        legajo,
        github,
        favorito: false,
        };
    });
}

// Cargar archivo 
export async function loadAlumnos() {
    const resp = await fetch("/alumnos.vcf");
    const text = await resp.text();
    return parseVcf(text);
}