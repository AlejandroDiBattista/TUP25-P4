// ejercicio.js
import { prompt, read, write } from './io.js';

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
    constructor(contactos = []) {
        this.contactos = contactos;
        this.nextId = this.contactos.length > 0
            ? Math.max(...this.contactos.map(c => c.id)) + 1
            : 1;
    }

    agregar(contacto) {
        contacto.id = this.nextId++;
        this.contactos.push(contacto);
    }

    editar(id, datosNuevos) {
        let c = this.contactos.find(x => x.id === id);
        if (c) {
            Object.assign(c, datosNuevos);
        }
    }

    borrar(id) {
        this.contactos = this.contactos.filter(c => c.id !== id);
    }

    listar() {
        return this.contactos
            .sort((a, b) => a.apellido.localeCompare(b.apellido) || a.nombre.localeCompare(b.nombre));
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

    static async cargar() {
        let data = await read();
        let arr = JSON.parse(data);
        let contactos = arr.map(o => new Contacto(o.id, o.nombre, o.apellido, o.edad, o.telefono, o.email));
        return new Agenda(contactos);
    }

    async guardar() {
        await write(JSON.stringify(this.contactos, null, 2));
    }
}

// === Helper para imprimir tabla ===
function imprimirTabla(contactos) {
    if (contactos.length === 0) {
        console.log("(sin resultados)");
        return;
    }

    const filas = contactos.map(c => ({
        id: String(c.id).padStart(2, '0'),
        nombre: `${c.apellido}, ${c.nombre}`,
        edad: String(c.edad ?? ''),
        telefono: String(c.telefono ?? ''),
        email: String(c.email ?? '')
    }));

    const H = { id: 'ID', nombre: 'Nombre Apellido', edad: 'Edad', telefono: 'Teléfono', email: 'Email' };

    const W = {
        id: Math.max(H.id.length, ...filas.map(f => f.id.length)),
        nombre: Math.max(H.nombre.length, ...filas.map(f => f.nombre.length)),
        edad: Math.max(H.edad.length, ...filas.map(f => f.edad.length)),
        telefono: Math.max(H.telefono.length, ...filas.map(f => f.telefono.length)),
        email: Math.max(H.email.length, ...filas.map(f => f.email.length)),
    };

    const sep = '  ';

    const linea = f =>
        f.id.padEnd(W.id) + sep +
        f.nombre.padEnd(W.nombre) + sep +
        f.edad.padStart(W.edad) + sep +
        f.telefono.padEnd(W.telefono) + sep +
        f.email.padEnd(W.email);

    console.log(linea(H));
    filas.forEach(f => console.log(linea(f)));
}

// =============== MENÚ PRINCIPAL ===============
async function main() {
    let agenda = await Agenda.cargar();
    let opcion = "";

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
            case "1": // Listar
                console.log("\n== Lista de contactos ==");
                imprimirTabla(agenda.listar());
                await prompt("Presione Enter para continuar...");
                break;

            case "2": // Agregar
                console.log("\n== Agregando contacto ==");
                let nombre = await prompt("Nombre      :> ");
                let apellido = await prompt("Apellido    :> ");
                let edad = await prompt("Edad        :> ");
                let telefono = await prompt("Teléfono    :> ");
                let email = await prompt("Email       :> ");
                let nuevo = new Contacto(null, nombre, apellido, edad, telefono, email);
                agenda.agregar(nuevo);
                await agenda.guardar();
                break;

            case "3": // Editar
                console.log("\n== Editar contacto ==");
                let idEdit = parseInt(await prompt("ID contacto :> "));
                let c = agenda.contactos.find(x => x.id === idEdit);
                if (c) {
                    let nuevoNombre = await prompt(`Nombre [${c.nombre}] :> `) || c.nombre;
                    let nuevoApellido = await prompt(`Apellido [${c.apellido}] :> `) || c.apellido;
                    let nuevaEdad = await prompt(`Edad [${c.edad}] :> `) || c.edad;
                    let nuevoTel = await prompt(`Teléfono [${c.telefono}] :> `) || c.telefono;
                    let nuevoEmail = await prompt(`Email [${c.email}] :> `) || c.email;
                    agenda.editar(idEdit, {
                        nombre: nuevoNombre,
                        apellido: nuevoApellido,
                        edad: nuevaEdad,
                        telefono: nuevoTel,
                        email: nuevoEmail
                    });
                    await agenda.guardar();
                } else {
                    console.log("No existe un contacto con ese ID.");
                }
                break;

            case "4": // Borrar
                console.log("\n== Borrar contacto ==");
                let idBorrar = parseInt(await prompt("ID contacto :> "));
                let borrar = agenda.contactos.find(x => x.id === idBorrar);
                if (borrar) {
                    console.log("Borrando...");
                    imprimirTabla([borrar]);
                    let confirma = await prompt("¿Confirma borrado? (S/N) :> ");
                    if (confirma.toLowerCase() === "s") {
                        agenda.borrar(idBorrar);
                        await agenda.guardar();
                    }
                } else {
                    console.log("No existe un contacto con ese ID.");
                }
                break;

            case "5": // Buscar
                console.log("\n== Buscar contacto ==");
                let texto = await prompt("Buscar :> ");
                let resultados = agenda.buscar(texto);
                imprimirTabla(resultados);
                await prompt("Presione Enter para continuar...");
                break;

            case "0":
                console.log("Finalizando...");
                break;

            default:
                console.log("Opción no válida.");
        }

    } while (opcion !== "0");
}

main();
