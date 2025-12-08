// Servicio de datos para alumnos
// Funciones: parseVcf, loadAlumnos

/**
 * Parsea el texto VCF y retorna un array de objetos alumno
 * @param {string} vcf
 * @returns {Array<{id: string, nombre: string, telefono: string, legajo: string, github: string, favorito: boolean}>}
 */
export function parseVcf(vcf) {
	const tarjetas = vcf.split(/END:VCARD/).filter(Boolean);
	return tarjetas.map(card => {
		const nombre = (card.match(/FN:(.+)/) || [])[1]?.trim() || "";
		const telefono = (card.match(/TEL;TYPE=CELL:(.+)/) || [])[1]?.trim() || "";
		const note = (card.match(/NOTE:(.+)/) || [])[1]?.trim() || "";
		const legajo = (note.match(/Legajo:\s*(\d+)/i) || [])[1] || "";
		const github = (note.match(/Github:\s*([\w-]+)/i) || [])[1] || "";
		return {
			id: legajo,
			nombre,
			telefono,
			legajo,
			github,
			favorito: false
		};
	}).filter(a => a.id);
}

/**
 * Carga el archivo alumnos.vcf como texto y lo parsea
 * @returns {Promise<Array>}
 */
export async function loadAlumnos() {
	// Cargar el archivo desde public usando fetch
	const res = await fetch('/alumnos.vcf');
	const vcf = await res.text();
	return parseVcf(vcf);
}
