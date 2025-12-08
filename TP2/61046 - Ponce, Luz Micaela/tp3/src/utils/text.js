export function norm(text){
    return text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
}

export function cmpNombre(a, b){
    return norm(a.nombre).localeCompare(norm(b.nombre));
}

export function includesContacto(contact, term){
    const nTerm = norm(term);
    return (
        norm(contact.nombre).includes(nTerm)
        || norm(contact.telefono ?? "").includes(nTerm)
        || norm(contact.legajo ?? "").includes(nTerm)
    );
}