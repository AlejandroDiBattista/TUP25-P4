import alumnosVcf from '../alumnos.vcf?raw'; 


const VCF_REGEX = /BEGIN:VCARD[\s\S]*?FN:(.+?)\r?\n[\s\S]*?TEL;TYPE=CELL:(.+?)\r?\n[\s\S]*?NOTE:Legajo: (\d+)[\s\S]*?(?:Github: (\w+))?[\s\S]*?END:VCARD/g;


export function parseVcf() {
    const alumnos = [];
    let match;

    while ((match = VCF_REGEX.exec(alumnosVcf)) !== null) {
        
        const [, nombre, telefono, legajo, github] = match;

        alumnos.push({
            id: legajo.trim(), 
            nombre: nombre.trim(),
            telefono: telefono.trim(),
            legajo: legajo.trim(),
            github: github ? github.trim() : '', 
            favorito: false, 
        });
    }

    VCF_REGEX.lastIndex = 0; 
    return alumnos;
}


export function loadAlumnos() {
    return parseVcf();
}