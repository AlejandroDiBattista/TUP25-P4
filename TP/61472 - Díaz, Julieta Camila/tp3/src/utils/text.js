export function norm(str) {
    if (!str) return '';
    return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}


export function cmpNombre(a, b) {
    const normA = norm(a.nombre);
    const normB = norm(b.nombre);
    if (normA < normB) return -1;
    if (normA > normB) return 1;
    return 0;
}


export function includesContacto(alumno, searchTerm) {
    const term = norm(searchTerm);
    if (!term) return true;

    const nombreNorm = norm(alumno.nombre);
    const telefonoNorm = norm(alumno.telefono);
    const legajoNorm = norm(alumno.legajo);

    return (
        nombreNorm.includes(term) ||
        telefonoNorm.includes(term) ||
        legajoNorm.includes(term)
    );
}