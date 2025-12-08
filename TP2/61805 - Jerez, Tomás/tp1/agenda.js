import { read, write } from './io.js';

class Contacto {
  constructor(id, nombre, apellido, edad, telefono, email) {
    this.id = id;
    this.nombre = nombre;
    this.apellido = apellido;
    this.edad = edad;
    this.telefono = telefono;
    this.email = email;
  }

  mostrar() {
    return `${this.id.toString().padStart(2, '0')} ${this.apellido}, ${this.nombre}   ${this.edad}    ${this.telefono}   ${this.email}`;
  }
}

class Agenda {
  constructor() {
    this.contactos = [];
    this.siguienteId = 1;
  }

  static async cargar() {
    const data = await read();
    const contactos = JSON.parse(data);
    const agenda = new Agenda();
    agenda.contactos = contactos.map(c => new Contacto(c.id, c.nombre, c.apellido, c.edad, c.telefono, c.email));
    agenda.siguienteId = agenda.contactos.length > 0 ? Math.max(...agenda.contactos.map(c => c.id)) + 1 : 1;
    return agenda;
  }

  async guardar() {
    const data = JSON.stringify(this.contactos, null, 2); 
    await write(data);
  }

  agregar(contacto) {
    this.contactos.push(contacto);
  }

  listar() {
    const sortedContacts = this.contactos.sort((a, b) => {
      return a.apellido.localeCompare(b.apellido) || a.nombre.localeCompare(b.nombre);
    });
    sortedContacts.forEach(contacto => console.log(contacto.mostrar()));
  }

  buscar(termino) {
    const resultados = this.contactos.filter(contacto =>
      contacto.nombre.toLowerCase().includes(termino.toLowerCase()) ||
      contacto.apellido.toLowerCase().includes(termino.toLowerCase()) ||
      contacto.telefono.includes(termino) ||
      contacto.email.includes(termino)
    );
    if (resultados.length > 0) {
      resultados.forEach(contacto => console.log(contacto.mostrar()));
    } else {
      console.log('No se encontraron contactos con ese término.');
    }
  }

  editar(id, nombre, apellido, edad, telefono, email) {
    const contacto = this.contactos.find(c => c.id === id);
    if (contacto) {
      contacto.nombre = nombre;
      contacto.apellido = apellido;
      contacto.edad = edad;
      contacto.telefono = telefono;
      contacto.email = email;
      console.log('Contacto actualizado');
    } else {
      console.log('No se encontró el contacto.');
    }
  }

  borrar(id) {
    const index = this.contactos.findIndex(c => c.id === id);
    if (index !== -1) {
      const [contacto] = this.contactos.splice(index, 1);
      console.log(`Contacto borrado: ${contacto.mostrar()}`);
    } else {
      console.log('No se encontró el contacto.');
    }
  }
}

export { Agenda, Contacto };
