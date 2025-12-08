export function norm(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function cmpNombre(a, b) {
  return norm(a.nombre).localeCompare(norm(b.nombre));
}

export function includesContacto(alumno, filtro) {
  const f = norm(filtro);
  return (
    norm(alumno.nombre).includes(f) ||
    norm(alumno.telefono).includes(f) ||
    norm(alumno.legajo).includes(f)
  );
}
