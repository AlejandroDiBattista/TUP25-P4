import { loadAlumnos } from "../services/alumnos";

// Calcular cantidad de alumnos
export function cantidadAlumnos() {
  return alumnos.length;
}

// Calcular promedio de edad
export function promedioEdad() {
  const total = alumnos.reduce((acc, alumno) => acc + alumno.edad, 0);
  return (total / alumnos.length).toFixed(2);
}

// Filtrar mayores de edad
export function mayoresEdad() {
  return alumnos.filter((alumno) => alumno.edad >= 18);
}

// Normalizar texto (sin acentos y en minúsculas)
export function norm(texto) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

// Comparar nombres normalizados para ordenar alfabéticamente
export function cmpNombre(a, b) {
  return norm(a.nombre).localeCompare(norm(b.nombre));
}

// Verificar si un texto coincide con el nombre, teléfono o legajo de un alumno
export function includesContacto(alumno, texto) {
  const textoNormalizado = norm(texto);
  return (
    norm(alumno.nombre).includes(textoNormalizado) ||
    norm(alumno.telefono).includes(textoNormalizado) ||
    norm(alumno.legajo).includes(textoNormalizado)
  );
}
