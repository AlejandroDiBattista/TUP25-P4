import {prompt, read, write} from './io.js';

class Contacto {
    /*...*/
}

class Agenda {
    agregar(contacto){/*...*/}
    static async cargar(){ return new Agenda();/*...*/ }
    async guardar(){/*...*/}
}


// EJEMPLO DE USO... borrar...
let agenda = await Agenda.cargar();

console.log("=== Ingresar nuevo contacto ===");

let c = new Contacto();
c.nombre = await prompt("Nombre :>");
c.edad   = await prompt("Edad   :>");
agenda.agregar(c);

await agenda.guardar(); 