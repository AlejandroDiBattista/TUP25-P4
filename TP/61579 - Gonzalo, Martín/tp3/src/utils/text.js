export function norm(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function cmpNombre(a, b) {
  return norm(a.nombre).localeCompare(norm(b.nombre));
}

export function includesContacto(contacto, texto) {
  const txt = norm(texto);
  return (
    norm(contacto.nombre).includes(txt) ||
    contacto.telefono.includes(txt) ||
    contacto.legajo.includes(txt)
  );
}