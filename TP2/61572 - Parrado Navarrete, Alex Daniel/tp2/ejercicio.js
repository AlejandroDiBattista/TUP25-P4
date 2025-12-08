(() => {
  class Contacto {
    constructor({id, nombre, apellido, telefono, email}) {
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
      this.idActual = 1;
    }
    agregar(contacto) {
      contacto.id = this.idActual++;
      this.contactos.push(contacto);
    }
    actualizar(id, datos) {
      const idx = this.contactos.findIndex(c => c.id === id);
      if (idx !== -1) this.contactos[idx] = {...this.contactos[idx], ...datos};
    }
    borrar(id) {
      this.contactos = this.contactos.filter(c => c.id !== id);
    }
    buscar(texto) {
      if (!texto) return [...this.contactos];
      const norm = Agenda.normalizar(texto);
      return this.contactos.filter(c => {
        return [c.nombre, c.apellido, c.telefono, c.email]
          .map(Agenda.normalizar)
          .some(val => val.includes(norm));
      });
    }
    static normalizar(str) {
      return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    }
    ordenados(lista) {
      return [...lista].sort((a, b) => {
        const apA = Agenda.normalizar(a.apellido), apB = Agenda.normalizar(b.apellido);
        if (apA !== apB) return apA.localeCompare(apB);
        return Agenda.normalizar(a.nombre).localeCompare(Agenda.normalizar(b.nombre));
      });
    }
  }

  // Datos de ejemplo
  const ejemplos = [
    {nombre:"Ana",apellido:"García",telefono:"111-111",email:"ana@gmail.com"},
    {nombre:"Luis",apellido:"Pérez",telefono:"222-222",email:"luis@gmail.com"},
    {nombre:"María",apellido:"López",telefono:"333-333",email:"maria@gmail.com"},
    {nombre:"Juan",apellido:"Martínez",telefono:"444-444",email:"juan@gmail.com"},
    {nombre:"Sofía",apellido:"Rodríguez",telefono:"555-555",email:"sofia@gmail.com"},
    {nombre:"Carlos",apellido:"Gómez",telefono:"666-666",email:"carlos@gmail.com"},
    {nombre:"Lucía",apellido:"Fernández",telefono:"777-777",email:"lucia@gmail.com"},
    {nombre:"Pedro",apellido:"Díaz",telefono:"888-888",email:"pedro@gmail.com"},
    {nombre:"Valentina",apellido:"Torres",telefono:"999-999",email:"valentina@gmail.com"},
    {nombre:"Mateo",apellido:"Ramírez",telefono:"101-010",email:"mateo@gmail.com"}
  ];

  const agenda = new Agenda();
  ejemplos.forEach(e => agenda.agregar(new Contacto(e)));
  let contactoEditando = null;

  // Elementos DOM
  const listaContactos = document.getElementById("listaContactos");
  const buscador = document.getElementById("buscador");
  const btnAgregar = document.getElementById("btnAgregar");
  const modal = document.getElementById("modalContacto");
  const modalTitulo = document.getElementById("modalTitulo");
  const form = document.getElementById("formContacto");
  const btnCancelar = document.getElementById("btnCancelar");
  const nombre = document.getElementById("nombre");
  const apellido = document.getElementById("apellido");
  const telefono = document.getElementById("telefono");
  const email = document.getElementById("email");

  function render() {
    const texto = buscador.value;
    const filtrados = agenda.ordenados(agenda.buscar(texto));
    listaContactos.innerHTML = "";
    if (filtrados.length === 0) {
      listaContactos.innerHTML = "<p>No hay contactos.</p>";
      return;
    }
    filtrados.forEach(c => {
      const card = document.createElement("div");
      card.className = "card-contacto";
      card.innerHTML = `
        <div class="card-info">
          <span class="card-nombre">${c.nombre} ${c.apellido}</span><br>
          <small>📞 ${c.telefono} | ✉️ ${c.email}</small>
        </div>
        <div class="card-actions">
          <button title="Editar" data-id="${c.id}" class="btn-editar">✏️</button>
          <button title="Borrar" data-id="${c.id}" class="btn-borrar">🗑️</button>
        </div>
      `;
      listaContactos.appendChild(card);
    });
    listaContactos.querySelectorAll(".btn-editar").forEach(btn => {
      btn.onclick = () => abrirModalEdicion(+btn.dataset.id);
    });
    listaContactos.querySelectorAll(".btn-borrar").forEach(btn => {
      btn.onclick = () => { agenda.borrar(+btn.dataset.id); render(); };
    });
  }

  function abrirModalAlta() {
    contactoEditando = null;
    modalTitulo.textContent = "Nuevo contacto";
    form.reset();
    modal.showModal();
  }
  function abrirModalEdicion(id) {
    const c = agenda.contactos.find(c => c.id === id);
    if (!c) return;
    contactoEditando = c;
    modalTitulo.textContent = "Editar contacto";
    nombre.value = c.nombre;
    apellido.value = c.apellido;
    telefono.value = c.telefono;
    email.value = c.email;
    modal.showModal();
  }
  btnAgregar.onclick = abrirModalAlta;
  btnCancelar.onclick = () => modal.close();

  form.onsubmit = e => {
    e.preventDefault();
    const datos = {
      nombre: nombre.value.trim(),
      apellido: apellido.value.trim(),
      telefono: telefono.value.trim(),
      email: email.value.trim()
    };
    if (contactoEditando) {
      agenda.actualizar(contactoEditando.id, datos);
    } else {
      agenda.agregar(new Contacto(datos));
    }
    modal.close();
    render();
  };

  buscador.oninput = render;
  render();
})();