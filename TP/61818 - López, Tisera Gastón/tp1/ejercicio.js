import { prompt, read, write } from './io.js';

class Contacto {
    constructor({ id = null, nombre = '', apellido = '', edad = '', telefono = '', email = '' } = {}) {
        this.id = id;
        this.nombre = nombre;
        this.apellido = apellido;
        this.edad = edad;
        this.telefono = telefono;
        this.email = email;
    }
}

class Agenda {
    constructor() {
        this.contactos = [];
        this.nextId = 1;
    }

    static ordenar(contactos) {
        return [...contactos].sort((a, b) => {
            const apA = (a.apellido || '').toLocaleLowerCase();
            const apB = (b.apellido || '').toLocaleLowerCase();
            if (apA < apB) return -1;
            if (apA > apB) return 1;
            const noA = (a.nombre || '').toLocaleLowerCase();
            const noB = (b.nombre || '').toLocaleLowerCase();
            if (noA < noB) return -1;
            if (noA > noB) return 1;
            return (a.id ?? 0) - (b.id ?? 0);
        });
    }

    agregar(contacto) {
        const c = contacto instanceof Contacto ? contacto : new Contacto(contacto);
        c.id = this.nextId++;
        this.contactos.push(c);
        return c;
    }

    editar(id, updates) {
        const c = this.contactos.find(x => x.id === id);
        if (!c) return false;
        for (const k of ['nombre', 'apellido', 'edad', 'telefono', 'email']) {
            if (Object.prototype.hasOwnProperty.call(updates, k)) {
                const v = updates[k];
                if (v !== '') c[k] = v;
            }
        }
        return true;
    }

    borrar(id) {
        const idx = this.contactos.findIndex(x => x.id === id);
        if (idx < 0) return null;
        const [removed] = this.contactos.splice(idx, 1);
        return removed;
    }

    buscar(texto) {
        const t = (texto || '').toLocaleLowerCase();
        return this.contactos.filter(c => {
            const campos = [c.nombre, c.apellido, c.telefono, c.email, String(c.edad ?? '')];
            return campos.some(v => (v || '').toLocaleLowerCase().includes(t));
        });
    }

    listar() {
        return Agenda.ordenar(this.contactos);
    }

    static async cargar() {
        let contenido = '[]';
        try {
            contenido = await read('./agenda.json');
        } catch (e) {
            // si no existe, arrancamos vacío
            contenido = '[]';
        }
        let datos;
        try {
            datos = JSON.parse(contenido || '[]');
        } catch (_) {
            datos = [];
        }
        const ag = new Agenda();
        ag.contactos = (Array.isArray(datos) ? datos : []).map(o => new Contacto(o));
        const maxId = ag.contactos.reduce((m, c) => Math.max(m, Number(c.id) || 0), 0);
        ag.nextId = maxId + 1;
        return ag;
    }

    async guardar() {
        const plain = this.contactos.map(c => ({
            id: c.id,
            nombre: c.nombre,
            apellido: c.apellido,
            edad: c.edad,
            telefono: c.telefono,
            email: c.email,
        }));
        await write(JSON.stringify(plain, null, 2), './agenda.json');
    }
}

function imprimirEncabezado() {
    console.log('ID Nombre Completo            Edad   Teléfono        Email');
}

function imprimirContacto(c) {
    const id = String(c.id).padStart(2, '0');
    const nombreCompleto = `${c.apellido || ''}, ${c.nombre || ''}`.trim().padEnd(26, ' ');
    const edad = String(c.edad ?? '').padEnd(6, ' ');
    const tel = String(c.telefono ?? '').padEnd(15, ' ');
    const email = String(c.email ?? '');
    console.log(`${id} ${nombreCompleto} ${edad} ${tel} ${email}`);
}

async function pausar() {
    await prompt('\nPresione Enter para continuar...');
}

async function menu() {
    console.log('=== AGENDA DE CONTACTOS ===');
    console.log('1. Listar');
    console.log('2. Agregar');
    console.log('3. Editar');
    console.log('4. Borrar');
    console.log('5. Buscar');
    console.log('0. Finalizar');
    const op = await prompt('\nIngresar opción :> ');
    return op.trim();
}

async function agregarUI(agenda) {
    console.log('\n== Agregando contacto ==');
    const nombre = await prompt('Nombre    :> ');
    const apellido = await prompt('Apellido  :> ');
    let edad = await prompt('Edad      :> ');
    const telefono = await prompt('Teléfono  :> ');
    const email = await prompt('Email     :> ');
    if (edad !== '') {
        const n = parseInt(edad, 10);
        edad = Number.isNaN(n) ? edad : n;
    }
    agenda.agregar(new Contacto({ nombre, apellido, edad, telefono, email }));
    await agenda.guardar();
    console.log('\nContacto agregado.');
}

async function listarUI(agenda, lista = null) {
    const data = lista ?? agenda.listar();
    console.log('\n== Lista de contactos ==');
    if (data.length === 0) {
        console.log('(sin contactos)');
        return;
    }
    imprimirEncabezado();
    for (const c of Agenda.ordenar(data)) imprimirContacto(c);
}

async function editarUI(agenda) {
    console.log('\n== Editar contacto ==');
    const idStr = await prompt('ID contacto :> ');
    const id = parseInt(idStr, 10);
    if (Number.isNaN(id)) {
        console.log('ID inválido.');
        return;
    }
    const c = agenda.contactos.find(x => x.id === id);
    if (!c) {
        console.log('No encontrado.');
        return;
    }
    imprimirEncabezado();
    imprimirContacto(c);
    const nombre = await prompt(`Nombre    (${c.nombre}) :> `);
    const apellido = await prompt(`Apellido  (${c.apellido}) :> `);
    let   edad = await prompt(`Edad      (${c.edad}) :> `);
    const telefono = await prompt(`Teléfono  (${c.telefono}) :> `);
    const email = await prompt(`Email     (${c.email}) :> `);
    if (edad !== '') {
        const n = parseInt(edad, 10);
        edad = Number.isNaN(n) ? edad : n;
    }
    agenda.editar(id, { nombre, apellido, edad, telefono, email });
    await agenda.guardar();
    console.log('\nContacto actualizado.');
}

async function borrarUI(agenda) {
    console.log('\n== Borrar contacto ==');
    const idStr = await prompt('ID contacto :> ');
    const id = parseInt(idStr, 10);
    if (Number.isNaN(id)) {
        console.log('ID inválido.');
        return;
    }
    const c = agenda.contactos.find(x => x.id === id);
    if (!c) {
        console.log('No encontrado.');
        return;
    }
    console.log('\nBorrando...');
    imprimirEncabezado();
    imprimirContacto(c);
    const conf = (await prompt('\n¿Confirma borrado? :> S/N ')).toLowerCase();
    if (conf === 's') {
        agenda.borrar(id);
        await agenda.guardar();
        console.log('Contacto borrado.');
    } else {
        console.log('Operación cancelada.');
    }
}

async function buscarUI(agenda) {
    console.log('\n== Buscar contacto ==');
    const q = await prompt('Buscar :> ');
    const res = agenda.buscar(q);
    if (res.length === 0) {
        console.log('Sin resultados.');
        return;
    }
    imprimirEncabezado();
    for (const c of Agenda.ordenar(res)) imprimirContacto(c);
}

// Bucle principal
const agenda = await Agenda.cargar();
let salir = false;
while (!salir) {
    const op = await menu();
    switch (op) {
        case '1':
            await listarUI(agenda);
            await pausar();
            break;
        case '2':
            await agregarUI(agenda);
            await pausar();
            break;
        case '3':
            await editarUI(agenda);
            await pausar();
            break;
        case '4':
            await borrarUI(agenda);
            await pausar();
            break;
        case '5':
            await buscarUI(agenda);
            await pausar();
            break;
        case '0':
            salir = true;
            break;
        default:
            console.log('Opción inválida.');
            await pausar();
    }
}
console.log('Fin.');