export function norm(str) {
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
}

export function cmpNombre(a, b) {
    return norm(a.nombre).localeCompare(norm(b.nombre))
}

export function includesContacto(alumno, filtro) {
    const filtroNom = norm(filtro)
    return (
        norm(alumno.nombre).includes(filtroNom) ||
        norm(alumno.telefono).includes(filtroNom) ||
        norm(alumno.legajo).includes(filtroNom)
    )
}

