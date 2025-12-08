import {prompt, read, write} from './io.js';

class Contacto {
    constructor(id = null, nombre = "", apellido = "", edad = "", telefono = "", email = "") {
        this.id = id;
        this.nombre = nombre;
        this.apellido = apellido;
        this.edad = edad;
        this.telefono = telefono;
        this.email = email;
    }

    getNombreCompleto() {
        return `${this.apellido}, ${this.nombre}`;
    }
}

class Agenda {
    constructor() {
        this.contactos = [];
        this.ultimoId = 0;
    }

    static async cargar() {
        try {
            let data = await read("agenda.json");
            if (data) {
                let json = JSON.parse(data);
                let agenda = new Agenda();
                agenda.contactos = Array.isArray(json.contactos)
                    ? json.contactos.map(c => new Contacto(c.id, c.nombre, c.apellido, c.edad, c.telefono, c.email))
                    : [];
                agenda.ultimoId = json.ultimoId ?? (agenda.contactos.length ? Math.max(...agenda.contactos.map(c => c.id)) : 0);
                return agenda;
            }
        } catch (e) {
        }
        return new Agenda();
    }

    async guardar() {
        await write("agenda.json", JSON.stringify({
            contactos: this.contactos,
            ultimoId: this.ultimoId
        }, null, 2));
    }

    async agregar(contacto) {
        contacto.id = ++this.ultimoId;
        this.contactos.push(contacto);
        await this.guardar();
    }

    editar(id, datos) {
        let c = this.contactos.find(x => x.id == id);
        if (!c) return false;
        c.nombre = datos.nombre ?? c.nombre;
        c.apellido = datos.apellido ?? c.apellido;
        c.edad = datos.edad ?? c.edad;
        c.telefono = datos.telefono ?? c.telefono;
        c.email = datos.email ?? c.email;
        return true;
    }

    borrar(id) {
        let i = this.contactos.findIndex(x => x.id == id);
        if (i >= 0) {
            return this.contactos.splice(i, 1)[0];
        }
        return null;
    }

    listar() {
        return [...this.contactos].sort((a, b) => {
            if (a.apellido === b.apellido) return a.nombre.localeCompare(b.nombre);
            return a.apellido.localeCompare(b.apellido);
        });
    }

    buscar(termino) {
        termino = termino.toLowerCase();
        return this.contactos.filter(c =>
            c.nombre.toLowerCase().includes(termino) ||
            c.apellido.toLowerCase().includes(termino) ||
            c.email.toLowerCase().includes(termino) ||
            c.telefono.includes(termino)
        );
    }
}

// ================== MENÚ PRINCIPAL ==================

async function menu() {
    let agenda = await Agenda.cargar();
    let opcion;
    do {
        console.log("\n=== AGENDA DE CONTACTOS ===");
        console.log("1. Listar");
        console.log("2. Agregar");
        console.log("3. Editar");
        console.log("4. Borrar");
        console.log("5. Buscar");
        console.log("0. Finalizar");

        opcion = await prompt("Ingresar opción :> ");

        switch (opcion) {
            case "1":
                console.log("\n== Lista de contactos ==");
                console.log("ID Nombre Completo       Edad   Teléfono        Email");
                agenda.listar().forEach(c => {
                    console.log(
                        String(c.id).padStart(2, "0"),
                        c.getNombreCompleto().padEnd(20),
                        String(c.edad).padEnd(6),
                        String(c.telefono).padEnd(14),
                        c.email
                    );
                });
                break;

            case "2":
                console.log("\n== Agregando contacto ==");
                let c = new Contacto();
                c.nombre   = await prompt("Nombre   :> ");
                c.apellido = await prompt("Apellido :> ");
                c.edad     = parseInt(await prompt("Edad     :> "));
                c.telefono = await prompt("Teléfono :> ");
                c.email    = await prompt("Email    :> ");
                await agenda.agregar(c);
                break;

            case "3":
                console.log("\n== Editar contacto ==");
                let idE = parseInt(await prompt("ID contacto :> "));
                let datos = {};
                let nombre = await prompt("Nombre (enter = no cambiar):> ");
                if (nombre) datos.nombre = nombre;
                let apellido = await prompt("Apellido (enter = no cambiar):> ");
                if (apellido) datos.apellido = apellido;
                let edad = await prompt("Edad (enter = no cambiar):> ");
                if (edad) datos.edad = parseInt(edad);
                let telefono = await prompt("Teléfono (enter = no cambiar):> ");
                if (telefono) datos.telefono = telefono;
                let email = await prompt("Email (enter = no cambiar):> ");
                if (email) datos.email = email;
                if (agenda.editar(idE, datos)) {
                    await agenda.guardar();
                    console.log("Contacto actualizado.");
                } else {
                    console.log("No se encontró el contacto.");
                }
                break;

            case "4":
                console.log("\n== Borrar contacto ==");
                let idB = parseInt(await prompt("ID contacto :> "));
                let contacto = agenda.contactos.find(c => c.id === idB);
                if (!contacto) {
                    console.log("No se encontró el contacto.");
                } else {
                    console.log("Borrando...");
                    console.log(
                        String(contacto.id).padStart(2, "0"),
                        contacto.getNombreCompleto().padEnd(20),
                        String(contacto.edad).padEnd(6),
                        String(contacto.telefono).padEnd(14),
                        contacto.email
                    );
                    let conf = await prompt("¿Confirma borrado? :> S/N ");
                    if (conf.toLowerCase() === "s") {
                        agenda.borrar(idB);
                        await agenda.guardar();
                        console.log("Contacto borrado.");
                    }
                }
                break;

            case "5":
                console.log("\n== Buscar contacto ==");
                let termino = await prompt("Buscar :> ");
                let resultados = agenda.buscar(termino);
                console.log("\nID Nombre Completo       Edad   Teléfono        Email");
                resultados.forEach(c => {
                    console.log(
                        String(c.id).padStart(2, "0"),
                        c.getNombreCompleto().padEnd(20),
                        String(c.edad).padEnd(6),
                        String(c.telefono).padEnd(14),
                        c.email
                    );
                });
                break;
        }
    } while (opcion !== "0");
}

menu();
