// Condiciones: 1 → Libre | 2 → Regular | 3 → Promoción TP | 4 → Ap. Directa
const alumnos = [
    { legajo: 54911, condicion: 4, nota:  9, comision: 1 },
    { legajo: 61028, condicion: 4, nota: 10, comision: 3 },
    { legajo: 61032, condicion: 4, nota: 10, comision: 3 },
    { legajo: 61033, condicion: 4, nota: 10, comision: 1 },
    { legajo: 61035, condicion: 4, nota: 10, comision: 1 },
    { legajo: 61037, condicion: 4, nota: 10, comision: 3 },
    { legajo: 61046, condicion: 4, nota: 10, comision: 1 },
    { legajo: 61073, condicion: 4, nota: 10, comision: 1 },
    { legajo: 61084, condicion: 4, nota:  9, comision: 1 },
    { legajo: 61096, condicion: 4, nota: 10, comision: 3 },
    { legajo: 61113, condicion: 4, nota: 10, comision: 3 },
    { legajo: 61115, condicion: 4, nota: 10, comision: 1 },
    { legajo: 61120, condicion: 4, nota: 10, comision: 1 },
    { legajo: 61129, condicion: 4, nota: 10, comision: 3 },
    { legajo: 61131, condicion: 4, nota: 10, comision: 1 },
    { legajo: 61136, condicion: 2, nota:  0, comision: 3 },
    { legajo: 61139, condicion: 4, nota: 10, comision: 3 },
    { legajo: 61141, condicion: 4, nota: 10, comision: 3 },
    { legajo: 61150, condicion: 4, nota: 10, comision: 3 },
    { legajo: 61167, condicion: 4, nota: 10, comision: 1 },
    { legajo: 61197, condicion: 4, nota: 10, comision: 3 },
    { legajo: 61198, condicion: 4, nota: 10, comision: 1 },
    { legajo: 61200, condicion: 4, nota: 10, comision: 3 },
    { legajo: 61203, condicion: 1, nota:  0, comision: 3 },
    { legajo: 61214, condicion: 2, nota:  0, comision: 3 },
    { legajo: 61221, condicion: 4, nota: 10, comision: 3 },
    { legajo: 61236, condicion: 4, nota: 10, comision: 1 },
    { legajo: 61240, condicion: 4, nota: 10, comision: 1 },
    { legajo: 61248, condicion: 4, nota: 10, comision: 3 },
    { legajo: 61271, condicion: 4, nota: 10, comision: 3 },
    { legajo: 61312, condicion: 4, nota: 10, comision: 3 },
    { legajo: 61315, condicion: 4, nota: 10, comision: 1 },
    { legajo: 61319, condicion: 4, nota: 10, comision: 3 },
    { legajo: 61335, condicion: 4, nota: 10, comision: 1 },
    { legajo: 61337, condicion: 1, nota:  0, comision: 1 },
    { legajo: 61338, condicion: 4, nota: 10, comision: 1 },
    { legajo: 61445, condicion: 4, nota: 10, comision: 3 },
    { legajo: 61450, condicion: 4, nota: 10, comision: 3 },
    { legajo: 61468, condicion: 4, nota: 10, comision: 1 },
    { legajo: 61472, condicion: 2, nota:  0, comision: 1 },
    { legajo: 61473, condicion: 4, nota: 10, comision: 3 },
    { legajo: 61478, condicion: 4, nota: 10, comision: 3 },
    { legajo: 61551, condicion: 2, nota:  0, comision: 1 },
    { legajo: 61565, condicion: 4, nota: 10, comision: 1 },
    { legajo: 61572, condicion: 4, nota: 10, comision: 3 },
    { legajo: 61579, condicion: 4, nota: 10, comision: 3 },
    { legajo: 61624, condicion: 1, nota:  0, comision: 3 },
    { legajo: 61626, condicion: 4, nota: 10, comision: 3 },
    { legajo: 61627, condicion: 4, nota: 10, comision: 3 },
    { legajo: 61667, condicion: 4, nota: 10, comision: 3 },
    { legajo: 61676, condicion: 4, nota: 10, comision: 3 },
    { legajo: 61719, condicion: 4, nota: 10, comision: 3 },
    { legajo: 61725, condicion: 4, nota: 10, comision: 1 },
    { legajo: 61793, condicion: 4, nota: 10, comision: 3 },
    { legajo: 61794, condicion: 4, nota: 10, comision: 3 },
    { legajo: 61805, condicion: 1, nota:  0, comision: 1 },
    { legajo: 61818, condicion: 4, nota:  9, comision: 3 },
    { legajo: 61911, condicion: 4, nota: 10, comision: 1 },
    { legajo: 61993, condicion: 4, nota: 10, comision: 1 },
    { legajo: 62053, condicion: 4, nota: 10, comision: 3 },
    { legajo: 62055, condicion: 4, nota: 10, comision: 3 },
    { legajo: 62093, condicion: 4, nota: 10, comision: 3 },
    { legajo: 62172, condicion: 4, nota: 10, comision: 3 },
    { legajo: 62175, condicion: 4, nota: 10, comision: 1 },
    { legajo: 62263, condicion: 4, nota: 10, comision: 3 },
    { legajo: 62318, condicion: 2, nota:  0, comision: 1 },
    { legajo: 62555, condicion: 4, nota: 10, comision: 3 },
]

const $    = (selector, origen=document) => origen?.querySelector(selector) ?? null
const fila = legajo => $(`input[name="legajo"][value="${legajo}"]`)?.closest('tr')

const comision    = $('.tituloTabla').textContent.match(/Comisión\s*(\d+)/)[1]
const enCondicion = $('select[name="nota"]')  // Cuando esta editando la condición
const enNota      = $('input[name="nota"]')   // Cuando esta editando la nota

console.log(`=== Comisión [${comision}] | Condicion: ${enCondicion} | Notas: ${enNota} ===`)
for(const {legajo, condicion, nota} of alumnos.filter(a => a.comision == comision)){
    const destino = fila(legajo)
    if (enCondicion) {
        $('select[name="nota"]', destino).selectedIndex = condicion;
    }
    if (enNota) {
        $('input[name="nota"]', destino).value = condicion == 4 ? nota : "";
    }
}