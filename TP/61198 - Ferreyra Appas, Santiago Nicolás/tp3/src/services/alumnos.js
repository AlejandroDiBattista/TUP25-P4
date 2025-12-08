import alumnosVcf from '../alumnos.vcf?raw';
import { norm } from '../utils/text';

function parseVcf(rawText) {
	const cards = [];

	const blocks = rawText.split(/END:VCARD/i);
	for (let block of blocks) {
		if (!/BEGIN:VCARD/i.test(block)) continue;

		const fnMatch = block.match(/FN:(.+)/i);
		const fn = fnMatch ? fnMatch[1].trim() : '';

		const telMatch = block.match(/TEL(?:;[^:]*)?:(.+)/i);
		const tel = telMatch ? telMatch[1].trim() : '';

		const noteMatch = block.match(/NOTE:(.+)/is);
		let note = noteMatch ? noteMatch[1].trim() : '';

		note = note.replace(/\r?\n\s+/g, ' ');

		const legMatch = note.match(/Legajo:\s*([0-9]+)/i);
		const legajo = legMatch ? legMatch[1] : '';

		const ghMatch = note.match(/Github:\s*([A-Za-z0-9-_]+)/i);
		const github = ghMatch ? ghMatch[1] : '';

		const id = legajo ? legajo : `${norm(fn)}_${tel}`;

		cards.push({
			id,
			nombre: fn,
			telefono: tel,
			legajo,
			github,
			favorito: false,
		});
	}
	return cards;
}

export async function loadAlumnos() {
	return parseVcf(alumnosVcf || '');
}
