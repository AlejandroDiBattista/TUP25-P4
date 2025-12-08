import {prompt, read, write} from './io.js';

class Contacto {
    constructor({id, nombre, apellido, edad, telefono, email}) {
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
        this.ordenar();
    }

    borrar(id) {
        this.contactos = this.contactos.filter(x => x.id !== id);
    }

    buscar(texto) {
        texto = texto.toLowerCase();
        return this.contactos.filter(c =>
            c.nombre.toLowerCase().includes(texto) ||
            c.apellido.toLowerCase().includes(texto) ||
            c.telefono?.toLowerCase().includes(texto) ||
            c.email?.toLowerCase().includes(texto)
        );
    }

    listar() {
        return this.contactos;
    }

    ordenar() {
        this.contactos.sort((a, b) => {
            if (a.apellido === b.apellido) {
                return a.nombre.localeCompare(b.nombre);
            }
            return a.apellido.localeCompare(b.apellido);
        });
    }

    static async cargar() {
        try {
            let data = await read('agenda.json');
            let obj = JSON.parse(data);
            let agenda = new Agenda();
            agenda.contactos = obj.contactos.map(c => new Contacto(c));
            agenda.ultimoId = obj.ultimoId || (agenda.contactos.length ? Math.max(...agenda.contactos.map(c => c.id)) : 0);
            agenda.ordenar();
            return agenda;
        } catch {
            return new Agenda();
        }
    }

    async guardar() {
        let data = JSON.stringify({
            contactos: this.contactos,
            ultimoId: this.ultimoId
        }, null, 2);
        await write('agenda.json', data);
    }
}

async function menu() {
    let agenda = await Agenda.cargar();
    while (true) {
        console.log("\n=== AGENDA DE CONTACTOS ===");
        console.log("1. Listar");
        console.log("2. Agregar");
        console.log("3. Editar");
        console.log("4. Borrar");
        console.log("5. Buscar");
        console.log("0. Finalizar");
        let op = await prompt("\nIngresar opción :> ");
        if (op === '0') break;
        if (op === '1') {
            let lista = agenda.listar();
            if (!lista.length) console.log("(Sin contactos)");
            else {
                console.log("\n== Lista de contactos ==");
                console.log("ID Nombre Completo       Edad        Teléfono        Email");
                lista.forEach(c => {
                    const id = String(c.id).padEnd(2);
                    const nombreCompleto = `${c.apellido}, ${c.nombre}`.padEnd(20);
                    const edad = String(c.edad).padEnd(10);
                    const telefono = String(c.telefono).padEnd(15);
                    const email = String(c.email).padEnd(25);
                    console.log(`${id} ${nombreCompleto} ${edad} ${telefono} ${email}`);
                });
            }
        }
        if (op === '2') {
            let nombre = await prompt("Nombre :> ");
            let apellido = await prompt("Apellido :> ");
            let edad = await prompt("Edad :> ");
            let telefono = await prompt("Teléfono :> ");
            let email = await prompt("Email :> ");
            let c = new Contacto({id: null, nombre, apellido, edad, telefono, email});
            agenda.agregar(c);
            await agenda.guardar();
            console.log("Contacto agregado.");
        }
        if (op === '3') {
            console.log("\n== Lista de contactos ==");
            console.log("ID Nombre Completo       Edad        Teléfono        Email");
            agenda.listar().forEach(c => {
                const id = String(c.id).padEnd(2);
                const nombreCompleto = `${c.apellido}, ${c.nombre}`.padEnd(20);
                const edad = String(c.edad).padEnd(10);
                const telefono = String(c.telefono).padEnd(15);
                const email = String(c.email).padEnd(25);
                console.log(`${id} ${nombreCompleto} ${edad} ${telefono} ${email}`);
            });
            let id = parseInt(await prompt("\nID a editar :> "));
            let c = agenda.contactos.find(x => x.id === id);
            if (!c) { console.log("No existe ese ID."); continue; }
            let nombre = await prompt(`Nombre (${c.nombre}) :> `) || c.nombre;
            let apellido = await prompt(`Apellido (${c.apellido}) :> `) || c.apellido;
            let edad = await prompt(`Edad (${c.edad}) :> `) || c.edad;
            let telefono = await prompt(`Teléfono (${c.telefono}) :> `) || c.telefono;
            let email = await prompt(`Email (${c.email}) :> `) || c.email;
            agenda.editar(id, {nombre, apellido, edad, telefono, email});
            await agenda.guardar();
            console.log("Contacto editado.");
        }
        if (op === '4') {
            let id = parseInt(await prompt("ID a borrar :> "));
            let c = agenda.contactos.find(x => x.id === id);
            if (!c) { console.log("No existe ese ID."); continue; }
            agenda.borrar(id);
            await agenda.guardar();
            console.log("Contacto borrado.");
        }
        if (op === '5') {
            let texto = await prompt("Buscar :> ");
            let res = agenda.buscar(texto);
            if (!res.length) console.log("No se encontraron contactos.");
            else res.forEach(c => {
                console.log(`${c.id}. ${c.apellido}, ${c.nombre} - Edad: ${c.edad} - Tel: ${c.telefono} - Email: ${c.email}`);
            });
        }
    }
    await agenda.guardar();
    console.log("Agenda guardada.");
}

menu();