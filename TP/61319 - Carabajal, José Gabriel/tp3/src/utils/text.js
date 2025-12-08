export function norm(s) {
    if (!s) return '';
    return s
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') 
        .toLowerCase()
        .trim();
}

export function cmpNombre(a, b) {
    const na = norm(a);
    const nb = norm(b);
    return na.localeCompare(nb);
}

export function includesContacto(c, q) {
    const n = norm(q);
    if (!n) return true;

    const nombre = norm(c.nombre);
    const tel = String(c.telefono ?? '').replace(/\D+/g, ''); 
    const leg = String(c.legajo ?? '');

    return (
        nombre.includes(n) ||
        tel.includes(n) ||
        leg.includes(n)
    );
}