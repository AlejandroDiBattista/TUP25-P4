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
        let c = this.contactos.find(x => x.id === id);
        if (c) Object.assign(c, datos);
    }

    borrar(id) {
        let idx = this.contactos.findIndex(x => x.id === id);
        if (idx >= 0) this.contactos.splice(idx, 1);
    }

    buscar(texto) {
        texto = texto.toLowerCase();
        return this.contactos.filter(c =>
            c.nombre.toLowerCase().includes(texto) ||
            c.apellido.toLowerCase().includes(texto) ||
            c.email.toLowerCase().includes(texto)
        );
    }

    listar() {
        return this.contactos;
    }

    ordenar() {
        this.contactos.sort((a, b) => {
            if (a.apellido !== b.apellido)
                return a.apellido.localeCompare(b.apellido);
            return a.nombre.localeCompare(b.nombre);
        });
    }

    static async cargar() {
        let datos = await read('agenda.json');
        let obj = new Agenda();
        if (datos && datos.length) {
            let arr = JSON.parse(datos);
            obj.contactos = arr.map(c => new Contacto(c.id, c.nombre, c.apellido, c.edad, c.telefono, c.email));
            obj.ultimoId = Math.max(0, ...obj.contactos.map(c => c.id));
        }
        return obj;
    }

    async guardar() {
        await write('agenda.json', JSON.stringify(this.contactos, null, 2));
    }
}

// Menú principal
async function main() {
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
        switch(opcion) {
            case "1":
                console.log("\n== Lista de contactos ==");
                let lista = agenda.listar();
                for (let c of lista)
                    console.log(`${c.id.toString().padStart(2, '0')} ${c.nombreCompleto().padEnd(20)} ${c.edad.toString().padEnd(10)} ${c.telefono.padEnd(15)} ${c.email}`);
                await prompt("\nPresione Enter para continuar...");
                break;
            case "2":
                console.log("\n== Agregando contacto ==");
                let nombre = await prompt("Nombre      :> ");
                let apellido = await prompt("Apellido    :> ");
                let edad = await prompt("Edad        :> ");
                let telefono = await prompt("Teléfono    :> ");
                let email = await prompt("Email       :> ");
                agenda.agregar(new Contacto(null, nombre, apellido, edad, telefono, email));
                await agenda.guardar();
                await prompt("\nPresione Enter para continuar...");
                break;
            // Aquí puedes implementar editar, borrar, buscar...
        }
        } while(opcion !== "0");
    }