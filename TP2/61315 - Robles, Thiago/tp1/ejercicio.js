import { prompt, read, write } from './io.js';

class Contacto {

    constructor(nombre, apellido, edad, telefono, email) {
        this.id = null;
        this.nombre = nombre;
        this.apellido = apellido;
        this.edad = edad;
        this.telefono = telefono;
        this.email = email;
    }

    toString() {
        return `${this.id} - ${this.nombre} ${this.apellido}, ${this.edad} años, ${this.telefono}, ${this.email}`;
    }
}

class Agenda {
    static idAutoincrementable = 1;

    constructor() {
        this.contactos = [];
    }

    agregar(contacto) {
        contacto.id = Agenda.idAutoincrementable++;
        this.contactos.push(contacto);
    }

    editar(id, nuevoContacto) {
        let indice = this.contactos.findIndex(contacto => contacto.id == id);
        
        if (indice !== -1) {
            nuevoContacto.id = id; // Mantener el mismo id
            this.contactos[indice] = nuevoContacto;
            console.log("Contacto editado.");
        } else {
            console.log("Contacto no encontrado.");
        }
    }

    eliminar(id) {
        let indice = this.contactos.findIndex(contacto => contacto.id == id);
        if (indice !== -1) {
            this.contactos.splice(indice, 1);
            console.log("Contacto eliminado.");
        } else {
            console.log("Contacto no encontrado.");
        }
    }

    listar() {
        this.contactos.sort((a, b) => {
            let compararApellido = a.apellido.localeCompare(b.apellido);
            if (compararApellido !== 0) return compararApellido;
            return a.nombre.localeCompare(b.nombre);
        });
        console.log("=== LISTA DE CONTACTOS ===");
        console.table(this.contactos.map(contacto => ({
            ID: contacto.id,
            Nombre: contacto.nombre,
            Apellido: contacto.apellido,
            Edad: contacto.edad,
            Teléfono: contacto.telefono,
            Email: c.email
        })));
    }

    buscar(criterio) {
        let resultados = this.contactos.filter(contacto =>
            contacto.nombre.includes(criterio) ||
            contacto.apellido.includes(criterio) ||
            contacto.email.includes(criterio) ||
            contacto.telefono.includes(criterio)
        );

        if (resultados.length === 0) {
            console.log("No se encontraron contactos.");
        } else {
            console.log("Contactos encontrados:");
            resultados.forEach(contacto => console.log(contacto.toString()));
        }
    }

    static async cargar() {
        let agenda = new Agenda();
        try {
            const data = await read("./agenda.json");
            agenda.contactos = JSON.parse(data);
            if (agenda.contactos.length > 0) {
                let idMax = Math.max(...agenda.contactos.map(c => c.id));
                Agenda.idAutoincrementable = idMax + 1;
            }
        } catch {
            agenda.contactos = [];
        }
        return agenda;
    }

    async guardar() {
        await write(JSON.stringify(this.contactos, null, 2), "./agenda.json");
    }
}

class Menu {
    constructor(agenda) {
        this.agenda = agenda;
    }

    mostrar() {
        console.log("=== AGENDA DE CONTACTOS ===");
        console.log("1 - Agregar contacto");
        console.log("2 - Editar contacto");
        console.log("3 - Eliminar contacto");
        console.log("4 - Listar contactos");
        console.log("5 - Buscar contacto");
        console.log("6 - Salir");
    }

    async ejecutar() {
        let salir = false;
        while (!salir) {
            this.mostrar();
            let opcion = await prompt("Seleccione una opción (1-6): ");
            switch (opcion) {
                case "1":
                    await this.agregar();
                    break;
                case "2":
                    await this.editar();
                    break;
                case "3":
                    await this.eliminar();
                    break;
                case "4":
                    this.agenda.listar();
                    break;
                case "5":
                    await this.buscar();
                    break;
                case "6":
                    let confirmar = await prompt("¿Desea salir? (s/n): ");
                    if (confirmar.toLowerCase() === "s") salir = true;
                    break;
                default:
                    console.log("Opción no válida.");
            }
        }
        await this.agenda.guardar();
        console.log("¡Gracias por usar la agenda!");
    }

    async agregar() {
        let nombre = await prompt("Nombre: ");
        let apellido = await prompt("Apellido: ");
        let edad = await prompt("Edad: ");
        let telefono = await prompt("Teléfono: ");
        let email = await prompt("Email: ");
        let contacto = new Contacto(nombre, apellido, edad, telefono, email);
        this.agenda.agregar(contacto);
        await this.agenda.guardar();
        console.log("Contacto agregado correctamente.");
    }

    async editar() {

        // Mostrar contactos para seleccionar cuál editar
        this.agenda.listar();


        let id = await prompt("Ingrese el ID del contacto a editar: ");
        let nombre = await prompt("Nuevo nombre: ");
        let apellido = await prompt("Nuevo apellido: ");
        let edad = await prompt("Nueva edad: ");
        let telefono = await prompt("Nuevo teléfono: ");
        let email = await prompt("Nuevo email: ");
        let nuevoContacto = new Contacto(nombre, apellido, edad, telefono, email);
        this.agenda.editar(Number(id), nuevoContacto);
        await this.agenda.guardar();
    }

    async eliminar() {
        this.agenda.listar();
        let id = await prompt("Ingrese el ID del contacto a eliminar: ");
        this.agenda.eliminar(Number(id));
        await this.agenda.guardar();
    }

    async buscar() {
        let criterio = await prompt("Ingrese nombre, apellido, email o teléfono a buscar: ");
        this.agenda.buscar(criterio);
    }
}

// Programa principal

let agenda = await Agenda.cargar();
let menu = new Menu(agenda);
await menu.ejecutar();
