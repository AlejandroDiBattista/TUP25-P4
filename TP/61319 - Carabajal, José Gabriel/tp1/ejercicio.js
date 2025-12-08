const { prompt, read, write } = require('./io.js');

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
    constructor() {
        this.contactos = [];  // guardo los contacots
        this.ultimoId = 0;    // genero id automatico
    }

    agregar(contacto) {
        this.ultimoId++;
        contacto.id = this.ultimoId;   // con esto asigno id unico
        this.contactos.push(contacto);  // lo guardo en la lista
    }


    async guardar() {
        let datos = JSON.stringify({
            contactos: this.contactos,
            ultimoId: this.ultimoId
        }, null, 2);

        await write(datos, "agenda.json");
    }


    static async cargar() {
        try {
            let datos = await read("agenda.json");
            let obj = JSON.parse(datos);

            let agenda = new Agenda();
            agenda.contactos = obj.contactos ?? [];
            agenda.ultimoId = obj.ultimoId ?? 0;
            return agenda;
        } catch (e) {
            return new Agenda();
        }
    }


    listar() {
        if(this.contactos.length === 0) {
            console.log("No hay contactos en la agenda.");
            return;
        }

        console.log("===== Lista de Contactos =====")
        console.log("ID     Nombre Completo    Edad    Teléfono    Email")
        for (let c of this.contactos) {
            console.log(`${c.id.toString().padEnd(4)} ${ (c.nombre + " " + c.apellido).padEnd(20)} ${c.edad.toString().padEnd(6)} ${c.telefono.padEnd(12)} ${c.email}`);
        }
        
    }


    async agregarContacto() {
        let nombre = await prompt("Nombre :> ");
        let apellido = await prompt("Apellido :> ");
        let edad = await prompt("Edad :> ");
        let telefono = await prompt("Teléfono :> ");
        let email = await prompt("Email :> ");

        let contacto = new Contacto(null, nombre, apellido, edad, telefono, email);
        this.agregar(contacto)

        console.log("Contacto agregado correctamente.")
    }


    async editar() {
        let id = await prompt("Ingrese el ID del contacto a editar: ");
        id = parseInt(id);
        let contacto = this.contactos.find(c => c.id === id);

        if (!contacto) {
            console.log("Contacto no encontrado.");
            return;
        }

        console.log("Dejá vacío lo que no quieras editar y mantener el valor actual.")

        let nombre = await prompt(`Nombre (${contacto.nombre}): `);
        if(nombre) contacto.nombre = nombre;

        let apellido = await prompt(`Apellido (${contacto.apellido}): `);
        if(apellido) contacto.apellido = apellido;

        let edad = await prompt(`Edad (${contacto.edad}): `);
        if(edad) contacto.edad = edad;

        let telefono = await prompt(`Teléfono (${contacto.telefono}): `);
        if (telefono) contacto.telefono = telefono;

        let email = await prompt(`Email (${contacto.email}): `);
        if (email) contacto.email = email;

        console.log("Contacto editado correctamente.")
    }


    async borrar() {
        let id = await prompt("Ingrese el ID del contacto a borrar: ");
        id = parseInt(id);

        let index = this.contactos.findIndex(c => c.id === id);

        if (index === -1) {
            console.log("Contacto no encontrado.")
            return;
        }

        // Confirmar para borrar
        let confirmacion = await prompt(`¿Confirma borrado?  (s/n)`);
        if (confirmacion.toLowerCase() === 's') {
            this.contactos.splice(index, 1); // elimina el contacto
            console.log("Contacto eliminado correctamente.");
        } else {
            console.log("Se canceló el borrado.")
        }
    }


    async buscar() {
        let texto = await prompt("Ingrese nombre o apellido a buscar: ");
        let resultados = this.contactos.filter(
            c => c.nombre.toLowerCase().includes(texto.toLowerCase()) ||
                c.apellido.toLowerCase().includes(texto.toLowerCase())
        );

        if (resultados.length === 0) {
            console.log("No se encontraron contactos.");
        } else {
            console.log("==== Resultados ====");
            resultados.forEach(c =>
                console.log(`${c.id}) ${c.nombre} ${c.apellido} - Tel: ${c.telefono} - Email: ${c.email}`)
            );
        }
    }

}

// ==== M E N Ú ====
async function main() {
    let agenda = await Agenda.cargar();

    while (true) {
        console.log("\n ===== AGENDA DE CONTACTOS =====");
        console.log("1) Listar Contactos");
        console.log("2) Agregar Contacto");
        console.log("3) Editar un Contacto");
        console.log("4) Borrar un Contacto");
        console.log("5) Buscar un Contacto");
        console.log("0) Finalizar");
    
        let opcion = await prompt("Ingresar una opción :> ");
    
        switch (opcion) {
            case "1":
                agenda.listar();
                break;
            case "2":
                await agenda.agregarContacto();
                await agenda.guardar();
                break;
            case "3":
                await agenda.editar();
                await agenda.guardar();
                break;
            case "4":
                await agenda.borrar();
                await agenda.guardar();
                break;
            case "5":
                await agenda.buscar();
                break;
            case "0":
                console.log("Finalizando...");
                process.exit(0);
            default:
                console.log("Opción inválida.");
        }
    }
}

main();

