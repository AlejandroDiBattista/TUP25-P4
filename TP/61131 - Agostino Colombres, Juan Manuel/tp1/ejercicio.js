import { prompt, read, write } from './io.js';

class Contacto {
    constructor(nombre, apellido, edad, telefono, mail) {
        this.nombre = nombre;
        this.apellido = apellido;
        this.edad = edad;
        this.telefono = telefono;
        this.mail = mail;
    }
    mostrarContacto() {
        return `${this.nombre} ${this.apellido}, Edad: ${this.edad}, Tel: ${this.telefono}, Mail: ${this.mail}`;
    }
}

class Agenda {
    constructor() {
        this.contactos = [];
    }

    async cargar() {
        try {
            const data = await read();
            this.contactos = JSON.parse(data) || [];
        } catch (e) {
            this.contactos = [];
        }
    }

    async guardar() {
        const data = JSON.stringify(this.contactos, null, 2);
        await write(data);
        console.log('Agenda guardada!');
    }

    agregar(contacto) {
        this.contactos.push(contacto);
        console.log('Contacto agregado!');
        write(JSON.stringify(this.contactos, null, 2));
    }

    listar() {
        if (this.contactos.length === 0) {
            console.log('\nLa agenda está vacía');
        } else {
            console.log('\nID  Nombre y Apellido         Edad   Teléfono         Mail');
            console.log('---------------------------------------------------------------');
            this.contactos.forEach((c, i) => {
                const id = String(i + 1).padEnd(3);
                const nombre = `${c.nombre} ${c.apellido}`.padEnd(24);
                const edad = String(c.edad).padEnd(9);
                const telefono = String(c.telefono).padEnd(20);
                const mail = String(c.mail).padEnd(25);
                console.log(`${id}${nombre}${edad}${telefono}${mail}`);
            });
        }
    }


    buscarContacto(termino) {
        const resultados = this.contactos.filter(c =>
            c.nombre.toLowerCase().includes(termino.toLowerCase()) ||
            c.apellido.toLowerCase().includes(termino.toLowerCase()) ||
            c.telefono.includes(termino) ||
            c.mail.toLowerCase().includes(termino.toLowerCase())
        );
        if (resultados.length === 0) {
            console.log('\nNo se encontraron contactos.');
        } else {
            console.log('\nResultados de la búsqueda:\n');
            resultados.forEach((c, i) => {
                console.log(`${i + 1}. ${new Contacto(c.nombre, c.apellido, c.edad, c.telefono, c.mail).mostrarContacto()}`);
            });
        }
        return resultados;
    }

    async editarContacto(termino) {
        const resultados = this.buscarContacto(termino);
        if (resultados.length === 0) return;
        if (resultados.length === 1) {
            await this.editarPorIndice(this.contactos.indexOf(resultados[0]));
        } else {
            console.log('\nSe encontraron varios contactos.');
            resultados.forEach((c, i) => {
                const idx = this.contactos.indexOf(c);
                console.log(`${idx + 1}. ${new Contacto(c.nombre, c.apellido, c.edad, c.telefono, c.mail).mostrarContacto()}`);
            });
            const idStr = await prompt('Ingrese el número (ID) del contacto a editar: ');
            const id = parseInt(idStr) - 1;
            if (id >= 0 && id < this.contactos.length) {
                await this.editarPorIndice(id);
            } else {
                console.log('ID inválido.');
            }
        }
    }

    async editarPorIndice(indice) {
        const contacto = this.contactos[indice];
        if (!contacto) {
            console.log('\nContacto no encontrado.');
            return;
        }
        const nuevosDatos = {};
        nuevosDatos.nombre = await prompt('Nuevo nombre (dejar en blanco para no cambiar): ');
        nuevosDatos.apellido = await prompt('Nuevo apellido (dejar en blanco para no cambiar): ');
        nuevosDatos.edad = await prompt('Nueva edad (dejar en blanco para no cambiar): ');
        nuevosDatos.telefono = await prompt('Nuevo teléfono (dejar en blanco para no cambiar): ');
        nuevosDatos.mail = await prompt('Nuevo mail (dejar en blanco para no cambiar): ');
        Object.keys(nuevosDatos).forEach(key => {
            if (nuevosDatos[key]) contacto[key] = nuevosDatos[key];
        });
        console.log('Contacto editado!');
        await write(JSON.stringify(this.contactos, null, 2));
    }

    async borrarContacto(termino) {
        const resultados = this.buscarContacto(termino);
        if (resultados.length === 0) return;
        const contacto = resultados[0];
        const indice = this.contactos.indexOf(contacto);
        if (indice === -1) return;
        const confirmacion = await prompt(` \n¿Está seguro que desea borrar a ${contacto.nombre} ${contacto.apellido}? (s/n): `);
        if (confirmacion.toLowerCase() === 's') {
            this.contactos.splice(indice, 1);
            console.log('Contacto borrado!');
            await write(JSON.stringify(this.contactos, null, 2));
        } else {
            console.log('Operación cancelada.');
        }
    }
}

async function menu() {
    const agenda = new Agenda();
    await agenda.cargar();
    let salir = false;
    while (!salir) {
        console.log('\nMenú de la Agenda\n');
        console.log('1. Listar contacto');
        console.log('2. Agregar contacto');
        console.log('3. Editar contacto');
        console.log('4. Borrar contacto');
        console.log('5. Buscar contacto');
        console.log('0. Salir');
        const opcion = await prompt('\nSeleccione una opción: ');
        switch (opcion) {
            case '1':
                console.clear();
                agenda.listar();
                break;
            case '2':
                console.clear();
                console.log("Complete los datos para guardar un nuevo contacto!")
                const nombre = await prompt('Nombre: ');
                const apellido = await prompt('Apellido: ');
                const edad = await prompt('Edad: ');
                const telefono = await prompt('Teléfono: ');
                const mail = await prompt('Mail: ');
                const contacto = new Contacto(nombre, apellido, edad, telefono, mail);
                agenda.agregar(contacto);
                break;
            case '3':
                const terminoEditar = await prompt('Ingrese nombre o apellido del contacto a editar: ');
                await agenda.editarContacto(terminoEditar);
                break;
            case '4':
                const terminoBorrar = await prompt('Ingrese nombre o apellido del contacto a borrar: ');
                await agenda.borrarContacto(terminoBorrar);
                break;
            case '5':
                const terminoBuscar = await prompt('Ingrese nombre, apellido, teléfono o mail a buscar: ');
                agenda.buscarContacto(terminoBuscar);
                break;
            case '0':
                await agenda.guardar();
                salir = true;
                break;
            default:
                console.log('Opción inválida.');
        }
    }
    console.log('¡Hasta luego!');
}

menu();