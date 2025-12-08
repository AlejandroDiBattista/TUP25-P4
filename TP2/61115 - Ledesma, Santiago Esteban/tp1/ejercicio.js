import {prompt, read, write} from './io.js';

class Contacto {
    constructor({id, nombre, apellido, edad, telefono, email} = {}) {
        this.id = id ?? null;
        this.nombre = nombre ?? "";
        this.apellido = apellido ?? "";
        this.edad = edad ?? "";
        this.telefono = telefono ?? "";
        this.email = email ?? "";
    }
    nombreCompleto() {
        return `${this.apellido}, ${this.nombre}`;
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
        this.ordenar();
    }

    editar(id, datos) {
        let c = this.contactos.find(x => x.id == id);
        if (c) Object.assign(c, datos);
    }

    borrar(id) {
        let idx = this.contactos.findIndex(x => x.id == id);
        if (idx >= 0) this.contactos.splice(idx, 1);
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
            if (a.apellido === b.apellido)
                return a.nombre.localeCompare(b.nombre);
            return a.apellido.localeCompare(b.apellido);
        });
    }

    ordenar() {
        this.contactos.sort((a, b) => {
            if (a.apellido === b.apellido)
                return a.nombre.localeCompare(b.nombre);
            return a.apellido.localeCompare(b.apellido);
        });
    }

    static async cargar() {
        let datos = await read();
        let arr = JSON.parse(datos || "[]");
        let agenda = new Agenda();
        for (let obj of arr) {
            agenda.contactos.push(new Contacto(obj));
            if (obj.id > agenda.ultimoId) agenda.ultimoId = obj.id;
        }
        agenda.ordenar();
        return agenda;
    }

    async guardar() {
        await write(JSON.stringify(this.contactos, null, 2));
    }
}

async function mostrarMenu() {
    console.log("\n=== AGENDA DE CONTACTOS ===");
    console.log("1. Listar");
    console.log("2. Agregar");
    console.log("3. Editar");
    console.log("4. Borrar");
    console.log("5. Buscar");
    console.log("0. Finalizar");
    return await prompt("\nIngresar opción :> ");
}

function mostrarContactos(contactos) {
    console.log("\nID Nombre Completo       Edad        Teléfono        Email");
    for (let c of contactos) {
        console.log(
            `${String(c.id).padStart(2, "0")} ${c.nombreCompleto().padEnd(20)} ${String(c.edad).padEnd(10)} ${c.telefono.padEnd(15)} ${c.email}`
        );
    }
}

async function agregarContacto(agenda) {
    console.log("\n== Agregando contacto ==");
    let nombre = await prompt("Nombre      :> ");
    let apellido = await prompt("Apellido    :> ");
    let edad = await prompt("Edad        :> ");
    let telefono = await prompt("Teléfono    :> ");
    let email = await prompt("Email       :> ");
    let c = new Contacto({nombre, apellido, edad, telefono, email});
    agenda.agregar(c);
    await agenda.guardar();
    await prompt("\nPresione Enter para continuar...");
}

async function editarContacto(agenda) {
    let id = await prompt("\nID contacto :> ");
    let c = agenda.contactos.find(x => x.id == id);
    if (!c) {
        console.log("No existe ese contacto.");
        return await prompt("\nPresione Enter para continuar...");
    }
    console.log("\n== Editando contacto ==");
    let nombre = await prompt(`Nombre (${c.nombre})      :> `) || c.nombre;
    let apellido = await prompt(`Apellido (${c.apellido})  :> `) || c.apellido;
    let edad = await prompt(`Edad (${c.edad})            :> `) || c.edad;
    let telefono = await prompt(`Teléfono (${c.telefono})  :> `) || c.telefono;
    let email = await prompt(`Email (${c.email})         :> `) || c.email;
    agenda.editar(id, {nombre, apellido, edad, telefono, email});
    await agenda.guardar();
    await prompt("\nPresione Enter para continuar...");
}

async function borrarContacto(agenda) {
    let id = await prompt("\nID contacto :> ");
    let c = agenda.contactos.find(x => x.id == id);
    if (!c) {
        console.log("No existe ese contacto.");
        return await prompt("\nPresione Enter para continuar...");
    }
    console.log("\nBorrando...");
    mostrarContactos([c]);
    let conf = await prompt("\n¿Confirma borrado? :> S/N ");
    if (conf.toLowerCase() === "s") {
        agenda.borrar(id);
        await agenda.guardar();
        console.log("Contacto borrado.");
    }
    await prompt("\nPresione Enter para continuar...");
}

async function buscarContacto(agenda) {
    console.log("\n== Buscar contacto ==");
    let texto = await prompt("Buscar      :> ");
    let encontrados = agenda.buscar(texto);
    mostrarContactos(encontrados);
    await prompt("\nPresione Enter para continuar...");
}

async function listarContactos(agenda) {
    console.log("\n== Lista de contactos ==");
    mostrarContactos(agenda.listar());
    await prompt("\nPresione Enter para continuar...");
}

async function main() {
    let agenda = await Agenda.cargar();
    let salir = false;
    while (!salir) {
        let op = await mostrarMenu();
        switch (op) {
            case "1": await listarContactos(agenda); break;
            case "2": await agregarContacto(agenda); break;
            case "3": await editarContacto(agenda); break;
            case "4": await borrarContacto(agenda); break;
            case "5": await buscarContacto(agenda); break;
            case "0": salir = true; break;
            default: console.log("Opción inválida.");
        }
    }
    console.log("¡Hasta luego!");
}

main();