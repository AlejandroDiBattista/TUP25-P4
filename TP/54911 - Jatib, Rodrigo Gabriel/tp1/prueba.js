class Agenda {
    static proximoId = 1;

    static getNextId() {
        return this.proximoId++;
    }

    constructor() {
        this.contactos = [];
    }

    agregarContacto(contacto) {
        contacto.id = Agenda.getNextId();
        this.contactos.push(contacto);
    }

    eliminarContacto(contacto) {
        const index = this.contactos.indexOf(contacto);
        if (index > -1) {
            this.contactos.splice(index, 1);
        }
    }

    listarContactos() {
        return this.contactos;
    }
}

let a = new Agenda();
a.agregarContacto({ nombre: "Juan", edad: 30 });

Array.from(1, 2, 3)
Number("100")
Number.parseInt("100")

Object.keys({ a: 1, b: 2 })
Object.values({ a: 1, b: 2 })
Object.assign()

Math.max(1, 2, 3)