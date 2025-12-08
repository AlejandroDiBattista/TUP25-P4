import { prompt } from './io.js';
import fs from 'fs/promises';

class Contacto {
    constructor(nombre = "", edad = 0, telefono = "", email = "") {
        this.id = 0; 
        this.nombre = nombre;
        this.edad = edad;
        this.telefono = telefono;
        this.email = email;
    }
}

class Agenda {
    constructor() {
        this.lista = [];
        this.siguienteId = 1;
        this.archivo = "agenda.json";
    }

    agregar(contacto) {
        contacto.id = this.siguienteId++;
        this.lista.push(contacto);
    }

    listar() {
        if (this.lista.length === 0) {
            console.log("\nNo hay contactos en la agenda.");
            return;
        }
        console.log("\nID | Nombre            | Edad | Teléfono        | Email");
        console.log("-------------------------------------------------------------");
        this.lista.forEach(c => {
            console.log(
                `${c.id.toString().padStart(2, "0")} | ${c.nombre.padEnd(16)} | ${c.edad.toString().padEnd(4)} | ${c.telefono.padEnd(14)} | ${c.email}`
            );
        });
    }

    buscar(texto) {
        return this.lista.filter(c =>
            c.nombre.toLowerCase().includes(texto.toLowerCase()) ||
            c.telefono.includes(texto) ||
            c.email.toLowerCase().includes(texto.toLowerCase())
        );
    }

    obtenerPorId(id) {
        return this.lista.find(c => c.id === id);
    }

    borrar(id) {
        this.lista = this.lista.filter(c => c.id !== id);
    }

    async guardar() {
        const datos = {
            lista: this.lista,
            siguienteId: this.siguienteId
        };
        await fs.writeFile(this.archivo, JSON.stringify(datos, null, 2), "utf-8");
    }

    static async cargar() {
        const a = new Agenda();
        try {
            const datos = await fs.readFile(a.archivo, "utf-8");
            const json = JSON.parse(datos);
            a.lista = json.lista || [];
            a.siguienteId = json.siguienteId || 1;
        } catch {
            // si no existe, arranca vacío
        }
        return a;
    }
}

async function main() {
    let agenda = await Agenda.cargar();

    while (true) {
        console.clear();
        console.log("===== AGENDA =====");
        console.log("[1] Listar contactos");
        console.log("[2] Agregar contacto");
        console.log("[3] Editar contacto");
        console.log("[4] Borrar contacto");
        console.log("[5] Buscar contacto");
        console.log("[0] Salir");

        let opcion = await prompt("\nOpción :> ");

        switch (opcion) {
            case "1":
                agenda.listar();
                await prompt("\nEnter para continuar...");
                break;

            case "2":
                const nuevo = new Contacto();
                nuevo.nombre = await prompt("Nombre    :> ");
                nuevo.edad = parseInt(await prompt("Edad      :> "));
                nuevo.telefono = await prompt("Teléfono  :> ");
                nuevo.email = await prompt("Email     :> ");
                agenda.agregar(nuevo);
                await agenda.guardar();
                console.log("✓ Contacto agregado.");
                await prompt("\nEnter para continuar...");
                break;

            case "3":
                let idEdit = parseInt(await prompt("ID a editar :> "));
                let edit = agenda.obtenerPorId(idEdit);
                if (!edit) {
                    console.log("Contacto no encontrado.");
                    await prompt("\nEnter para continuar...");
                    break;
                }
                let dato;
                dato = await prompt(`Nombre (${edit.nombre}) :> `);
                if (dato) edit.nombre = dato;
                dato = await prompt(`Edad (${edit.edad}) :> `);
                if (dato) edit.edad = parseInt(dato);
                dato = await prompt(`Teléfono (${edit.telefono}) :> `);
                if (dato) edit.telefono = dato;
                dato = await prompt(`Email (${edit.email}) :> `);
                if (dato) edit.email = dato;
                await agenda.guardar();
                console.log("✓ Contacto editado.");
                await prompt("\nEnter para continuar...");
                break;

            case "4":
                let idDel = parseInt(await prompt("ID a borrar :> "));
                let borrar = agenda.obtenerPorId(idDel);
                if (!borrar) {
                    console.log("Contacto no encontrado.");
                } else {
                    const conf = await prompt(`¿Borrar a ${borrar.nombre}? (s/n): `);
                    if (conf.toLowerCase() === "s") {
                        agenda.borrar(idDel);
                        await agenda.guardar();
                        console.log("✓ Contacto eliminado.");
                    }
                }
                await prompt("\nEnter para continuar...");
                break;

            case "5":
                let texto = await prompt("Buscar :> ");
                const encontrados = agenda.buscar(texto);
                if (encontrados.length === 0) {
                    console.log("No se encontraron coincidencias.");
                } else {
                    console.log("\nResultados:");
                        encontrados.forEach(c =>
                            console.log(`${c.id} - ${c.nombre} (${c.telefono}, ${c.email})`)
                        );
                }
                await prompt("\nEnter para continuar...");
                break;

            case "0":
                console.log("Saliendo...");
                process.exit(0);

            default:
                console.log("Opción inválida.");
                await prompt("\nEnter para continuar...");
        }
    }
}

main();