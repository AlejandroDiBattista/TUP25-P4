import {prompt, read, write} from './io.js';

class Contacto {
    #id;
    #nombre;
    #apellido;
    #edad;
    #telefono;
    #email;

    constructor({ id = null, nombre = '', apellido = '', edad = '', telefono = '', email = '' } = {}) {
        this.#id = id == null ? null : Number(id);
        this.#nombre = String(nombre || '').trim();
        this.#apellido = String(apellido || '').trim();
        this.#edad = String(edad || '').trim();
        this.#telefono = String(telefono || '').trim();
        this.#email = String(email || '').trim();
    }

    get id() {
        return this.#id;
    }
    set id(value) {
        if (this.#id != null) {
            throw new Error('ID no puede ser modificado una vez asignado');
        }
        const n = Number(value);
        if (Number.isNaN(n) || n <= 0) throw new Error('ID inválido');
        this.#id = n;
    }

    get nombre() { return this.#nombre; }
    set nombre(v) { this.#nombre = String(v || '').trim(); }

    get apellido() { return this.#apellido; }
    set apellido(v) { this.#apellido = String(v || '').trim(); }

    get edad() { return this.#edad; }
    set edad(v) { this.#edad = String(v || '').trim(); }

    get telefono() { return this.#telefono; }
    set telefono(v) { this.#telefono = String(v || '').trim(); }

    get email() { return this.#email; }
    set email(v) { this.#email = String(v || '').trim(); }

    get nombreCompleto() {
        return `${this.#apellido}, ${this.#nombre}`.trim();
    }

    toJSON() {
        return {
            id: this.#id,
            nombre: this.#nombre,
            apellido: this.#apellido,
            edad: this.#edad,
            telefono: this.#telefono,
            email: this.#email,
        };
    }

    static fromJSON(obj = {}) {
        return new Contacto(obj);
    }
}

class Agenda {
    #contactos;
    static #proximoId = 1;

    constructor(contactos = []) {
        this.#contactos = contactos;
    }

    static obtenerId() {
        return Agenda.#proximoId++;
    }

    agregar(contacto) {
        if (!contacto.id) contacto.id = Agenda.obtenerId();
        this.#contactos.push(contacto);
        return contacto;
    }

    buscarPorId(id) {
        return this.#contactos.find(c => String(c.id) === String(id)) || null;
    }

    // Editar: reemplaza los campos no vacíos
    editar(id, nuevosCampos = {}) {
        const c = this.buscarPorId(id);
        if (!c) return null;
        Object.keys(nuevosCampos).forEach(k => {
            const v = nuevosCampos[k];
            if (v !== undefined && v !== null && String(v).trim() !== '') c[k] = v;
        });
        return c;
    }

    // Borrar por id, devuelve el eliminado o null si no existe
    borrar(id) {
        const idx = this.#contactos.findIndex(c => String(c.id) === String(id));
        if (idx === -1) return null;
        return this.#contactos.splice(idx, 1)[0];
    }

    // Listar ordenado por apellido, luego nombre
    listarOrdenado() {
        return [...this.#contactos].sort((a, b) => {
            const ap = String(a.apellido || '').localeCompare(String(b.apellido || ''), 'es', { sensitivity: 'base' });
            if (ap !== 0) return ap;
            return String(a.nombre || '').localeCompare(String(b.nombre || ''), 'es', { sensitivity: 'base' });
        });
    }

    buscar(texto) {
        const q = String(texto || '').toLowerCase();
        return this.#contactos.filter(c => {
            return (
                String(c.nombre || '').toLowerCase().includes(q) ||
                String(c.apellido || '').toLowerCase().includes(q) ||
                String(c.email || '').toLowerCase().includes(q) ||
                String(c.telefono || '').toLowerCase().includes(q) ||
                String(c.edad || '').toLowerCase().includes(q)
            );
        });
    }

    static async cargar(origen = './agenda.json') {
        try {
            const raw = await read(origen);
            const arr = JSON.parse(raw || '[]');
            const contactos = (arr || []).map(obj => Contacto.fromJSON(obj));
            // Recalcular proximoId
            const maxId = contactos.reduce((m, c) => Math.max(m, Number(c.id) || 0), 0);
            Agenda.#proximoId = maxId + 1 || 1;
            return new Agenda(contactos);
        } catch (e) {
            // Si no existe el archivo o está vacío, crear agenda vacía
            Agenda.#proximoId = 1;
            return new Agenda([]);
        }
    }

    async guardar(destino = './agenda.json') {
        const texto = JSON.stringify(this.#contactos.map(c => c.toJSON()), null, 2);
        await write(texto, destino);
    }
}

function formatTabla(contactos) {
    // columnas: ID, Nombre Completo, Edad, Teléfono, Email
    const rows = contactos.map(c => ({
        ID: String(c.id).padStart(2, '0'),
        Nombre: c.nombreCompleto.padEnd(25, ' '),
        Edad: String(c.edad).padStart(3, ' '),
        Telefono: (c.telefono || '').padEnd(15, ' '),
        Email: c.email || ''
    }));
    
    console.log('ID Nombre Completo           Edad  Teléfono        Email');
    rows.forEach(r => {
        console.log(`${r.ID} ${r.Nombre} ${r.Edad}   ${r.Telefono} ${r.Email}`);
    });
}

async function pausar() {
    await prompt('\nPresione Enter para continuar...');
}

// Flujo principal del menú
async function mainInteractive() {
    const agenda = await Agenda.cargar();
    let terminar = false;
    while (!terminar) {
        console.clear();
        console.log('=== AGENDA DE CONTACTOS ===');
        console.log('1. Listar');
        console.log('2. Agregar');
        console.log('3. Editar');
        console.log('4. Borrar');
        console.log('5. Buscar');
        console.log('0. Finalizar');
        const opc = await prompt('\nIngresar opción :> ');
        switch (opc) {
            case '1':
                console.log('\n== Lista de contactos ==\n');
                const list = agenda.listarOrdenado();
                if (list.length === 0) console.log('(Sin contactos)'); else formatTabla(list);
                await pausar();
                break;
            case '2':
                console.log('\n== Agregando contacto ==\n');
                const nombre = await prompt('Nombre      :> ');
                const apellido = await prompt('Apellido    :> ');
                const edad = await prompt('Edad        :> ');
                const telefono = await prompt('Teléfono    :> ');
                const email = await prompt('Email       :> ');
                const c = new Contacto({ nombre, apellido, edad, telefono, email });
                agenda.agregar(c);
                await agenda.guardar();
                console.log('\nContacto agregado.');
                await pausar();
                break;
            case '3':
                console.log('\n== Editar contacto ==\n');
                const idEdit = await prompt('ID contacto :> ');
                const existente = agenda.buscarPorId(idEdit);
                if (!existente) {
                    console.log('No se encontró contacto con ese ID.');
                    await pausar();
                    break;
                }
                console.log('\nContacto encontrado:');
                formatTabla([existente]);
                console.log('\nIngrese nuevos valores (dejar vacío para mantener)');
                const nNombre = await prompt(`Nombre (${existente.nombre}) :> `);
                const nApellido = await prompt(`Apellido (${existente.apellido}) :> `);
                const nEdad = await prompt(`Edad (${existente.edad}) :> `);
                const nTelefono = await prompt(`Teléfono (${existente.telefono}) :> `);
                const nEmail = await prompt(`Email (${existente.email}) :> `);
                agenda.editar(idEdit, { nombre: nNombre, apellido: nApellido, edad: nEdad, telefono: nTelefono, email: nEmail });
                await agenda.guardar();
                console.log('\nContacto actualizado.');
                await pausar();
                break;
            case '4':
                console.log('\n== Borrar contacto ==\n');
                const idB = await prompt('ID contacto :> ');
                const porBorrar = agenda.buscarPorId(idB);
                if (!porBorrar) {
                    console.log('No se encontró contacto con ese ID.');
                    await pausar();
                    break;
                }
                console.log('\nBorrando...');
                formatTabla([porBorrar]);
                const conf = (await prompt('\n¿Confirma borrado? :> (S/N) ')).toLowerCase();
                if (conf === 's' || conf === 'si') {
                    agenda.borrar(idB);
                    await agenda.guardar();
                    console.log('\nContacto borrado.');
                } else {
                    console.log('\nBorrado cancelado.');
                }
                await pausar();
                break;
            case '5':
                console.log('\n== Buscar contacto ==\n');
                const q = await prompt('Buscar      :> ');
                const res = agenda.buscar(q);
                if (res.length === 0) console.log('\n(No se encontraron coincidencias)'); else formatTabla(res);
                await pausar();
                break;
            case '0':
                terminar = true;
                break;
            default:
                console.log('\nOpción inválida');
                await pausar();
                break;
        }
    }
}

await mainInteractive();
