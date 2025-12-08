
await agenda.guardar(); 

import { prompt, read, write } from './io.js';

class Contacto {
    constructor({ id, nombre, apellido, edad, telefono, email }) {
        this.id = id ?? 0;
        this.nombre = nombre?.trim() || "Sin nombre";
        this.apellido = apellido?.trim() || "Sin apellido";
        this.edad = edad?.trim() || "N/D";
        this.telefono = telefono?.trim() || "N/D";
        this.email = email?.trim() || "N/D";
    }

    nombreCompleto() {
        return `${this.apellido}, ${this.nombre}`;
    }
}

class Agenda {
    constructor(contactos = [], ultimoId = 0) {
        this.contactos = contactos;
        this.ultimoId = ultimoId;
    }

    agregar(contacto) {
        contacto.id = ++this.ultimoId;
        this.contactos.push(contacto);
        this.ordenar();
    }

    editar(id, datos) {
        const c = this.contactos.find(c => c.id === id);
        if (!c) return false;
        Object.assign(c, datos);
        this.ordenar();
        return true;
    }

    borrar(id) {
        const index = this.contactos.findIndex(c => c.id === id);
        if (index === -1) return null;
        return this.contactos.splice(index, 1)[0];
    }

    buscar(texto) {
        texto = texto.toLowerCase();
        return this.contactos.filter(c =>
            c.nombre.toLowerCase().includes(texto) ||
            c.apellido.toLowerCase().includes(texto) ||
            c.telefono.toLowerCase().includes(texto) ||
            c.email.toLowerCase().includes(texto)
        );
    }

    ordenar() {
        this.contactos.sort((a, b) => {
            const ap = a.apellido.localeCompare(b.apellido);
            return ap !== 0 ? ap : a.nombre.localeCompare(b.nombre);
        });
    }

    listar() {
        return [...this.contactos];
    }

    static async cargar() {
        try {
            const contenido = await read();
            const array = JSON.parse(contenido || "[]");
            const contactos = array.map(obj => new Contacto(obj));
            const ultimoId = contactos.reduce((max, c) => Math.max(max, c.id), 0);
            return new Agenda(contactos, ultimoId);
        } catch {
            return new Agenda();
        }
    }

    async guardar() {
        await write(JSON.stringify(this.contactos, null, 2));
    }
}

async function pausa() {
    await prompt("\nPresione Enter para continuar...");
}

function mostrarContactos(contactos) {
    if (contactos.length === 0) {
        console.log("No hay contactos para mostrar.");
        return;
    }

    console.log("\nID\tNombre Completo\t\tEdad\tTeléfono\tEmail");
    console.log("--------------------------------------------------------------");
    for (let c of contactos) {
        console.log(
            `${String(c.id).padStart(2, '0')}\t${c.nombreCompleto().padEnd(20)}\t${c.edad}\t${c.telefono}\t${c.email}`
        );
    }
}

async function main() {
    let agenda = await Agenda.cargar();
    let salir = false;

    while (!salir) {
        console.clear();
        console.log("=== AGENDA DE CONTACTOS ===");
        console.log("1. Listar contactos");
        console.log("2. Agregar contacto");
        console.log("3. Editar contacto");
        console.log("4. Borrar contacto");
        console.log("5. Buscar contacto");
        console.log("0. Salir\n");

        const opcion = await prompt("Elija una opción: ");

        switch (opcion) {
            case '1':
                console.clear();
                console.log("== LISTA DE CONTACTOS ==");
                mostrarContactos(agenda.listar());
                await pausa();
                break;

            case '2':
                console.clear();
                console.log("== AGREGAR NUEVO CONTACTO ==");
                const nuevo = new Contacto({
                    nombre: await prompt("Nombre: "),
                    apellido: await prompt("Apellido: "),
                    edad: await prompt("Edad: "),
                    telefono: await prompt("Teléfono: "),
                    email: await prompt("Email: ")
                });
                agenda.agregar(nuevo);
                await agenda.guardar();
                console.log("Contacto agregado correctamente.");
                await pausa();
                break;

            case '3':
                console.clear();
                console.log("== EDITAR CONTACTO ==");
                const idEdit = parseInt(await prompt("ID del contacto: "));
                const cEdit = agenda.contactos.find(c => c.id === idEdit);
                if (!cEdit) {
                    console.log("No existe ese contacto.");
                    await pausa();
                    break;
                }

                const datosEdit = {
                    nombre: await prompt(`Nombre (${cEdit.nombre}): `) || cEdit.nombre,
                    apellido: await prompt(`Apellido (${cEdit.apellido}): `) || cEdit.apellido,
                    edad: await prompt(`Edad (${cEdit.edad}): `) || cEdit.edad,
                    telefono: await prompt(`Teléfono (${cEdit.telefono}): `) || cEdit.telefono,
                    email: await prompt(`Email (${cEdit.email}): `) || cEdit.email
                };

                agenda.editar(idEdit, datosEdit);
                await agenda.guardar();
                console.log("Contacto actualizado.");
                await pausa();
                break;

            case '4':
                console.clear();
                console.log("== BORRAR CONTACTO ==");
                const idBorrar = parseInt(await prompt("ID del contacto: "));
                const cBorrar = agenda.contactos.find(c => c.id === idBorrar);
                if (!cBorrar) {
                    console.log("No existe ese contacto.");
                    await pausa();
                    break;
                }

                mostrarContactos([cBorrar]);
                const confirmar = await prompt("¿Confirma borrado? (S/N): ");
                if (confirmar.toLowerCase() === 's') {
                    agenda.borrar(idBorrar);
                    await agenda.guardar();
                    console.log("Contacto borrado.");
                } else {
                    console.log("Operación cancelada.");
                }
                await pausa();
                break;

            case '5':
                console.clear();
                console.log("== BUSCAR CONTACTO ==");
                const texto = await prompt("Texto a buscar: ");
                const encontrados = agenda.buscar(texto);
                mostrarContactos(encontrados);
                await pausa();
                break;

            case '0':
                salir = true;
                break;

            default:
                console.log("Opción no válida.");
                await pausa();
        }
    }

    console.log("Saliendo de la agenda... ¡Hasta luego!");
}

main();
