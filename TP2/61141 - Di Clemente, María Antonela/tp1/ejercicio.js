import { parse } from 'node:path';
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
    toString() {
        return `${this.id.toString().padStart(2, "0")} ${this.apellido}, ${this.nombre} - ${this.edad} años - ${this.telefono} - ${this.email}`;

    }
}

class Agenda {
    constructor(contactos = []) {
        this.contactos = contactos;
        this.nextId = contactos.length > 0
        ? Math.max(...contactos.map(c => c.id)) + 1 : 1;
    }

    agregar(contacto){
        contacto.id = this.nextId++;
        this.contactos.push(contacto);
    }
    
    editar(id, datos){
        let c = this.contactos.find(x => x.id == id );
        if (c) {
            Object.assign(c, datos);
            return true;
        }
        return false;
    }
    
    borrar(id){
        let index = this.contactos.findIndex(x => x.id == id);
        if (index >= 0) {
            this.contactos.splice(index, 1);
            return true;
        }
        return false;
    }

    listar() {
        return this.contactos.sort((a,b) => {
            if (a.apellido !== b.apellido) return a.apellido.localeCompare(b.apellido);
            return a.nombre.localeCompare(b.nombre);
        });
    }

    buscar(texto){
        texto = texto.toLowerCase();
        return this.contactos.filter(c =>
            c.nombre.toLowerCase().includes(texto) ||
            c.apellido.toLowerCase().includes(texto) ||
            c.email.toLowerCase().includes(texto)
         );

    }

    static async cargar(){
        let json = await read('./agenda.json');
        let datos = JSON.parse(json || "[]");
        let contactos = datos.map(c => new Contacto(c.id, c.nombre, c.apellido, c.edad, c.telefono, c.email)); 
        return new Agenda(contactos); 
    }
    async guardar(){
        await write(JSON.stringify(this.contactos, null, 2), './agenda.json');

    }
}


// EJEMPLO DE USO... borrar...
let agenda = await Agenda.cargar();
let opcion;

do {
    console.log("==AGENDA DE CONTACTOS==");
    console.log("1)Listar");
    console.log("2)Agregar");
    console.log("3)Editar");
    console.log("4)Borrar");
    console.log("5)Buscar");
    console.log("0)Finalizar");
    console.log("elija una opcion");

    opcion = await prompt("Opcion:> ");

    switch (opcion) {
        case "1":
            console.log("==LISTA DE CONTACTOS==");
            agenda.listar().forEach(c => console.log(c.toString()));
            break;
            
        case "2":
            console.log("==AGREGAR CONTACTO==");
            let nombre = await prompt("Nombre :>");
            let apellido = await prompt("Apellido :>");
            let edad = parseInt(await prompt("Edad :>"));
            let telefono = await prompt("telefono :>")
            let email = await prompt("Email :>");
            agenda.agregar(new Contacto(null, nombre, apellido, edad, telefono, email));
            break;

        case "3":
        console.log("==EDITAR CONTACTO==");
          let idEditar = parseInt(await prompt("ID :> "));
            let cEdit = {};
            cEdit.nombre = await prompt("Nombre nuevo :> ");
            cEdit.apellido = await prompt("Apellido nuevo :> ");
            cEdit.edad = parseInt(await prompt("Edad nueva :> "));
            cEdit.telefono = await prompt("Teléfono nuevo :> ");
            cEdit.email = await prompt("Email nuevo :> ");
            if (!agenda.editar(idEditar, cEdit)) {
                console.log("No se encontro el contacto.");
            }
            break;
            
        case "4":
            console.log("==BORRAR CONTACTO==");
            let idBorrar = parseInt(await prompt("ID :>"));
            if(!agenda.borrar(idBorrar)) {
                console.log("No se encontro el contacto");
            }
            break;
            
        case "5":
            console.log("==BUSCAR CONTACTO==");
            let txt = await prompt("Buscar  :>");
            agenda.buscar(txt).forEach(c => console.log(c.toString()));
            break;
            
        case "0":
            console.log("Programa terminado")  
            break;
            
        default:
            console.log("Opcion invalida");    
    }
    await agenda.guardar();

} while (opcion !== "0");