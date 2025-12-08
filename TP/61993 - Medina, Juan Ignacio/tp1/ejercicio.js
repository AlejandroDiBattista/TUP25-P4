import { prompt, read, write } from "./io.js";

const FILE = "./agenda.json";

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
        this.ultimoID = 0;
    }

    static async cargar() {
        const data = await read(FILE);
        const agenda = new Agenda();

        for (let obj of data) {
            agenda.contactos.push(
                new Contacto(
                    obj.id,
                    obj.nombre,
                    obj.apellido,
                    obj.edad,
                    obj.telefono,
                    obj.email
                )
            );
            if (obj.id > agenda.ultimoID) agenda.ultimoID = obj.id;
        }

        return agenda;
    }

    async guardar() {
        await write(FILE, this.contactos);
    }

    generarID() {
        this.ultimoID++;
        return this.ultimoID;
    }

    agregar(contacto) {
        contacto.id = this.generarID();
        this.contactos.push(contacto);
    }

    editar(id, datos) {
        let c = this.contactos.find(x => x.id == id);
        if (!c) return false;

        if (datos.nombre) c.nombre = datos.nombre;
        if (datos.apellido) c.apellido = datos.apellido;
        if (datos.edad) c.edad = datos.edad;
        if (datos.telefono) c.telefono = datos.telefono;
        if (datos.email) c.email = datos.email;

        return true;
    }

    borrar(id) {
        const index = this.contactos.findIndex(x => x.id == id);
        if (index === -1) return null;

        const eliminado = this.contactos[index];
        this.contactos.splice(index, 1);

        return eliminado;
    }

    listar() {
        return [...this.contactos].sort((a, b) => {
            if (a.apellido === b.apellido)
                return a.nombre.localeCompare(b.nombre);
            return a.apellido.localeCompare(b.apellido);
        });
    }

    buscar(texto) {
        texto = texto.toLowerCase();
        return this.contactos.filter(
            c =>
                c.nombre.toLowerCase().includes(texto) ||
                c.apellido.toLowerCase().includes(texto) ||
                String(c.telefono).includes(texto) ||
                c.email.toLowerCase().includes(texto)
        );
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
        console.log("0. Salir");

        let op = await prompt("Opción :> ");

        switch (op) {
            case "1":
                console.log("\n== Lista de contactos ==");
                for (let c of agenda.listar()) {
                    console.log(
                        c.id.toString().padStart(2, "0"),
                        c.nombreCompleto().padEnd(20),
                        c.edad?.toString().padEnd(5),
                        (c.telefono || "").padEnd(12),
                        c.email
                    );
                }
                await prompt("\nEnter para continuar...");
                break;

            case "2":
                console.log("\n== Agregar ==");
                let nuevo = new Contacto();
                nuevo.nombre = await prompt("Nombre     :> ");
                nuevo.apellido = await prompt("Apellido   :> ");
                nuevo.edad = await prompt("Edad       :> ");
                nuevo.telefono = await prompt("Teléfono   :> ");
                nuevo.email = await prompt("Email      :> ");
                agenda.agregar(nuevo);
                await agenda.guardar();
                break;

            case "3":
                console.log("\n== Editar ==");
                let idE = await prompt("ID contacto :> ");
                let datos = {
                    nombre: await prompt("Nombre nuevo (Enter para dejar):> "),
                    apellido: await prompt("Apellido nuevo:> "),
                    edad: await prompt("Edad nueva:> "),
                    telefono: await prompt("Teléfono nuevo:> "),
                    email: await prompt("Email nuevo:> ")
                };
                agenda.editar(idE, datos);
                await agenda.guardar();
                break;

            case "4":
                console.log("\n== Borrar ==");
                let idB = await prompt("ID contacto :> ");
                let eliminado = agenda.borrar(idB);

                if (!eliminado) {
                    console.log("No existe ese ID.");
                    break;
                }

                console.log("Borrando...");
                console.log(eliminado);
                let conf = await prompt("¿Confirma borrado? (S/N):> ");
                if (conf.toUpperCase() === "S") await agenda.guardar();
                break;

            case "5":
                let texto = await prompt("\nBuscar :> ");
                let resultados = agenda.buscar(texto);
                for (let c of resultados) {
                    console.log(
                        c.id,
                        c.nombreCompleto(),
                        c.edad,
                        c.telefono,
                        c.email
                    );
                }
                await prompt("\nEnter para continuar...");
                break;

            case "0":
                return;

            default:
                console.log("Opción inválida.");
        }
    }
}

menu();
