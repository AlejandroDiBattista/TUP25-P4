import {prompt, read, write} from './io.js';

class Contacto {
    constructor(id, nombre, apellido, edad, telefono, email){
        this.id = id;
        this.nombre = nombre;
        this.apellido = apellido;
        this.edad = edad;
        this.telefono = telefono;
        this.email = email;
    }
    toString() {
        return `${this.id} - ${this.nombre} ${this.apellido} (${this.edad}) - ${this.telefono} - ${this.email}`;
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

    editar(id, datos) {
        let c = this.contactos.find(c => c.id == id);
        if (c) {
            Object.assign(c, datos);
            return true;
        }
        return false;
    }

    borrar(id) {
        let idx = this.contactos.findIndex(c => c.id == id);
        if (idx != -1) {
            this.contactos.splice(idx, 1);
            return true;
        }
        return false;
    }

    listar() {
        return this.contactos
            .sort((a, b) => {
                let ap = a.apellido.toLowerCase();
                let bp = b.apellido.toLowerCase();
                if (ap === bp) {
                    return a.nombre.toLowerCase().localeCompare(b.nombre.toLowerCase());
                }
                return ap.localeCompare(bp);
            })
            .map(c => c.toString())
            .join("\n");
    }

    buscar(texto) {
        let resultados = this.contactos.filter(c =>
            [c.nombre, c.apellido, c.telefono, c.email]
                .some(field => field.toLowerCase().includes(texto.toLowerCase()))
        );
        return resultados.map(c => c.toString()).join("\n");
    }

    static async cargar() {
        let agenda = new Agenda();
        try {
            let data = await read("agenda.json");
            if (data) {
                let obj = JSON.parse(data);
                agenda.ultimoId = obj.ultimoId;
                agenda.contactos = obj.contactos.map(c =>
                    new Contacto(c.id, c.nombre, c.apellido, c.edad, c.telefono, c.email)
                );
            }
        } catch (e) {
            // si no existe el archivo, empezamos vacío
        }
        return agenda;
    }

    async guardar() {
        let data = JSON.stringify({
            ultimoId: this.ultimoId,
            contactos: this.contactos
        }, null, 2);
        await write("agenda.json", data);
    }
}

// EJEMPLO DE USO
(async () => {
    let agenda = await Agenda.cargar();

    console.log("=== Ingresar nuevo contacto ===");

    let nombre = await prompt("Nombre :>");
    let apellido = await prompt("Apellido :>");
    let edad = await prompt("Edad   :>");
    let telefono = await prompt("Teléfono :>");
    let email = await prompt("Email :>");

    let c = new Contacto(null, nombre, apellido, edad, telefono, email);
    agenda.agregar(c);

    await agenda.guardar();

    console.log("\n=== Contactos en agenda ===");
    console.log(agenda.listar());
})();