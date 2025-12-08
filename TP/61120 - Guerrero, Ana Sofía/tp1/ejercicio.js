import { prompt, read, write } from "./io.js";

const FILE = "agenda.json";

class Contacto {
    constructor(id, nombre, apellido, edad, telefono, email) {
        this.id = id;
        this.nombre = nombre;
        this.apellido = apellido;
        this.edad = edad;
        this.telefono = telefono;
        this.email = email;
    }
}


class Agenda {
    constructor(contactos = [], ultimoId = 0) {
        this.contactos = contactos;
        this.ultimoId = ultimoId;
    }

    agregar(contacto) {
        this.ultimoId++;
        contacto.id = this.ultimoId;
        this.contactos.push(contacto);
    }

    editar(id, datos) {
        let c = this.contactos.find(x => x.id === id);
        if (c) Object.assign(c, datos);
    }

    borrar(id) {
        this.contactos = this.contactos.filter(x => x.id !== id);
    }

    buscar(texto) {
        texto = texto.toLowerCase();
        return this.contactos.filter(
            c =>
                c.nombre.toLowerCase().includes(texto) ||
                c.apellido.toLowerCase().includes(texto) ||
                c.email.toLowerCase().includes(texto) ||
                c.telefono.includes(texto)
        );
    }

    listar() {
        return this.contactos.sort((a, b) => {
            if (a.apellido === b.apellido) return a.nombre.localeCompare(b.nombre);
            return a.apellido.localeCompare(b.apellido);
        });
    }

   
    static async cargar() {
        let data = await read(FILE);
        if (!data || !data.contactos) return new Agenda();
        return new Agenda(data.contactos, data.ultimoId);
    }

    async guardar() {
        await write(FILE, {
            contactos: this.contactos,
            ultimoId: this.ultimoId,
        });
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
                console.log("\n== Lista de contactos ==");
                agenda.listar().forEach(c =>
                    console.log(
                        `${c.id.toString().padStart(2, "0")} ${c.apellido}, ${c.nombre}  ${c.edad}  ${c.telefono}  ${c.email}`
                    )
                );
                break;

            case "2":
                console.log("\n== Agregando contacto ==");
                let nombre = await prompt("Nombre :> ");
                let apellido = await prompt("Apellido :> ");
                let edad = await prompt("Edad :> ");
                let telefono = await prompt("Teléfono :> ");
                let email = await prompt("Email :> ");
                agenda.agregar(new Contacto(null, nombre, apellido, edad, telefono, email));
                await agenda.guardar();
                console.log("Contacto agregado.");
                break;

            case "3":
                console.log("\n== Editar contacto ==");
                let idEditar = parseInt(await prompt("ID :> "));
                let cEdit = agenda.contactos.find(c => c.id === idEditar);
                if (cEdit) {
                    let nuevoNombre = await prompt(`Nombre [${cEdit.nombre}] :> `);
                    let nuevoApellido = await prompt(`Apellido [${cEdit.apellido}] :> `);
                    let nuevaEdad = await prompt(`Edad [${cEdit.edad}] :> `);
                    let nuevoTel = await prompt(`Teléfono [${cEdit.telefono}] :> `);
                    let nuevoEmail = await prompt(`Email [${cEdit.email}] :> `);
                    agenda.editar(idEditar, {
                        nombre: nuevoNombre || cEdit.nombre,
                        apellido: nuevoApellido || cEdit.apellido,
                        edad: nuevaEdad || cEdit.edad,
                        telefono: nuevoTel || cEdit.telefono,
                        email: nuevoEmail || cEdit.email,
                    });
                    await agenda.guardar();
                    console.log("Contacto actualizado.");
                } else {
                    console.log("ID no encontrado.");
                }
                break;

            case "4":
                console.log("\n== Borrar contacto ==");
                let idBorrar = parseInt(await prompt("ID :> "));
                let cBorrar = agenda.contactos.find(c => c.id === idBorrar);
                if (cBorrar) {
                    console.log(`Borrando... ${cBorrar.apellido}, ${cBorrar.nombre}`);
                    let conf = await prompt("¿Confirma borrado? (S/N) :> ");
                    if (conf.toLowerCase() === "s") {
                        agenda.borrar(idBorrar);
                        await agenda.guardar();
                        console.log("Contacto borrado.");
                    }
                } else {
                    console.log("ID no encontrado.");
                }
                break;

            case "5":
                console.log("\n== Buscar contacto ==");
                let term = await prompt("Buscar :> ");
                let resultados = agenda.buscar(term);
                resultados.forEach(c =>
                    console.log(
                        `${c.id.toString().padStart(2, "0")} ${c.apellido}, ${c.nombre}  ${c.edad}  ${c.telefono}  ${c.email}`
                    )
                );
                break;
        }

        if (opcion !== "0") await prompt("\nPresione Enter para continuar...");
    } while (opcion !== "0");

    console.log("Programa finalizado.");
}

await main();
