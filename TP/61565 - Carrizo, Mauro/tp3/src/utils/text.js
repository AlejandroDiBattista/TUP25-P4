// src/utils/text.js
// Normaliza texto: quita acentos, pasa a minúscula y recorta espacios
export function norm(s = "") {
return s
.normalize('NFD')
.replace(/\p{Diacritic}/gu, '')
.toLowerCase()
.trim();
}


export function cmpNombre(a, b) {
const na = norm(a?.nombre || '');
const nb = norm(b?.nombre || '');
return na.localeCompare(nb, 'es');
}


export function includesContacto(alumno, termino) {
const t = norm(termino);
if (!t) return true; // sin filtro


const fields = [alumno.nombre, alumno.telefono, alumno.legajo].map(norm);
return fields.some(f => f.includes(t));
} 