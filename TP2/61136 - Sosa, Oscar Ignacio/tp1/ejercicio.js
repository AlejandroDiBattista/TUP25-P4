import {prompt, read, write} from './io.js';

class Contacto {
    constructor({id, nombre, apellido, edad, telefono, email} = {}) {
        this.id = id || null;
        this.nombre = nombre || "";
        this.apellido = apellido || "";
        this.edad = edad || "";
        this.telefono = telefono || "";
        this.email = email || "";
    }
}

class Agenda {
    constructor() {
        this.contactos = [];
        this.ultimoId = 0;
    }

    agregar(contacto) {
        contacto.id = ++this.ultimoId;
        this.contactos.push(contacto);
    }

    listar() {
        // Ordena por apellido y nombre
        return [...this.contactos].sort((a, b) => {
            if (a.apellido === b.apellido) {
                return a.nombre.localeCompare(b.nombre);
            }
            return a.apellido.localeCompare(b.apellido);
        });
    }

    static async cargar() {
        let datos = await read("agenda.json");
        let contactos = [];
        let ultimoId = 0;
        try {
            contactos = JSON.parse(datos).map(c => new Contacto(c));
            if (contactos.length > 0) {
                ultimoId = Math.max(...contactos.map(c => c.id));
            }
        } catch {
            contactos = [];
        }
        let agenda = new Agenda();
        agenda.contactos = contactos;
        agenda.ultimoId = ultimoId;
        return agenda;
    }

    async guardar() {
        await write(JSON.stringify(this.contactos, null, 2), "agenda.json");
    }
}

async function mainMenu() {
    let agenda = await Agenda.cargar();
    let salir = false;
    while (!salir) {
        console.log("\n=== AGENDA DE CONTACTOS ===");
        console.log("1. Listar");
        console.log("2. Agregar");
        console.log("0. Finalizar");
        let opcion = await prompt("Ingresar opción :> ");
        switch (opcion) {
            case "1":
                console.log("\n== Lista de contactos ==");
                let lista = agenda.listar();
                if (lista.length === 0) {
                    console.log("Sin contactos.");
                } else {
                    console.log("ID Nombre Completo       Edad        Teléfono        Email");
                    for (let c of lista) {
                        console.log(
                            `${String(c.id).padStart(2, "0")} ${c.apellido}, ${c.nombre}`.padEnd(22) +
                            `${String(c.edad).padEnd(12)}${String(c.telefono).padEnd(16)}${c.email}`
                        );
                    }
                }
                await prompt("\nPresione Enter para continuar...");
                break;
            case "2":
                console.log("\n== Agregando contacto ==");
                let c = new Contacto();
                c.nombre = await prompt("Nombre      :> ");
                c.apellido = await prompt("Apellido    :> ");
                c.edad = await prompt("Edad        :> ");
                c.telefono = await prompt("Teléfono    :> ");
                c.email = await prompt("Email       :> ");
                agenda.agregar(c);
                await agenda.guardar();
                console.log("Contacto guardado!");
                await prompt("\nPresione Enter para continuar...");
                break;
            case "0":
                salir = true;
                break;
            default:
                console.log("Opción inválida.");
        }
    }
}

mainMenu();