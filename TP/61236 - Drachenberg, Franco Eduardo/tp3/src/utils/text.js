export function normalizar(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function cmpNombre(a, b) {
  return normalizar(a.nombre).localeCompare(normalizar(b.nombre));
}

export function includesContacto(contacto, busqueda) {
  const busquedaNorm = normalizar(busqueda);
  const { nombre, legajo, telefono } = contacto;

  return (
    normalizar(nombre).includes(busquedaNorm) ||
    normalizar(legajo).includes(busquedaNorm) ||
    normalizar(telefono).includes(busquedaNorm)
  );
}
