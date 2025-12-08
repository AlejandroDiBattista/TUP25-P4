'use strict';
// Funciones generales
(function () {
  function normalizar(texto) {
    if (!texto) {
      return '';
    }
    var s = String(texto);
    s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return s.toLowerCase();
  }

  class Contacto {
    constructor(id, nombre, apellido, telefono, email) {
      this.id = id;
      this.nombre = (nombre || '').trim();
      this.apellido = (apellido || '').trim();
      this.telefono = (telefono || '').trim();
      this.email = (email || '').trim();
    }
  }

  class Agenda {
    constructor() {
      this.items = [];
      this.ultimoId = 0;
    }

    nuevoId() {
      this.ultimoId = this.ultimoId + 1;
      return this.ultimoId;
    }

    agregar(data) {
      var c = new Contacto(
        this.nuevoId(),
        data && data.nombre,
        data && data.apellido,
        data && data.telefono,
        data && data.email
      );
      this.items.push(c);
      return c;
    }

    actualizar(id, data) {
      var i;
      for (i = 0; i < this.items.length; i = i + 1) {
        if (this.items[i].id === id) {
          if (data && typeof data.nombre === 'string') this.items[i].nombre = data.nombre.trim();
          if (data && typeof data.apellido === 'string') this.items[i].apellido = data.apellido.trim();
          if (data && typeof data.telefono === 'string') this.items[i].telefono = data.telefono.trim();
          if (data && typeof data.email === 'string') this.items[i].email = data.email.trim();
          return this.items[i];
        }
      }
      return null;
    }

    borrar(id) {
      var i;
      for (i = 0; i < this.items.length; i = i + 1) {
        if (this.items[i].id === id) {
          this.items.splice(i, 1);
          return true;
        }
      }
      return false;
    }

    comparar(a, b) {
      var apA = normalizar(a.apellido);
      var apB = normalizar(b.apellido);
      if (apA < apB) return -1;
      if (apA > apB) return 1;
      var nA = normalizar(a.nombre);
      var nB = normalizar(b.nombre);
      if (nA < nB) return -1;
      if (nA > nB) return 1;
      return 0;
    }

    listar(filtro) {
      var f = normalizar(filtro || '');
      var i;
      var resultado = [];
      for (i = 0; i < this.items.length; i = i + 1) {
        var c = this.items[i];
        if (f === '') {
          resultado.push(c);
        } else {
          var texto = c.nombre + ' ' + c.apellido + ' ' + c.telefono + ' ' + c.email;
          if (normalizar(texto).indexOf(f) !== -1) {
            resultado.push(c);
          }
        }
      }
      resultado.sort(this.comparar.bind(this));
      return resultado;
    }
  }

  var contactosEjemplo = [
    { nombre: 'Juan', apellido: 'Molina', telefono: '381-6443413', email: 'juan.molina@gmail.com' },
    { nombre: 'Maria', apellido: 'Gomez', telefono: '351-7890123', email: 'maria.gomez@gmail.com' },
    { nombre: 'Luis', apellido: 'Fernandez', telefono: '351-1234567', email: 'luis.fernandez@gmail.com' },
    { nombre: 'Ana', apellido: 'Martinez', telefono: '351-5554444', email: 'ana.martinez@gmail.com' },
    { nombre: 'Sofia', apellido: 'Diaz', telefono: '351-5555555', email: 'sofia.diaz@gmail.com' },
    { nombre: 'Carlos', apellido: 'Lopez', telefono: '351-5556666', email: 'carlos.lopez@gmail.com' },
    { nombre: 'Lucia', apellido: 'Sosa', telefono: '351-5557777', email: 'lucia.sosa@gmail.com' },
    { nombre: 'Mateo', apellido: 'Rodriguez', telefono: '351-5558888', email: 'mateo.rodriguez@gmail.com' },
    { nombre: 'Valentina', apellido: 'Suarez', telefono: '351-5559999', email: 'valentina.suarez@gmail.com' },
    { nombre: 'Diego', apellido: 'Castro', telefono: '351-5550000', email: 'diego.castro@gmail.com' }
  ];

  document.addEventListener('DOMContentLoaded', function () {
    var $buscador = document.getElementById('buscador');
    var $listado = document.getElementById('listado');
    var $tpl = document.getElementById('card-template');
    var $btnAgregar = document.getElementById('btn-agregar');
    var $dialog = document.getElementById('dialogo-contacto');
    var $tituloDialogo = document.getElementById('dialogo-titulo');
    var $form = document.getElementById('form-contacto');
    var $id = document.getElementById('contacto-id');
    var $nombre = document.getElementById('contacto-nombre');
    var $apellido = document.getElementById('contacto-apellido');
    var $telefono = document.getElementById('contacto-telefono');
    var $email = document.getElementById('contacto-email');
    var $btnCancelar = document.getElementById('btn-cancelar');

    var agenda = new Agenda();
    var i;
    for (i = 0; i < contactosEjemplo.length; i = i + 1) {
      agenda.agregar(contactosEjemplo[i]);
    }

    function limpiarFormulario() {
      $id.value = '';
      $nombre.value = '';
      $apellido.value = '';
      $telefono.value = '';
      $email.value = '';
    }

    function abrirDialogo(titulo) {
      if (!titulo) {
        titulo = 'Nuevo contacto';
      }
      $tituloDialogo.textContent = titulo;
      if ($dialog && typeof $dialog.showModal === 'function') {
        $dialog.showModal();
      } else {
        $dialog.setAttribute('open', '');
      }
    }

    function cerrarDialogo() {
      if ($dialog && typeof $dialog.close === 'function') {
        $dialog.close();
      } else {
        $dialog.removeAttribute('open');
      }
    }

    // Nueva plantilla basada en template HTML
    function plantillaCardDesdeTemplate(c) {
      var frag = document.importNode($tpl.content, true);
      var $article = frag.querySelector('article');
      var $titulo = frag.querySelector('.card-title');
      var $body = frag.querySelector('.card-body');

      if ($article) $article.setAttribute('data-id', String(c.id));
      if ($titulo) $titulo.textContent = c.apellido + ', ' + c.nombre;

      if ($body) {
        $body.innerHTML = '';
        if (c.telefono) {
          var liTel = document.createElement('li');
          var smTel = document.createElement('small');
          smTel.textContent = 'Tel: ' + c.telefono;
          liTel.appendChild(smTel);
          $body.appendChild(liTel);
        }
        if (c.email) {
          var liMail = document.createElement('li');
          var smMail = document.createElement('small');
          smMail.textContent = 'Email: ' + c.email;
          liMail.appendChild(smMail);
          $body.appendChild(liMail);
        }
      }

      return frag;
    }

    function plantillaCard(c) {
      var titulo = c.apellido + ', ' + c.nombre;
      var tel = c.telefono ? ('<li><small>📞 ' + c.telefono + '</small></li>') : '';
      var mail = c.email ? ('<li><small>✉️ ' + c.email + '</small></li>') : '';
      var html = '';
      html += '<article class="card" data-id="' + c.id + '">';
      html += '  <header class="card-header">';
      html += '    <strong>' + titulo + '</strong>';
      html += '    <span class="acciones">';
      html += '      <button class="icono editar" data-accion="editar" title="Editar contacto" aria-label="Editar">✏️</button>';
      html += '      <button class="icono borrar" data-accion="borrar" title="Borrar contacto" aria-label="Borrar">🗑️</button>';
      html += '    </span>';
      html += '  </header>';
      html += '  <ul class="card-body">' + tel + mail + '</ul>';
      html += '</article>';
      return html;
    }

    function render() {
      var texto = $buscador && $buscador.value ? $buscador.value : '';
      var datos = agenda.listar(texto);
      $listado.innerHTML = '';
      if (!datos || datos.length === 0) {
        $listado.innerHTML = '<p><em>No hay contactos para mostrar.</em></p>';
        return;
      }
      var i;
      for (i = 0; i < datos.length; i = i + 1) {
        $listado.appendChild(plantillaCardDesdeTemplate(datos[i]));
      }
    }

    $buscador.addEventListener('input', function () {
      render();
    });

    $btnAgregar.addEventListener('click', function () {
      limpiarFormulario();
      abrirDialogo('Nuevo contacto');
      $nombre.focus();
    });

    $btnCancelar.addEventListener('click', function () {
      cerrarDialogo();
    });

    $form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = {
        nombre: ($nombre.value || '').trim(),
        apellido: ($apellido.value || '').trim(),
        telefono: ($telefono.value || '').trim(),
        email: ($email.value || '').trim()
      };
      if (!data.nombre || !data.apellido) {
        return;
      }
      var idExistente = $id.value ? Number($id.value) : 0;
      if (idExistente) {
        agenda.actualizar(idExistente, data);
      } else {
        agenda.agregar(data);
      }
      cerrarDialogo();
      render();
    });

    $listado.addEventListener('click', function (e) {
      var btn = e.target;
      while (btn && btn !== document && (!btn.getAttribute || !btn.getAttribute('data-accion'))) {
        btn = btn.parentNode;
      }
      if (!btn || btn === document) {
        return;
      }
      var card = btn;
      while (card && card !== document && (!card.getAttribute || !card.getAttribute('data-id'))) {
        card = card.parentNode;
      }
      if (!card || card === document) {
        return;
      }
      var id = Number(card.getAttribute('data-id'));
      var accion = btn.getAttribute('data-accion');
      if (accion === 'borrar') {
        agenda.borrar(id);
        render();
        return;
      }
      if (accion === 'editar') {
        var c = null;
        var i;
        for (i = 0; i < agenda.items.length; i = i + 1) {
          if (agenda.items[i].id === id) {
            c = agenda.items[i];
            break;
          }
        }
        if (!c) {
          return;
        }
        $id.value = c.id;
        $nombre.value = c.nombre;
        $apellido.value = c.apellido;
        $telefono.value = c.telefono;
        $email.value = c.email;
        abrirDialogo('Editar contacto');
        $nombre.focus();
      }
    });

    render();
  });
})();
