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

    getNombreCompleto() {
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
    }

    editar(id, nuevosDatos) {
        let c = this.contactos.find(x => x.id === id);
        if (c) Object.assign(c, nuevosDatos);
    }

    borrar(id) {
        const index = this.contactos.findIndex(c => c.id === id);
        if (index !== -1) {
            return this.contactos.splice(index, 1)[0];
        }
        return null;
    }

    listar() {
        return [...this.contactos].sort((a, b) => {
            if (a.apellido === b.apellido) return a.nombre.localeCompare(b.nombre);
            return a.apellido.localeCompare(b.apellido);
        });
    }

    buscar(texto) {
        texto = texto.toLowerCase();
        return this.contactos.filter(c =>
            c.nombre.toLowerCase().includes(texto) ||
            c.apellido.toLowerCase().includes(texto) ||
            c.telefono.includes(texto) ||
            c.email.toLowerCase().includes(texto)
        );
    }

    async guardar() {
        const data = {
            contactos: this.contactos,
            ultimoId: this.ultimoId
        };
        await write(JSON.stringify(data, null, 2), "agenda.json");
    }

    static async cargar() {
        try {
            const data = await read("agenda.json");
            const obj = JSON.parse(data);
            const contactos = obj.contactos.map(
                c => new Contacto(c.id, c.nombre, c.apellido, c.edad, c.telefono, c.email)
            );
            return new Agenda(contactos, obj.ultimoId);
        } catch (e) {
            return new Agenda();
        }
    }
}

 

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

        switch (opcion) {
            case "1":
                listar(agenda);
                break;
            case "2":
                await agregar(agenda);
                break;
            case "3":
                await editar(agenda);
                break;
            case "4":
                await borrar(agenda);
                break;
            case "5":
                await buscar(agenda);
                break;
        }

    } while (opcion !== "0");

    await agenda.guardar();
}

function listar(agenda) {
    console.log("\n== Lista de contactos ==");
    console.log("ID Nombre Completo        Edad   Teléfono     Email");
    for (let c of agenda.listar()) {
        console.log(
            `${c.id.toString().padStart(2, "0")} ${c.getNombreCompleto().padEnd(20)} ${c.edad}   ${c.telefono}   ${c.email}`
        );
    }
}

async function agregar(agenda) {
    console.log("\n== Agregando contacto ==");
    const nombre = await prompt("Nombre      :> ");
    const apellido = await prompt("Apellido    :> ");
    const edad = await prompt("Edad        :> ");
    const telefono = await prompt("Telefono    :> ");
    const email = await prompt("Email       :> ");

    const contacto = new Contacto(null, nombre, apellido, edad, telefono, email);
    agenda.agregar(contacto);
    await agenda.guardar();
}

async function editar(agenda) {
    console.log("\n== Editar contacto ==");
    const id = parseInt(await prompt("ID contacto :> "));
    const contacto = agenda.contactos.find(c => c.id === id);

    if (!contacto) {
        console.log("No encontrado");
        return;
    }

    const nombre = await prompt(`Nombre (${contacto.nombre}): `) || contacto.nombre;
    const apellido = await prompt(`Apellido (${contacto.apellido}): `) || contacto.apellido;
    const edad = await prompt(`Edad (${contacto.edad}): `) || contacto.edad;
    const telefono = await prompt(`Telefono (${contacto.telefono}): `) || contacto.telefono;
    const email = await prompt(`Email (${contacto.email}): `) || contacto.email;

    agenda.editar(id, { nombre, apellido, edad, telefono, email });
    await agenda.guardar();
}

async function borrar(agenda) {
    console.log("\n== Borrar contacto ==");
    console.log("ID Nombre Completo        Teléfono     Email");
    for (let c of agenda.listar()) {
        console.log(`${c.id.toString().padStart(2,"0")} ${c.getNombreCompleto().padEnd(20)} ${c.telefono} ${c.email}`);
    }

    const id = parseInt(await prompt("ID del contacto a borrar :> "));
    const contacto = agenda.contactos.find(c => c.id === id);

    if (!contacto) {
        console.log("No encontrado.");
        return;
    }

    
    const confirmar = await prompt(`¿Está seguro de que quiere borrar a ${contacto.getNombreCompleto()}? (S/N): `);
    if (confirmar.toUpperCase() === "S") {
        agenda.borrar(id);      
        await agenda.guardar(); 
        console.log(`Contacto ${contacto.getNombreCompleto()} eliminado.`);
    } else {
        console.log("Operación cancelada, no se borró nada.");
    }
}

async function buscar(agenda) {
    console.log("\n== Buscar contacto ==");
    const texto = await prompt("Buscar :> ");
    const resultados = agenda.buscar(texto);
    for (let c of resultados) {
        console.log(`${c.id} ${c.getNombreCompleto()} (${c.telefono})`);
    }
}
main();