const { prompt, read, write } = require('./io.js');

class Contacto {
    constructor({id, nombre, apellido, edad, telefono, email} = {}) {
        this.id = id;
        this.nombre = nombre || "";
        this.apellido = apellido || "";
        this.edad = edad || "";
        this.telefono = telefono || "";
        this.email = email || "";
    }
    get nombreCompleto() {
        return `${this.apellido}, ${this.nombre}`;
    }
}

class Agenda {
    constructor() {
        this.contactos = [];
        this.nextId = 1;
    }
    agregar(contacto) {
        contacto.id = this.nextId++;
        this.contactos.push(contacto);
        this.ordenar();
    }
    editar(id, datos) {
        let c = this.contactos.find(x => x.id === id);
        if (c) Object.assign(c, datos);
        this.ordenar();
    }
    borrar(id) {
        let idx = this.contactos.findIndex(x => x.id === id);
        if (idx >= 0) {
            return this.contactos.splice(idx, 1)[0];
        }
        return null;
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
            if (a.apellido === b.apellido) {
                return a.nombre.localeCompare(b.nombre);
            }
            return a.apellido.localeCompare(b.apellido);
        });
    }
    static async cargar() {
        let agenda = new Agenda();
        try {
            let data = await read();
            let arr = JSON.parse(data);
            agenda.contactos = arr.map(obj => new Contacto(obj));
            agenda.nextId = agenda.contactos.reduce((max, c) => Math.max(max, c.id), 0) + 1;
            agenda.ordenar();
        } catch {
            // archivo vacío o corrupto
        }
        return agenda;
    }
    async guardar() {
        await write(JSON.stringify(this.contactos, null, 2));
    }
    listar(contactos = null) {
        contactos = contactos || this.contactos;
        console.log("ID Nombre Completo       Edad        Teléfono        Email");
        for (let c of contactos) {
            console.log(
                String(c.id).padStart(2, '0'),
                c.nombreCompleto.padEnd(20),
                String(c.edad).padEnd(10),
                c.telefono.padEnd(15),
                c.email
            );
        }
    }
}

async function main() {
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
        if (op === "0") break;
        switch (op) {
            case "1":
                console.log("\n== Lista de contactos ==");
                agenda.listar();
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
                await prompt("\nPresione Enter para continuar...");
                break;
            case "3":
                console.log("\n== Editar contacto ==");
                agenda.listar();
                let idEdit = parseInt(await prompt("\nID contacto :> "));
                let contactoEdit = agenda.contactos.find(x => x.id === idEdit);
                if (!contactoEdit) {
                    console.log("No existe ese ID");
                    break;
                }
                let nuevoNombre = await prompt(`Nombre [${contactoEdit.nombre}] :> `);
                let nuevoApellido = await prompt(`Apellido [${contactoEdit.apellido}] :> `);
                let nuevaEdad = await prompt(`Edad [${contactoEdit.edad}] :> `);
                let nuevoTelefono = await prompt(`Teléfono [${contactoEdit.telefono}] :> `);
                let nuevoEmail = await prompt(`Email [${contactoEdit.email}] :> `);
                agenda.editar(idEdit, {
                    nombre: nuevoNombre || contactoEdit.nombre,
                    apellido: nuevoApellido || contactoEdit.apellido,
                    edad: nuevaEdad || contactoEdit.edad,
                    telefono: nuevoTelefono || contactoEdit.telefono,
                    email: nuevoEmail || contactoEdit.email
                });
                await agenda.guardar();
                await prompt("\nPresione Enter para continuar...");
                break;
            case "4":
                console.log("\n== Borrar contacto ==");
                agenda.listar();
                let idBorrar = parseInt(await prompt("\nID contacto :> "));
                let contactoBorrar = agenda.contactos.find(x => x.id === idBorrar);
                if (!contactoBorrar) {
                    console.log("No existe ese ID");
                    break;
                }
                console.log("\nBorrando...");
                agenda.listar([contactoBorrar]);
                let conf = await prompt("\n¿Confirma borrado? :> S/N ");
                if (conf.toUpperCase() === "S") {
                    agenda.borrar(idBorrar);
                    await agenda.guardar();
                    console.log("Borrado.");
                } else {
                    console.log("Cancelado.");
                }
                await prompt("\nPresione Enter para continuar...");
                break;
            case "5":
                console.log("\n== Buscar contacto ==");
                let texto = await prompt("Buscar      :> ");
                let encontrados = agenda.buscar(texto);
                agenda.listar(encontrados);
                await prompt("\nPresione Enter para continuar...");
                break;
            default:
                console.log("Opción inválida");
        }
    }
    await agenda.guardar();
    console.log("\nAgenda guardada. Hasta luego!");
}

main();