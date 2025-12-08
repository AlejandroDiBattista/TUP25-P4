export function norm(input = '') {
    if (input == null) return '';
    const s = String(input);

    return s
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
}

export function cmpNombre(a = {}, b = {}) {
    const na = norm(a.nombre || '');
    const nb = norm(b.nombre || '');
    if (na < nb) return -1;
    if (na > nb) return 1;
    return 0;
}

export function includesContacto(alumno = {}, query) {
    if (!query) return true;

    const q = norm(String(query));

    // Nombre
    const nombre = norm(alumno.nombre || '');
    if (nombre.includes(q)) return true;

    // Legajo
    const legajo = norm(String(alumno.legajo || ''));
    if (legajo.includes(q)) return true;

    // Teléfono
    const onlyDigits = (str = '') => String(str).replace(/\D/g, '');
    const qDigits = onlyDigits(query);
    const telDigits = onlyDigits(alumno.telefono || '');
    if (qDigits && telDigits.includes(qDigits)) return true;

    // También se chequea si la búsqueda textual aparece en teléfono formateado
    const telefonoText = norm(alumno.telefono || '')
    if (telefonoText.includes(q)) return true;

    return false;
}