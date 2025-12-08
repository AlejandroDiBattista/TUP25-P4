// src/services/alumnos.js
export function parseVcf(vcfText) {
// Se asume vCard 3.0 y un patrón fijo por tarjeta
// Cada tarjeta comienza con BEGIN:VCARD y termina con END:VCARD
const cards = vcfText.split(/BEGIN:VCARD|END:VCARD/).map(s => s.trim()).filter(Boolean);


const alumnos = cards.map(card => {
// FN
const fnMatch = card.match(/^FN:(.+)$/m);
const nombre = fnMatch ? fnMatch[1].trim() : "";


// TEL;TYPE=CELL
const telMatch = card.match(/^TEL;[^:]*:(.+)$/m);
const telefono = telMatch ? telMatch[1].trim() : "";


// NOTE (contiene Legajo: <n> ... Github: <usuario>)
const noteMatch = card.match(/^NOTE:(.+)$/ms);
const note = noteMatch ? noteMatch[1].trim().replace(/\\n/g, ' ') : '';


let legajo = '';
let github = '';


const legajoMatch = note.match(/Legajo:\s*(\d+)/i);
if (legajoMatch) legajo = legajoMatch[1];


const ghMatch = note.match(/Github:\s*([A-Za-z0-9\-_.]+)/i);
if (ghMatch) github = ghMatch[1];


return {
id: legajo || `${nombre}-${telefono}`,
nombre,
telefono,
legajo,
github: github || "",
favorito: false,
};
});


return alumnos;
}


export async function loadAlumnos(vcfText) {
// Si en el futuro se necesita fetchear, hacerlo aquí. Por ahora parse inmediato.
return parseVcf(vcfText);
}