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
        this.ultimoId++;
        contacto.id = this.ultimoId;
        this.contactos.push(contacto);
    }

    editar(id, datos) {
        let c = this.contactos.find(x => x.id == id);
        if (c) {
            c.nombre = datos.nombre ?? c.nombre;
            c.apellido = datos.apellido ?? c.apellido;
            c.edad = datos.edad ?? c.edad;
            c.telefono = datos.telefono ?? c.telefono;
            c.email = datos.email ?? c.email;
        }
    }

    borrar(id) {
        let i = this.contactos.findIndex(x => x.id == id);
        if (i >= 0) {
            let [borrado] = this.contactos.splice(i, 1);
            return borrado;
        }
        return null;
    }

    buscar(texto) {
        texto = texto.toLowerCase();
        return this.contactos.filter(c =>
            c.nombre.toLowerCase().includes(texto) ||
            c.apellido.toLowerCase().includes(texto) ||
            c.email.toLowerCase().includes(texto) ||
            c.telefono.includes(texto)
        );
    }

    listar() {
        return this.contactos
            .slice()
            .sort((a, b) => {
                if (a.apellido === b.apellido)
                    return a.nombre.localeCompare(b.nombre);
                return a.apellido.localeCompare(b.apellido);
            });
    }

    static async cargar() {
        let agenda = new Agenda();
        let datos = await read("agenda.json");
        if (datos) {
            try {
                let obj = JSON.parse(datos);
                agenda.ultimoId = obj.ultimoId ?? 0;
                agenda.contactos = obj.contactos.map(c =>
                    new Contacto(c.id, c.nombre, c.apellido, c.edad, c.telefono, c.email)
                );
            } catch {
                console.log("Error leyendo el archivo, se crea agenda vacía.");
            }
        }
        return agenda;
    }

    async guardar() {
        let obj = {
            ultimoId: this.ultimoId,
            contactos: this.contactos
        };
        await write(JSON.stringify(obj, null, 2), "agenda.json");
    }
}


async function menu() {
    let agenda = await Agenda.cargar();
    let opcion = "";
    do {
        console.log("\n AGENDA DE CONTACTOS");
        console.log("1. Listar");
        console.log("2. Agregar");
        console.log("3. Editar");
        console.log("4. Borrar");
        console.log("5. Buscar");
        console.log("0. Finalizar");

        opcion = await prompt("Ingresar opción : ");

        switch (opcion) {
            case "1": // listar
                console.log("\n Lista de contactos ");
                console.log("ID | Nombre Completo | Edad | Teléfono | Email");
                for (let c of agenda.listar()) {
                    console.log(
                        `${c.id.toString().padStart(2, "0")} ${c.nombreCompleto().padEnd(20)} ${c.edad.padEnd(5)} ${c.telefono.padEnd(12)} ${c.email}`
                    );
                }
                await prompt("Presione Enter para continuar...");
                break;

            case "2": // agregar
                console.log("\n Agregando contacto ");
                let nombre = await prompt("Nombre      : ");
                let apellido = await prompt("Apellido    : ");
                let edad = await prompt("Edad        : ");
                let telefono = await prompt("Teléfono    : ");
                let email = await prompt("Email       : ");
                agenda.agregar(new Contacto(null, nombre, apellido, edad, telefono, email));
                await agenda.guardar();
                break;

            case "3": // editar
                console.log("\n Editar contacto ");
                let idEditar = parseInt(await prompt("ID contacto : "));
                let nuevoNombre = await prompt("Nuevo Nombre (enter para mantener): ");
                let nuevoApellido = await prompt("Nuevo Apellido: ");
                let nuevaEdad = await prompt("Nueva Edad: ");
                let nuevoTel = await prompt("Nuevo Teléfono: ");
                let nuevoEmail = await prompt("Nuevo Email: ");
                agenda.editar(idEditar, {
                    nombre: nuevoNombre || undefined,
                    apellido: nuevoApellido || undefined,
                    edad: nuevaEdad || undefined,
                    telefono: nuevoTel || undefined,
                    email: nuevoEmail || undefined
                });
                await agenda.guardar();
                break;

            case "4": // borrar
                console.log("\n Borrar contacto ");
                let idBorrar = parseInt(await prompt("ID contacto : "));
                let contacto = agenda.contactos.find(c => c.id == idBorrar);
                if (contacto) {
                    console.log("Borrando...");
                    console.log(`${contacto.id} ${contacto.nombreCompleto()} ${contacto.edad} ${contacto.telefono} ${contacto.email}`);
                    let conf = await prompt("¿Confirma borrado? (S/N) : ");
                    if (conf.toUpperCase() === "S") {
                        agenda.borrar(idBorrar);
                        await agenda.guardar();
                    }
                } else {
                    console.log("Contacto no encontrado.");
                }
                break;

            case "5": // buscar
                console.log("\n Buscar contacto ");
                let texto = await prompt("Buscar : ");
                let encontrados = agenda.buscar(texto);
                console.log("ID | Nombre Completo | Edad | Teléfono | Email");
                for (let c of encontrados) {
                    console.log(
                        `${c.id.toString().padStart(2, "0")} ${c.nombreCompleto().padEnd(20)} ${c.edad.padEnd(5)} ${c.telefono.padEnd(12)} ${c.email}`
                    );
                }
                await prompt("Presionar Enter para continuar...");
                break;

            case "0":
                console.log("Saliendo...");
                break;

            default:
                console.log("Opción no aceptada.");
        }

    } while (opcion !== "0");
}

await menu();
