import {prompt, read, write} from './io.js';

class Contacto {
  constructor({nombre, apellido, edad, id, email, telefono}){
    this.nombre = nombre;
    this.apellido = apellido;
    this.edad = edad;
    this.id = id;
    this.email = email;
    this.telefono = telefono;
  }

  get nombreCompleto(){
    return `${this.nombre} ${this.apellido}`;
  }
}

class Agenda {
  constructor(origen ="./agenda.json"){
    this.contactos = [];
    this.origen = origen;
    this.lastId = 0;
  }

  static comprobarPorApellidoNombre(a, b) {
    const cmpApellido = a.apellido.localeCompare(b.apellido, "es", {sensitivity: "base"});
    if (cmpApellido !== 0) return cmpApellido;
    return a.nombre.localeCompare(b.nombre, "es", {sensitivity: "base"});
  }

  async cargar(){
    try{
      const raw = await read(this.origen);
      const json = JSON.parse(raw);
      this.lastId = Number(json.lastId) || 0;
      this.contactos = Array.isArray(json.contactos) ? json.contactos.map((c) => new Contacto(c)) : [];
    } catch{
      this.lastId = 0;
      this.contactos = [];
      await this.guardar();
    }
  }

async guardar(){
  const payload = { lastId: this.lastId, contactos: this.contactos };
  await write(JSON.stringify(payload, null, 2), this.origen);
}

  siguienteId(){
    this.lastId += 1;
    return this.lastId;
  }

  async agregar({nombre, apellido, edad, email, telefono}){
    const id = this.siguienteId();
    const contacto = new Contacto({id, nombre, apellido, edad, email, telefono});
    this.contactos.push(contacto);
    await this.guardar();
    return contacto;
  }

  listar(){
    return [...this.contactos].sort(Agenda.comprobarPorApellidoNombre);
  }

  buscar(query){
    const q = String(query).toLowerCase();
    return this.listar().filter((c) => {
      return (
        c.nombre.toLowerCase().includes(q) ||
        c.apellido.toLowerCase().includes(q) ||
        String(c.edad).includes(q) ||
        c.telefono.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
      );
    });
  }

  obtenerPorId(id){
    const n = Number(id);
    if (!Number.isInteger(n)) return null;
    return this.contactos.find((c) => c.id === n) || null;
  }

  async editar(id, parciales){
    const contacto = this.obtenerPorId(id);
    if (!contacto) return null;
    const campos = ["nombre", "apellido", "edad", "email", "telefono"];
    for (const k of campos) {
      if (Object.prototype.hasOwnProperty.call(parciales, k) && parciales[k] !== undefined && parciales[k] !== null) {
        contacto[k] = parciales[k];
      }
    }
    await this.guardar();
    return contacto;
  }

  async borrar(id){
    const idx = this.contactos.findIndex((c) => c.id === Number(id));
    if (idx === -1) return null;
    const [eliminado] = this.contactos.splice(idx, 1);
    await this.guardar();
    return eliminado || null;
  }
}

//VALIDACIONES

const Validators = {
  nonEmpty(label, v){
    if (String(v).trim() === "") throw new Error(`${label} no puede estar vacío`);
    return String(v).trim();
  },
  edad(v){
    const n = Number(v);
    if (!Number.isInteger(n) || n < 0 || n > 120) throw new Error("Edad invalida (0 a 120)");
    return n;
  },
  telefono(v){
    const s = String(v).trim();
    if (!/^\+?[0-9\s-]{6,20}$/.test(s)) throw new Error("telefono invalido");
    return s.replace(/\s+/g, " ");
  },
  email(v){
    const s = String(v).trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) throw new Error("email invalido");
    return s;
  },
};

class App {
  constructor(){
    this.agenda = new Agenda();
  }

  async run(){
    await this.agenda.cargar();
    let salir = false;
    while (!salir){
      console.clear();
      console.log("=== Agenda de contactos ===");
      console.log("1. Listar");
      console.log("2. Agregar");
      console.log("3. Editar");
      console.log("4. Borrar");
      console.log("5. Buscar");
      console.log("0. Salir");

      const op = await prompt("Seleccione una opcion: ");
      try{
        switch (op){
          case "1":
            await this.opListar();
            break;
          case "2":
            await this.opAgregar();
            break;
          case "3":
            await this.opEditar();
            break;
          case "4":
            await this.opBorrar();
            break;
          case "5":
            await this.opBuscar();
            break;
          case "0":
            salir = true;
            break;
          default:
            console.log("\nOpción inválida.");
            await this.pause();
        }
      } catch (e){
        console.log(`\n[Error] ${e.message}`);
        await this.pause();
      }
    }
  }

  async pause(){
    await prompt("Presione Enter para continuar...");
  }

  printTable(rows){
    if (rows.length === 0){
      console.log("(Vacia)");
      return;
    }
    const headers = Object.keys(rows[0]);
    const widths = headers.map((h) => Math.max(h.length, ...rows.map((r)=> String(r[h]).length)));
    const line = (row) => headers.map((h, i) => String(row[h]).padEnd(widths[i])).join("  ");

    console.log(line(headers.reduce((acc, h) => ({...acc, [h]:h}),{})));
    console.log(widths.map((w) => "-".repeat(w)).join("  "));
    for (const r of rows) console.log(line(r));
  }

  async opListar(){
    console.log("\n-----\n");
    console.log("=== Listado de contactos ===");
    const row = this.agenda.listar().map((c)=> ({
      ID: String(c.id).padStart(3, "0"),
      "Nombre completo": c.nombreCompleto,
      "Edad": String(c.edad),
      "Telefono": String(c.telefono),
      "Email": String(c.email),
    }));
    this.printTable(row);
    await this.pause();
  }

  async opAgregar(){
    console.log("\n-----\n");
    console.log("=== Agregar contacto ===");
    const nombre = await this.pedirCampo("Nombre    :>", Validators.nonEmpty.bind(null, "Nombre"));
    const apellido = await this.pedirCampo("Apellido    :>", Validators.nonEmpty.bind(null, "Apellido"));
    const edad = await this.pedirCampo("Edad    :>", Validators.edad);
    const telefono = await this.pedirCampo("Telefono    :>", Validators.telefono);
    const email = await this.pedirCampo("Email    :>", Validators.email);

    await this.agenda.agregar({nombre, apellido, edad, telefono, email});
    await this.pause();
  }

  async opBuscar(){
    console.log("\n-----\n");
    console.log("=== Buscar contacto ===");
    const q = await prompt(" \nBuscar   :> ");
    const resultados = this.agenda.buscar(q).map((c) => ({
      ID : String(c.id).padStart(2, "0"),
      "Nombre completo": c.nombreCompleto,
      edad: String(c.edad),
      "Telefono": c.telefono,
      email: c.email,
    }));
    this.printTable(resultados);
    await this.pause();
  }

  async opBorrar(){
    console.log("\n-----\n");
    console.log("=== Borrar contacto ===");
    const idStr = await prompt("\nID contacto :> ");
    const c = this.agenda.obtenerPorId(Number(idStr));
    if (!c) throw new Error("Id inexistente ");

    console.log("\nBorrando...");
    const rows = [{
      ID: String(c.id).padStart(2, "0"),
      "Nombre completo": c.nombreCompleto,
      edad : String(c.edad),
      "Telefono": c.telefono,
      email: c.email,
    }];
    this.printTable(rows);

    const conf = (await prompt("\n¿Confirma borrado? :> S/N ")).toLowerCase();
    if (conf === "s") {
      await this.agenda.borrar(c.id);
      console.log("\nContacto borrado.");
    } else {
      console.log("\nAcción cancelada.");
    }
    await this.pause();
  }

  async opEditar(){
    console.log("\n-----\n");
    console.log("=== Editar contacto ===");

    const idStr = await prompt("\nID contacto :> ");
    const c = this.agenda.obtenerPorId(Number(idStr));
    if (!c) throw new Error("Id inexistente ");

    console.log("\n(Enter para dejar el valor actual)");

    const nombre = await this.pedirCampoOptional(`Nombre [${c.nombre}]   :> `, Validators.nonEmpty.bind(null, "Nombre"));
    const apellido = await this.pedirCampoOptional(`Apellido [${c.apellido}]   :> `, Validators.nonEmpty.bind(null, "Apellido"));
    const edad = await this.pedirCampoOptional(`Edad [${c.edad}]    :> `, Validators.edad);
    const telefono = await this.pedirCampoOptional(`Telefono [${c.telefono}]    :> `, Validators.telefono);
    const email = await this.pedirCampoOptional(`Email [${c.email}]    :> `, Validators.email);

    const actualizado = await this.agenda.editar(c.id, {
      nombre: nombre ?? c.nombre,
      apellido: apellido ?? c.apellido,
      edad: edad ?? c.edad,
      telefono: telefono ?? c.telefono,
      email: email ?? c.email,
    });

    console.log("\nContacto actualizado:");
    const rows = [{
      Id : String(actualizado.id).padStart(2, "0"),
      "Nombre completo": actualizado.nombreCompleto,
      edad : String(actualizado.edad),
      "Telefono": actualizado.telefono,
      email: actualizado.email,
    }];
    this.printTable(rows);

    await this.pause();
  }

  async pedirCampo(promptMsg, validator) {
    while (true) {
      const val = await prompt(promptMsg);
      try {
        return validator(val);
      } catch (e) {
        console.log(`[x] ${e.message}`);
      }
    }
  }

  async pedirCampoOptional(promptMsg, validator) {
    while (true) {
      const val = await prompt(promptMsg);
      if (val === "") return null;
      try {
        return validator(val);
      } catch (e) {
        console.log(`[x] ${e.message}`);
      }
    }
  }
}

// ==== Entrada ====

const app = new App();
app.run().catch((e) => {
  console.error("Error no controlado:", e);
  process.exit(1);
});
