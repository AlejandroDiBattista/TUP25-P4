'use strict';

class Contacto { 
  constructor(id, nombre, apellido, telefono, email){
    this.id = id;
    this.nombre = nombre;
    this.apellido = apellido;
    this.telefono = telefono;
    this.email = email;
  }
}

class Agenda {
  constructor() { this.contactos = []; }
  agregar(contacto) { this.contactos.push(contacto); }
  listar() { return this.contactos; }
  borrar(id) { this.contactos = this.contactos.filter(c => c.id !== id); }
  actualizar(id, nuevosDatos) {
    let c = this.contactos.find(c => c.id === id);
    if (c) {
      c.nombre = nuevosDatos.nombre ?? c.nombre;
      c.apellido = nuevosDatos.apellido ?? c.apellido;
      c.telefono = nuevosDatos.telefono ?? c.telefono;
      c.email = nuevosDatos.email ?? c.email;
    }
  }
}

let agenda = new Agenda();
agenda.agregar(new Contacto(1, "Lucía", "Martínez", "11-5555-5050", "lucia@example.com"));
agenda.agregar(new Contacto(2, "Diego", "Díaz", "11-5555-8080", "diego@example.com"));

function render(filtro="") {
  const div = document.getElementById("listaContactos");
  div.innerHTML = "";

  let lista = agenda.listar().filter(c => 
    (c.nombre + " " + c.apellido).toLowerCase().includes(filtro.toLowerCase())
  );

  for (let c of lista) {
    const card = document.createElement("article");
    card.classList.add("card");
    card.innerHTML = `
      <h3>${c.nombre} ${c.apellido}</h3>
      <p>📞 ${c.telefono}</p>
      <p>📧 ${c.email}</p>
      <footer>
        <button class="editar" data-id="${c.id}">✏️ Editar</button>
        <button class="borrar" data-id="${c.id}">🗑️ Borrar</button>
      </footer>
    `;
    div.appendChild(card);
  }

  document.querySelectorAll(".borrar").forEach(btn => {
    btn.addEventListener("click", e => {
      agenda.borrar(parseInt(e.target.dataset.id));
      render(document.getElementById("buscador").value);
    });
  });

  document.querySelectorAll(".editar").forEach(btn => {
    btn.addEventListener("click", e => {
      const id = parseInt(e.target.dataset.id);
      const c = agenda.listar().find(x => x.id === id);
      if (c) {
        document.getElementById("editId").value = c.id;
        document.getElementById("editNombre").value = c.nombre;
        document.getElementById("editApellido").value = c.apellido;
        document.getElementById("editTelefono").value = c.telefono;
        document.getElementById("editEmail").value = c.email;
        document.getElementById("formEditar").style.display = "block";
      }
    });
  });
}

document.getElementById("buscador").addEventListener("input", e => {
  render(e.target.value);
});

document.getElementById("btnMostrarAgregar").addEventListener("click", () => {
  document.getElementById("formAgregar").style.display = "block";
});
document.getElementById("cancelarAgregar").addEventListener("click", () => {
  document.getElementById("formAgregar").style.display = "none";
});

document.getElementById("formAgregar").addEventListener("submit", e => {
  e.preventDefault();
  const nuevoId = agenda.listar().length > 0 
    ? Math.max(...agenda.listar().map(c => c.id)) + 1 
    : 1;
  agenda.agregar(new Contacto(
    nuevoId,
    document.getElementById("nuevoNombre").value,
    document.getElementById("nuevoApellido").value,
    document.getElementById("nuevoTelefono").value,
    document.getElementById("nuevoEmail").value
  ));
  e.target.reset();
  document.getElementById("formAgregar").style.display = "none";
  render(document.getElementById("buscador").value);
});


document.getElementById("formEditar").addEventListener("submit", e => {
  e.preventDefault();
  const id = parseInt(document.getElementById("editId").value);
  agenda.actualizar(id, {
    nombre: document.getElementById("editNombre").value,
    apellido: document.getElementById("editApellido").value,
    telefono: document.getElementById("editTelefono").value,
    email: document.getElementById("editEmail").value
  });
  document.getElementById("formEditar").style.display = "none";
  render(document.getElementById("buscador").value);
});
document.getElementById("cancelarEdicion").addEventListener("click", () => {
  document.getElementById("formEditar").style.display = "none";
});


render();
