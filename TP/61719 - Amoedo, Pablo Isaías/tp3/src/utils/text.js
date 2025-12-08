
export function norm(str) {
    return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}


export function cmpNombre(a, b) {
    return norm(a.nombre).localeCompare(norm(b.nombre));
}


export function includesContacto(contacto, term) {
    const t = norm(term);
    return (
        norm(contacto.nombre).includes(t) ||
        norm(contacto.telefono).includes(t) ||
        norm(contacto.legajo).includes(t)
    );
}