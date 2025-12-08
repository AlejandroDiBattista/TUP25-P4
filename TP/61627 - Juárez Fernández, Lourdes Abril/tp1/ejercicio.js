import { prompt, write } from './io.js';
import fs from 'fs/promises';

class Contacto {
    constructor(nombre = "", apellido = "", edad = 0, telefono = "", email = "") {
        this.id = 0; // se asigna en Agenda
        this.nombre = nombre;
        this.apellido = apellido;
        this.edad = edad;
        this.telefono = telefono;
        this.email = email;
    }

    get nombreCompleto() {
        return `${this.apellido}, ${this.nombre}`;
    }
}

class Agenda {
    constructor() {
        this.contactos = [];
        this.siguienteId = 1;
        this.archivo = "agenda.json";
    }

    agregar(contacto) {
        contacto.id = this.siguienteId++;
        this.contactos.push(contacto);
    }

    listar() {
        console.log("ID  Nombre Completo       Edad  Teléfono        Email");
        this.contactos
            .sort((a, b) => a.apellido.localeCompare(b.apellido) || a.nombre.localeCompare(b.nombre))
            .forEach(c => {
                console.log(`${c.id.toString().padStart(2,'0')}  ${c.nombreCompleto.padEnd(20)} ${c.edad.toString().padEnd(5)} ${c.telefono.padEnd(15)} ${c.email}`);
            });
    }

    buscar(texto) {
        return this.contactos.filter(c =>
            c.nombreCompleto.toLowerCase().includes(texto.toLowerCase()) ||
            c.telefono.includes(texto) ||
            c.email.includes(texto)
        );
    }

    obtenerPorId(id) {
        return this.contactos.find(c => c.id === id);
    }

    borrar(id) {
        const index = this.contactos.findIndex(c => c.id === id);
        if (index !== -1) this.contactos.splice(index, 1);
    }

    async guardar() {
        const datos = {
            siguienteId: this.siguienteId,
            contactos: this.contactos
        };
        await fs.writeFile(this.archivo, JSON.stringify(datos, null, 2), 'utf-8');
    }

    static async cargar() {
        const agenda = new Agenda();
        try {
            const data = await fs.readFile(agenda.archivo, 'utf-8');
            const json = JSON.parse(data);
            agenda.contactos = json.contactos || [];
            agenda.siguienteId = json.siguienteId || 1;
        } catch (e) {
            // archivo no existe, se crea nuevo
        }
        return agenda;
    }
}

async function main() {
    let agenda = await Agenda.cargar();

    while (true) {
        console.clear();
        console.log("=== AGENDA DE CONTACTOS ===");
        console.log("1. Listar");
        console.log("2. Agregar");
        console.log("3. Editar");
        console.log("4. Borrar");
        console.log("5. Buscar");
        console.log("0. Salir");

        let opcion = await prompt("\nIngresar opción :> ");

        switch (opcion) {
            case "1":
                agenda.listar();
                await prompt("\nPresione Enter para continuar...");
                break;

            case "2":
                let c = new Contacto();
                c.nombre = await prompt("Nombre    :> ");
                c.apellido = await prompt("Apellido  :> ");
                c.edad = parseInt(await prompt("Edad      :> "));
                c.telefono = await prompt("Teléfono  :> ");
                c.email = await prompt("Email     :> ");
                agenda.agregar(c);
                await agenda.guardar();
                write("Contacto agregado.");
                await prompt("\nPresione Enter para continuar...");
                break;

            case "3":
                let idEditar = parseInt(await prompt("ID contacto a editar :> "));
                let contactoEditar = agenda.obtenerPorId(idEditar);
                if (!contactoEditar) {
                    write("Contacto no encontrado.");
                    await prompt("\nPresione Enter para continuar...");
                    break;
                }
                let input;
                input = await prompt(`Nombre (${contactoEditar.nombre}) :> `);
                if (input) contactoEditar.nombre = input;
                input = await prompt(`Apellido (${contactoEditar.apellido}) :> `);
                if (input) contactoEditar.apellido = input;
                input = await prompt(`Edad (${contactoEditar.edad}) :> `);
                if (input) contactoEditar.edad = parseInt(input);
                input = await prompt(`Teléfono (${contactoEditar.telefono}) :> `);
                if (input) contactoEditar.telefono = input;
                input = await prompt(`Email (${contactoEditar.email}) :> `);
                if (input) contactoEditar.email = input;
                await agenda.guardar();
                write("Contacto editado.");
                await prompt("\nPresione Enter para continuar...");
                break;

            case "4":
                let idBorrar = parseInt(await prompt("ID contacto a borrar :> "));
                let contactoBorrar = agenda.obtenerPorId(idBorrar);
                if (!contactoBorrar) {
                    write("Contacto no encontrado.");
                    await prompt("\nPresione Enter para continuar...");
                    break;
                }
                write(`Borrando: ${contactoBorrar.nombreCompleto}`);
                let confirm = await prompt("¿Confirma borrado? S/N :> ");
                if (confirm.toUpperCase() === "S") {
                    agenda.borrar(idBorrar);
                    await agenda.guardar();
                    write("Contacto eliminado.");
                }
                await prompt("\nPresione Enter para continuar...");
                break;

            case "5":
                let texto = await prompt("Buscar :> ");
                const encontrados = agenda.buscar(texto);
                console.log("ID  Nombre Completo       Edad  Teléfono        Email");
                encontrados.forEach(c => {
                    console.log(`${c.id.toString().padStart(2,'0')}  ${c.nombreCompleto.padEnd(20)} ${c.edad.toString().padEnd(5)} ${c.telefono.padEnd(15)} ${c.email}`);
                });
                await prompt("\nPresione Enter para continuar...");
                break;

            case "0":
                process.exit(0);

            default:
                write("Opción inválida.");
                await prompt("\nPresione Enter para continuar...");
        }
    }
}

main();
