export function norm(texto) {
  if (!texto) return "";
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export function cmpNombre(a, b) {
  const na = norm(a.nombre);
  const nb = norm(b.nombre);
  if (na < nb) return -1;
  if (na > nb) return 1;
  return 0;
}

export function includesContacto(alumno, termino) {
  const t = norm(termino);

  return (
    norm(alumno.nombre).includes(t) ||
    norm(alumno.telefono).includes(t) ||
    norm(String(alumno.legajo)).includes(t)
  );
}
