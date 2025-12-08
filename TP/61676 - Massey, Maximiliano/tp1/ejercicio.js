
import { log } from 'node:console';
import {prompt, read, write} from './io.js';


class Contacto {
    constructor(id, nombre, apellido, edad, telefono, email) {
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
        this.proximoId = 1;
    }

    async cargarDesdeArchivo() {
        try {
            this.contactos = await read('./agenda.json');
            if (this.contactos.length > 0) {
                this.proximoId = Math.max(...this.contactos.map(c => c.id)) + 1;
            }
        } catch (e) {
            this.contactos = [];
            this.proximoId = 1;
        }
    }

    async guardarEnArchivo() {
        await write(this.contactos, './agenda.json');
    }

    async agregarcontacto() {
        console.log("\n==Agregar contacto==");
        const nombre = await prompt("Nombre: ");
        const apellido = await prompt("Apellido: ");
        const edad = parseInt(await prompt("Edad: "), 10);
        const telefono = await prompt("Teléfono: ");
        const email = await prompt("Email: ");
        const nuevoContacto = new Contacto(this.proximoId++, nombre, apellido, edad, telefono, email);
        this.contactos.push(nuevoContacto);

        await this.guardarEnArchivo();
        console.log("Contacto agregado exitosamente.\n");
    }

    async editarcontacto() {
        if (this.contactos.length === 0) {
            console.log("No hay contactos para editar.");
            console.log("Precione la tecla enter para volver...")
            await prompt();
            return;
        }
        const id = parseInt(await prompt("Ingrese el ID del contacto a editar: "), 10);
        const contacto = this.contactos.find(c => c.id === id);
        if (!contacto) {
            console.log("Contacto no encontrado.");
            return;
        }
        console.log(`\n==Editar contacto ID: ${contacto.id}==`);
        const nombre = await prompt(`Nombre (${contacto.nombre}): `) || contacto.nombre;
        const apellido = await prompt(`Apellido (${contacto.apellido}): `) || contacto.apellido;
        const edadInput = await prompt(`Edad (${contacto.edad}): `);
        const edad = edadInput ? parseInt(edadInput, 10) : contacto.edad;
        const telefono = await prompt(`Teléfono (${contacto.telefono}): `) || contacto.telefono;
        const email = await prompt(`Email (${contacto.email}): `) || contacto.email;
        contacto.nombre = nombre;
        contacto.apellido = apellido;
        contacto.edad = edad;
        contacto.telefono = telefono;
        contacto.email = email;
        await this.guardarEnArchivo();
        console.log("Contacto editado exitosamente.");
        console.log("=========================================")
        console.log("Precione la tecla enter para continuar...")
        await prompt();

    }
    async eliminarcontacto() {
        if (this.contactos.length === 0) {
            console.log("No hay contactos para eliminar.");
            console.log("=========================================")
            console.log("Precione la tecla enter para continuar...")
        await prompt();
            return;
        }
        const id = parseInt(await prompt("Ingrese el ID del contacto a eliminar: "), 10);
        const index = this.contactos.findIndex(c => c.id === id);
        if (index === -1) {
            console.log("Contacto no encontrado.");
            return;
        } 
        const confirmado = (await prompt(`¿Está seguro que desea eliminar el contacto ${this.contactos[index].nombre} ${this.contactos[index].apellido}? (s/n): `)).toLowerCase();
        if (confirmado === 's') {
            this.contactos.splice(index, 1);
            await this.guardarEnArchivo();
            console.log("Contacto eliminado exitosamente.");
        } else {
            console.log("Operación cancelada.");
        }
        console.log("Precione la tecla enter para continuar...")
        await prompt();
    }
    async listarcontactos() {
        if (this.contactos.length === 0) {
            console.log("No hay contactos en la agenda.");
        } else {
            console.log("\n==Lista de contactos==");
            console.log("ID | Nombre | Apellido | Edad | Teléfono | Email");
            console.log("--------------------------------------------------");
            this.contactos.forEach(c => {
                console.log(`ID: ${c.id}, Nombre: ${c.nombre}, apellido: ${c.apellido}, Edad: ${c.edad}, Teléfono: ${c.telefono}, Email: ${c.email}`);
            });
        }
        console.log("=========================================")
        console.log("Precione la tecla enter para continuar...")
        await prompt();
    }
    async buscarcontacto() {
        if (this.contactos.length === 0) {
            console.log("No hay contactos para buscar.");
            return;
        }
        const termino = await prompt("Ingrese el nombre o apellido a buscar: ")//.toLowerCase();
        const resultados = this.contactos.filter(c => c.nombre.toLowerCase().includes(termino) || c.apellido.toLowerCase().includes(termino));
        if (resultados.length === 0) {
            console.log("No se encontraron contactos que coincidan con la búsqueda.");
        } else {
            console.log("\n==Resultados de la búsqueda==");
            console.log("ID | Nombre | Apellido | Edad | Teléfono | Email");
            console.log("--------------------------------------------------");
            resultados.forEach(c => {
                console.log(`ID: ${c.id}, Nombre: ${c.nombre}, apellido: ${c.apellido}, Edad: ${c.edad}, Teléfono: ${c.telefono}, Email: ${c.email}`);
            });
        }
        console.log("=========================================")
        console.log("Precione la tecla enter para continuar...")
        await prompt();
    }
}

async function mostrarMenu(agenda) {
    console.log(`
    =====AGENDA DE CONTACTOS=====
    1. Agregar contacto
    2. Editar contacto
    3. Eliminar contacto
    4. Listar contactos
    5. Buscar contacto
    0. Salir
    `);
    const opcion = await prompt("Seleccione una opción: ");
    switch (opcion) {
        case '1':
            await agenda.agregarcontacto();
            break;
        case '2':
            await agenda.editarcontacto();
            break;
        case '3':
            await agenda.eliminarcontacto();
            break;
        case '4':
            await agenda.listarcontactos();
            break;
        case '5':
            await agenda.buscarcontacto();
            break;
        case '0':
            console.log("Saliendo...");
            return false;
        default:
            console.log("Opción inválida. Intente de nuevo.");
    }
    return true;
}

async function main() {
    const agenda = new Agenda();
    await agenda.cargarDesdeArchivo();
    let continuar = true;
    while (continuar) {
        continuar = await mostrarMenu(agenda);
    }
    await agenda.guardarEnArchivo();
    console.log("Agenda guardada. Hasta luego!");
}
main();