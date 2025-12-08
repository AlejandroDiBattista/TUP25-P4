function normalizar(txt = "") {
  return String(txt)
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

class Contacto {
  constructor({ id, nombre, apellido, telefono, email }) {
    this.id = id ?? 0;
    this.nombre = nombre?.trim() ?? "";
    this.apellido = apellido?.trim() ?? "";
    this.telefono = telefono?.trim() ?? "";
    this.email = email?.trim() ?? "";
  }

  get nombreCompleto() {
    return `${this.nombre} ${this.apellido}`.trim();
  }

  includes(texto) {
    const t = normalizar(texto);
    return (
      normalizar(this.nombre).includes(t) ||
      normalizar(this.apellido).includes(t) ||
      normalizar(this.telefono).includes(t) ||
      normalizar(this.email).includes(t)
    );
  }
}

class Agenda {
  static ultimoId = 0;

  constructor() {
    this.contactos = [];
  }

  actualizar(contacto) {
    const ok =
      contacto &&
      String(contacto.nombre || "").trim() &&
      String(contacto.apellido || "").trim() &&
      String(contacto.telefono || "").trim() &&
      String(contacto.email || "").trim();

    if (!ok) return; 

    if (contacto.id && Number(contacto.id) > 0) {
      const idNum = Number(contacto.id);
      const i = this.contactos.findIndex((c) => c.id === idNum);
      if (i !== -1)
        this.contactos[i] = new Contacto({ ...contacto, id: idNum });
    } else {
      const nuevo = new Contacto(contacto);
      nuevo.id = ++Agenda.ultimoId;
      this.contactos.push(nuevo);
    }
  }

  eliminar(id) {
    const idNum = Number(id);
    const i = this.contactos.findIndex((c) => c.id === idNum);
    if (i !== -1) this.contactos.splice(i, 1);
  }

  traer(id) {
    return this.contactos.find((c) => c.id === Number(id));
  }

  traerTodos(filtro = "") {
    const lista = filtro
      ? this.contactos.filter((c) => c.includes(filtro))
      : [...this.contactos];

    lista.sort((a, b) => {
      const aa = normalizar(a.apellido);
      const ab = normalizar(b.apellido);
      if (aa !== ab) return aa.localeCompare(ab);
      return normalizar(a.nombre).localeCompare(normalizar(b.nombre));
    });

    return lista;
  }
}

const datos = [
  { nombre: "Juan Daniel", apellido: "Morales", telefono: "381 555-1234", email: "juanmorales@gmail.com" },
  { nombre: "Lorena", apellido: "Paz", telefono: "381 555-2313", email: "lorenapaz@gmail.com" },
  { nombre: "Saúl", apellido: "Alanoca", telefono: "381 555-8363", email: "saulalanoca@gmail.com" },
  { nombre: "Saúl", apellido: "Sarmiento", telefono: "381 555-0982", email: "saulsarmiento@gmail.com" },
  { nombre: "Diego", apellido: "Díaz", telefono: "11-5555-8080", email: "diego.diaz@gmal.com" },
  { nombre: "Valentina", apellido: "Fernández", telefono: "11-5555-9090", email: "valen.fernandez@gmail.com" },
  { nombre: "María", apellido: "García", telefono: "11-5555-2020", email: "maria.garcia@gmail.com" },
  { nombre: "Sofía", apellido: "Gómez", telefono: "11-5555-7070", email: "sofia.gomez@gmail.com" },
  { nombre: "Ana", apellido: "López", telefono: "11-5555-4040", email: "ana.lopez@gmail.com" },
  { nombre: "Lucía", apellido: "Martínez", telefono: "11-5555-5050", email: "lucia.martinez@gmail.com" }
];

let agenda = new Agenda();
for (const d of datos) agenda.actualizar(new Contacto(d));
window.agenda = agenda; 
