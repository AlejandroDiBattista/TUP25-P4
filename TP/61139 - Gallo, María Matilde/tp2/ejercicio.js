(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const normalize = (str) =>
    (str ?? "")
      .toString()
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  class Contacto {
    constructor({ id, nombre, apellido, telefono, email }) {
      this.id = id;
      this.nombre = nombre;
      this.apellido = apellido;
      this.telefono = telefono;
      this.email = email;
    }
  }

  class Agenda {
    constructor() {
      this.contactos = [];
      this._nextId = 1;
    }
    _genId() {
      return String(this._nextId++);
    }
    agregar({ nombre, apellido, telefono, email }) {
      const c = new Contacto({
        id: this._genId(),
        nombre,
        apellido,
        telefono,
        email,
      });
      this.contactos.push(c);
      return c;
    }
    actualizar(id, datos) {
      const idx = this.contactos.findIndex((c) => c.id === id);
      if (idx === -1) return false;
      this.contactos[idx] = new Contacto({ id, ...datos });
      return true;
    }
    borrar(id) {
      const idx = this.contactos.findIndex((c) => c.id === id);
      if (idx === -1) return false;
      this.contactos.splice(idx, 1);
      return true;
    }
    listarOrdenado() {
      const arr = [...this.contactos];
      arr.sort((a, b) => {
        const ap = normalize(a.apellido);
        const bp = normalize(b.apellido);
        const an = normalize(a.nombre);
        const bn = normalize(b.nombre);
        if (ap !== bp) return ap.localeCompare(bp, "es");
        return an.localeCompare(bn, "es");
      });
      return arr;
    }
    filtrar(query) {
      const q = normalize(query);
      if (!q) return this.listarOrdenado();
      return this.listarOrdenado().filter((c) => {
        const blob = [c.nombre, c.apellido, c.telefono, c.email]
          .map(normalize)
          .join(" ");
        return blob.includes(q);
      });
    }
  }

  const agenda = new Agenda();

  const ui = {
    inputBuscar: $("#q"),
    btnAgregar: $("#btnAgregar"),
    contenedor: $("#cards"),
    dlg: $("#dlgContacto"),
    form: $("#frmContacto"),
    campoId: $("#contactoId"),
    campoNombre: $("#nombre"),
    campoApellido: $("#apellido"),
    campoTelefono: $("#telefono"),
    campoEmail: $("#email"),
    dlgTitulo: $("#dlgTitulo"),
    btnCancelar: $("#btnCancelar"),
  };

  function crearTarjeta(contacto) {
    const article = document.createElement("article");
    article.className = "card";
    article.dataset.id = contacto.id;

    const h3 = document.createElement("h3");
    h3.innerText = `${contacto.nombre} ${contacto.apellido}`;
    article.appendChild(h3);

    const info = document.createElement("div");
    info.className = "info";

    const filaTel = document.createElement("div");
    filaTel.className = "info-row";
    filaTel.innerHTML = `📞 ${contacto.telefono}`;
    info.appendChild(filaTel);

    const filaMail = document.createElement("div");
    filaMail.className = "info-row";
    filaMail.innerHTML = `✉️ ${contacto.email}`;
    info.appendChild(filaMail);

    article.appendChild(info);

    const actions = document.createElement("div");
    actions.className = "actions";

    // Botones con emojis
    const btnEdit = document.createElement("button");
    btnEdit.type = "button";
    btnEdit.className = "icon-btn";
    btnEdit.dataset.action = "edit";
    btnEdit.setAttribute("aria-label", `Editar ${contacto.nombre} ${contacto.apellido}`);
    btnEdit.textContent = "✏️";
    actions.appendChild(btnEdit);

    const btnDel = document.createElement("button");
    btnDel.type = "button";
    btnDel.className = "icon-btn";
    btnDel.dataset.action = "delete";
    btnDel.setAttribute("aria-label", `Borrar ${contacto.nombre} ${contacto.apellido}`);
    btnDel.textContent = "🗑️";
    actions.appendChild(btnDel);

    article.appendChild(actions);
    return article;
  }

  function render() {
    const q = ui.inputBuscar.value;
    const lista = agenda.filtrar(q);
    ui.contenedor.innerHTML = "";
    const frag = document.createDocumentFragment();
    lista.forEach((c) => frag.appendChild(crearTarjeta(c)));
    ui.contenedor.appendChild(frag);
  }

  function abrirDialogo(modo, contacto = null) {
    ui.form.reset();
    ui.campoId.value = contacto?.id ?? "";
    ui.campoNombre.value = contacto?.nombre ?? "";
    ui.campoApellido.value = contacto?.apellido ?? "";
    ui.campoTelefono.value = contacto?.telefono ?? "";
    ui.campoEmail.value = contacto?.email ?? "";
    ui.dlgTitulo.textContent = modo === "add" ? "Agregar contacto" : "Editar contacto";
    ui.dlg.showModal();
    ui.campoNombre.focus();
  }

  function leerFormulario() {
    return {
      nombre: ui.campoNombre.value.trim(),
      apellido: ui.campoApellido.value.trim(),
      telefono: ui.campoTelefono.value.trim(),
      email: ui.campoEmail.value.trim(),
    };
  }

  function seed() {
    const datos = [
      ["Matilde", "Gallo", "11-5555-1010", "matilde.gallo@gmail.com"],
      ["Laura", "Gerez", "11-5555-2020", "laura.gerez@gmail.com"],
      ["Julieta", "Marquez", "11-5555-3030", "julieta.marquez@gmail.com"],
      ["Carlos", "Gallo", "11-5555-4040", "carlos.gallo@gmail.com"],
      ["Justino", "Valdés", "11-5555-5050", "justino.valdes@gmail.com"],
      ["Eloísa", "Moreno", "11-5555-6060", "eloisa.moreno@gmail.com"],
      ["Vicente", "Roldán", "11-5555-7070", "vicente.roldan@gmail.com"],
      ["Camila", "Suárez", "11-5555-8080", "camila.suarez@gmail.com"],
      ["Ramiro", "Torres", "11-5555-9090", "ramiro.torres@gmail.com"],
      ["Aitana", "Domínguez", "11-5555-1111", "aitana.dominguez@gmail.com"],
    ];
    datos.forEach(([n, a, t, e]) =>
      agenda.agregar({ nombre: n, apellido: a, telefono: t, email: e })
    );
  }

  // Eventos
  ui.inputBuscar.addEventListener("input", render);
  ui.btnAgregar.addEventListener("click", () => abrirDialogo("add"));
  ui.btnCancelar.addEventListener("click", () => ui.dlg.close());
  ui.form.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const datos = leerFormulario();
    const id = ui.campoId.value;
    if (id) {
      agenda.actualizar(id, datos);
    } else {
      agenda.agregar(datos);
    }
    ui.dlg.close();
    render();
  });
  ui.contenedor.addEventListener("click", (ev) => {
    const btn = ev.target.closest("button[data-action]");
    if (!btn) return;
    const card = btn.closest(".card");
    const id = card?.dataset.id;
    if (!id) return;
    if (btn.dataset.action === "edit") {
      const c = agenda.contactos.find((x) => x.id === id);
      if (c) abrirDialogo("edit", c);
    } else if (btn.dataset.action === "delete") {
      agenda.borrar(id);
      render();
    }
  });

  // Inicio
  seed();
  render();
})();
