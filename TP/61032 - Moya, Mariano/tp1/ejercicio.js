import { prompt, read, write } from './io.js';

class Contacto {
    constructor({ id, nombre, apellido, edad, telefono, email }) {
        this.id = id;
        this.nombre = nombre;
        this.apellido = apellido;
        this.edad = edad;
        this.telefono = telefono;
        this.email = email;
    }
}

class Agenda {
    constructor(contactos = [], ultimoId = 0) {
        this.contactos = contactos;
        this.ultimoId = ultimoId;
    }

    static async cargar() {
        try {
            const data = await read('./agenda.json');
            const arr = JSON.parse(data);
            const ultimoId = arr.reduce((max, c) => c.id > max ? c.id : max, 0);
            return new Agenda(arr, ultimoId);
        } catch {
            return new Agenda();
        }
    }

    async guardar() {
        await write(JSON.stringify(this.contactos, null, 2), './agenda.json');
    }

    agregar(contacto) {
        this.ultimoId++;
        contacto.id = this.ultimoId.toString().padStart(2, '0');
        this.contactos.push(contacto);
    }

    editar(id, datos) {
        const idx = this.contactos.findIndex(c => c.id === id);
        if (idx !== -1) {
            this.contactos[idx] = { ...this.contactos[idx], ...datos };
            return true;
        }
        return false;
    }

    borrar(id) {
        const idx = this.contactos.findIndex(c => c.id === id);
        if (idx !== -1) {
            const borrado = this.contactos.splice(idx, 1)[0];
            return borrado;
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

    getPorId(id) {
        return this.contactos.find(c => c.id === id);
    }
}

async function pausa() {
    await prompt('Presione Enter para continuar...');
}

function mostrarContactos(lista) {
    console.log('ID Nombre Completo       Edad        Teléfono        Email');
    for (const c of lista) {
        console.log(
            `${c.id} ${c.apellido}, ${c.nombre}`.padEnd(22) +
            `${String(c.edad).padEnd(12)}` +
            `${String(c.telefono).padEnd(16)}` +
            `${c.email}`
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
        const op = await prompt('Ingresar opción :> ');
        console.log('-----');
        switch (op) {
            case '1':
                console.log('== Lista de contactos ==');
                mostrarContactos(agenda.listar());
                await pausa();
                break;
            case '2':
                console.log('== Agregando contacto ==');
                const nombre = await prompt('Nombre      :> ');
                const apellido = await prompt('Apellido    :> ');
                const edad = await prompt('Edad        :> ');
                const telefono = await prompt('Teléfono    :> ');
                const email = await prompt('Email       :> ');
                agenda.agregar(new Contacto({ nombre, apellido, edad, telefono, email }));
                await agenda.guardar();
                await pausa();
                break;
            case '3':
                console.log('== Editar contacto ==');
                const idEdit = await prompt('ID contacto :> ');
                const contactoEdit = agenda.getPorId(idEdit);
                if (!contactoEdit) {
                    console.log('No existe ese contacto.');
                    await pausa();
                    break;
                }
                mostrarContactos([contactoEdit]);
                const nombreE = await prompt(`Nombre [${contactoEdit.nombre}] :> `) || contactoEdit.nombre;
                const apellidoE = await prompt(`Apellido [${contactoEdit.apellido}] :> `) || contactoEdit.apellido;
                const edadE = await prompt(`Edad [${contactoEdit.edad}] :> `) || contactoEdit.edad;
                const telefonoE = await prompt(`Teléfono [${contactoEdit.telefono}] :> `) || contactoEdit.telefono;
                const emailE = await prompt(`Email [${contactoEdit.email}] :> `) || contactoEdit.email;
                agenda.editar(idEdit, { nombre: nombreE, apellido: apellidoE, edad: edadE, telefono: telefonoE, email: emailE });
                await agenda.guardar();
                await pausa();
                break;
            case '4':
                console.log('== Borrar contacto ==');
                const idBorrar = await prompt('ID contacto :> ');
                const contactoBorrar = agenda.getPorId(idBorrar);
                if (!contactoBorrar) {
                    console.log('No existe ese contacto.');
                    await pausa();
                    break;
                }
                console.log('Borrando...');
                mostrarContactos([contactoBorrar]);
                const conf = await prompt('¿Confirma borrado? :> S/N ');
                if (conf.toUpperCase() === 'S') {
                    agenda.borrar(idBorrar);
                    await agenda.guardar();
                    console.log('Contacto borrado.');
                } else {
                    console.log('Cancelado.');
                }
                await pausa();
                break;
            case '5':
                console.log('== Buscar contacto ==');
                const texto = await prompt('Buscar      :> ');
                const encontrados = agenda.buscar(texto);
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
        console.log('-----');
    }
}

main();