import {prompt, read, write} from './io.js';

class Contacto {
    constructor(id, nombre, apellido, edad, telefono, email){
        this.id = id || null;
        this.nombre = nombre || "";
        this.apellido = apellido || "";
        this.edad = edad || 0;
        this.telefono = telefono || "";
        this.email = email || "";
    }

    get nombreCompleto(){
        return `${this.apellido}, ${this.nombre}`;
    }
}

class Agenda {
    constructor(){
        this.contactos = [];
        this.ultimoId = 0;
    }

    agregar(contacto){
        contacto.id = ++this.ultimoId;
        this.contactos.push(contacto);
        this.ordenar();
    }

    editar(id, datos){
        let c = this.contactos.find(c => c.id == id);
        if (c){
            Object.assign(c, datos);
            this.ordenar();
            return true;
        }
        return false;
    }

    borrar(id){
        const i = this.contactos.findIndex(c => c.id == id);
        if (i !== -1){
            return this.contactos.splice(i, 1)[0];
        }
        return null;
    }

    listar(){
        this.ordenar();
        return this.contactos;
    }

    buscar(texto){
        texto = texto.toLowerCase();
        return this.contactos.filter(c => 
            c.nombre.toLowerCase().includes(texto) ||
            c.apellido.toLowerCase().includes(texto) ||
            c.telefono.toLowerCase().includes(texto) ||
            c.email.toLowerCase().includes(texto)
        );
    }

    ordenar(){
        this.contactos.sort((a, b) => {
            if (a.apellido == b.apellido){
                return a.nombre.localeCompare(b.nombre);
            }
            return a.apellido.localeCompare(b.apellido);
        });
    }

    static async cargar(){ 
        try {
            const data = await read();
            const arr = JSON.parse(data || "[]");
            let agenda = new Agenda();
            agenda.contactos = arr.map (o => new Contacto(o.id, o.nombre, o.apellido, o.edad, o.telefono, o.email));
            agenda.ultimoId = agenda.contactos.reduce((max, c) => Math.max(max, c.id), 0);
            agenda.ordenar();
            return agenda;
        } catch {
            return new Agenda();
        }
    }

    async guardar(){
        await write(JSON.stringify(this.contactos, null, 2));
    }
}

async function main() {
    let agenda = await Agenda.cargar();
    let opcion;

    do {
        console.clear();
        console.log("=== AGENDA DE CONTACTOS ===");
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
                console.log("ID Nombre Completo       Edad        Teléfono        Email");
                for (let c of agenda.listar()) {
                    console.log(
                        String(c.id).padStart(2, "0"),
                        c.nombreCompleto.padEnd(20),
                        String(c.edad).padEnd(10),
                        String(c.telefono).padEnd(15),
                        c.email
                    );
                }
                await prompt("Presione Enter para continuar...");
                break;

            case "2":
                console.log("\n== Agregando contacto ==");
                let nombre = await prompt("Nombre      :> ");
                let apellido = await prompt("Apellido    :> ");
                let edad = await prompt("Edad        :> ");
                let telefono = await prompt("Teléfono    :> ");
                let email = await prompt("Email       :> ");
                agenda.agregar(new Contacto(null, nombre, apellido, edad, telefono, email));
                await agenda.guardar();
                break;

            case "3":
                console.log("\n== Editar contacto ==");
                let idEdit = parseInt(await prompt("ID contacto :> "));
                let contactoEdit = agenda.contactos.find(c => c.id == idEdit);
                if (!contactoEdit) {
                    console.log("No existe un contacto con ese ID.");
                    await prompt("Presione Enter para continuar...");
                    break;
                }
                let nuevoNombre = await prompt(`Nuevo nombre (${contactoEdit.nombre}) :> `) || contactoEdit.nombre;
                let nuevoApellido = await prompt(`Nuevo apellido (${contactoEdit.apellido}) :> `) || contactoEdit.apellido;
                let nuevaEdad = await prompt(`Nueva edad (${contactoEdit.edad}) :> `) || contactoEdit.edad;
                let nuevoTel = await prompt(`Nuevo teléfono (${contactoEdit.telefono}) :> `) || contactoEdit.telefono;
                let nuevoEmail = await prompt(`Nuevo email (${contactoEdit.email}) :> `) || contactoEdit.email;
                agenda.editar(idEdit, { 
                    nombre: nuevoNombre, 
                    apellido: nuevoApellido, 
                    edad: nuevaEdad, 
                    telefono: nuevoTel, 
                    email: nuevoEmail 
                });
                await agenda.guardar();
                break;

            case "4":
                console.log("\n== Borrar contacto ==");
                let idDel = parseInt(await prompt("ID contacto :> "));
                let borrado = agenda.contactos.find(c => c.id == idDel);
                if (!borrado) {
                    console.log("No existe un contacto con ese ID.");
                    await prompt("Presione Enter para continuar...");
                    break;
                }
                console.log("Borrando...");
                console.log(
                    String(borrado.id).padStart(2, "0"),
                    borrado.nombreCompleto.padEnd(20),
                    String(borrado.edad).padEnd(10),
                    String(borrado.telefono).padEnd(15),
                    borrado.email
                );
                let conf = await prompt("¿Confirma borrado? S/N :> ");
                if (conf.toLowerCase() === "s") {
                    agenda.borrar(idDel);
                    await agenda.guardar();
                }
                break;

            case "5":
                console.log("\n== Buscar contacto ==");
                let term = await prompt("Buscar :> ");
                let encontrados = agenda.buscar(term);
                console.log("ID Nombre Completo       Edad        Teléfono        Email");
                for (let c of encontrados) {
                    console.log(
                        String(c.id).padStart(2, "0"),
                        c.nombreCompleto.padEnd(20),
                        String(c.edad).padEnd(10),
                        String(c.telefono).padEnd(15),
                        c.email
                    );
                }
                await prompt("Presione Enter para continuar...");
                break;
        }

    } while (opcion !== "0");

    console.log("Hasta luego!");
}

main();