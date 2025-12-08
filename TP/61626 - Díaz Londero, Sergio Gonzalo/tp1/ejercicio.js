
import {prompt, read, write} from './io.js';

const FILE = 'agenda.json';

class Contacto {
    constructor({id, nombre, apellido, edad, telefono, email} = {}) {
        this.id = id;
        this.nombre = nombre || '';
        this.apellido = apellido || '';
        this.edad = edad || '';
        this.telefono = telefono || '';
        this.email = email || '';
    }
    get nombreCompleto() {
        return `${this.apellido}, ${this.nombre}`;
    }
}

class Agenda {
    constructor() {
        this.contactos = [];
        this.nextId = 1;
    }
    agregar(contacto) {
        contacto.id = this.nextId++;
        this.contactos.push(contacto);
    }
    editar(id, datos) {
        let c = this.contactos.find(x => x.id === id);
        if (c) Object.assign(c, datos);
        return c;
    }
    borrar(id) {
        let idx = this.contactos.findIndex(x => x.id === id);
        if (idx >= 0) {
            return this.contactos.splice(idx, 1)[0];
        }
        return null;
    }
    buscar(texto) {
        texto = texto.toLowerCase();
        return this.contactos.filter(c =>
            c.nombre.toLowerCase().includes(texto) ||
            c.apellido.toLowerCase().includes(texto) ||
            c.email.toLowerCase().includes(texto) ||
            c.telefono.toLowerCase().includes(texto)
        );
    }
    listar() {
        return [...this.contactos].sort((a, b) => {
            if (a.apellido === b.apellido) {
                return a.nombre.localeCompare(b.nombre);
            }
            return a.apellido.localeCompare(b.apellido);
        });
    }
    static async cargar() {
        let datos = await read(FILE);
        let agenda = new Agenda();
        if (datos) {
            let obj;
            try {
                obj = JSON.parse(datos);
            } catch {
                obj = {};
            }
            agenda.contactos = Array.isArray(obj.contactos)
                ? obj.contactos.map(c => new Contacto(c))
                : [];
            agenda.nextId = obj.nextId || (agenda.contactos.length ? Math.max(...agenda.contactos.map(c=>c.id))+1 : 1);
        }
        return agenda;
    }
    async guardar() {
        let obj = {
            contactos: this.contactos,
            nextId: this.nextId
        };
        await write(FILE, JSON.stringify(obj, null, 2));
    }
}

async function pausa() {
    await prompt('Presione Enter para continuar...');
}

function mostrarContactos(lista) {
    console.log('ID Nombre Completo       Edad        Teléfono        Email');
    for (let c of lista) {
        console.log(
            String(c.id).padStart(2, '0'),
            c.nombreCompleto.padEnd(20),
            String(c.edad).padEnd(10),
            String(c.telefono).padEnd(15),
            c.email
        );
    }
}

async function main() {
    let agenda = await Agenda.cargar();
    let salir = false;
    while (!salir) {
        console.log('=== AGENDA DE CONTACTOS ===');
        console.log('1. Listar');
        console.log('2. Agregar');
        console.log('3. Editar');
        console.log('4. Borrar');
        console.log('5. Buscar');
        console.log('0. Finalizar');
        let op = await prompt('Ingresar opción :> ');
        switch (op) {
            case '1':
                console.log('\n== Lista de contactos ==');
                mostrarContactos(agenda.listar());
                await pausa();
                break;
            case '2':
                console.log('\n== Agregando contacto ==');
                let c = new Contacto();
                c.nombre = await prompt('Nombre      :> ');
                c.apellido = await prompt('Apellido    :> ');
                c.edad = await prompt('Edad        :> ');
                c.telefono = await prompt('Teléfono    :> ');
                c.email = await prompt('Email       :> ');
                agenda.agregar(c);
                await agenda.guardar();
                await pausa();
                break;
            case '3':
                console.log('\n== Editar contacto ==');
                mostrarContactos(agenda.listar());
                let idEdit = parseInt(await prompt('ID contacto :> '));
                let contactoEdit = agenda.contactos.find(x => x.id === idEdit);
                if (contactoEdit) {
                    let nombre = await prompt(`Nombre (${contactoEdit.nombre}) :> `) || contactoEdit.nombre;
                    let apellido = await prompt(`Apellido (${contactoEdit.apellido}) :> `) || contactoEdit.apellido;
                    let edad = await prompt(`Edad (${contactoEdit.edad}) :> `) || contactoEdit.edad;
                    let telefono = await prompt(`Teléfono (${contactoEdit.telefono}) :> `) || contactoEdit.telefono;
                    let email = await prompt(`Email (${contactoEdit.email}) :> `) || contactoEdit.email;
                    agenda.editar(idEdit, {nombre, apellido, edad, telefono, email});
                    await agenda.guardar();
                } else {
                    console.log('No existe ese contacto.');
                }
                await pausa();
                break;
            case '4':
                console.log('\n== Borrar contacto ==');
                mostrarContactos(agenda.listar());
                let idBorrar = parseInt(await prompt('ID contacto :> '));
                let contactoBorrar = agenda.contactos.find(x => x.id === idBorrar);
                if (contactoBorrar) {
                    console.log('Borrando...');
                    mostrarContactos([contactoBorrar]);
                    let conf = await prompt('¿Confirma borrado? :> S/N ');
                    if (conf.toUpperCase() === 'S') {
                        agenda.borrar(idBorrar);
                        await agenda.guardar();
                        console.log('Contacto borrado.');
                    } else {
                        console.log('Cancelado.');
                    }
                } else {
                    console.log('No existe ese contacto.');
                }
                await pausa();
                break;
            case '5':
                console.log('\n== Buscar contacto ==');
                let texto = await prompt('Buscar      :> ');
                let encontrados = agenda.buscar(texto);
                mostrarContactos(encontrados);
                await pausa();
                break;
            case '0':
                salir = true;
                break;
            default:
                console.log('Opción inválida.');
                await pausa();
        }
    }
    console.log('Fin del programa.');
}

main();