# JavaScript en HTML: Haciendo tu página web interactiva

## ¿Qué es JavaScript en una página web?

JavaScript (JS) es el lenguaje de programación del navegador.
Se usa para que una página no sea estática (solo texto y estilos), sino interactiva y dinámica.

Si el HTML define la estructura (qué aparece) y el CSS define el estilo (cómo se ve), JavaScript define el comportamiento (qué pasa cuando el usuario interactúa).

### ⚡ Usos principales de JavaScript en una web

#### 1. Interactividad

Permite responder a las acciones del usuario:
- Hacer clic en un botón y mostrar un mensaje.
- Validar formularios antes de enviarlos.
- Mostrar u ocultar elementos dinámicamente.

**👉 Ejemplo de interactividad:**

```html
<button onclick="alert('¡Hola!')">Haz clic</button>
```

#### 2. Manipulación del DOM

El DOM (Document Object Model) es la representación de la página.
JS puede modificarlo en tiempo real:
- Cambiar texto o imágenes.
- Agregar o quitar elementos.
- Alterar clases y estilos.

**👉 Ejemplo de manipulación del DOM:**

```html
<p id="mensaje">Texto original</p>
<script>
  document.getElementById("mensaje").textContent = "Texto cambiado con JS";
</script>
```

#### 3. Comunicación con el servidor

JS permite traer o enviar datos sin recargar la página (AJAX / Fetch / APIs).
Esto hace posibles aplicaciones web modernas como Gmail, WhatsApp Web o Google Maps.

**👉 Ejemplo de comunicación con servidor (fetch):**

```js
fetch("https://api.example.com/data")
  .then(res => res.json())
  .then(data => console.log(data));
```

#### 4. Aplicaciones completas en el navegador

Con frameworks modernos (React, Angular, Vue), JS se usa para construir Single Page Applications (SPA) que funcionan casi como apps de escritorio o móviles.

**🧩 En resumen:**
- HTML → estructura.
- CSS → diseño.
- JavaScript → interacción, lógica y dinamismo.

Sin JavaScript, la web sería como un folleto digital; con JavaScript, se convierte en una aplicación interactiva.

**👉 Ejemplo de aplicación completa:**

```html
<!DOCTYPE html>
<html lang="es">
<head><!-- Meta etiquetas y título --></head>
<body>
  <div class="card">
    <h2>¡Bienvenido!</h2>
    <p>Haz clic en el botón para ver la magia ✨</p>
    <button onclick="mostrarMensaje()">Haz clic aquí</button>
    <p id="mensaje"></p>
  </div>
  <script>
    function mostrarMensaje() {
      document.getElementById("mensaje").textContent = "¡Hola! Esto fue agregado con JavaScript 🎉";
    }
  </script>
</body>
</html>
```

### Eventos en JavaScript: Haciendo tu página interactiva

#### 🔹 1. ¿Qué es un evento?

Un evento es cualquier acción que ocurre en la página:
- Clic en un botón
- Movimiento del mouse
- Presionar una tecla
- Cargar la página
- Enviar un formulario

El navegador detecta esas acciones y te permite responder con código JavaScript.

#### 🔹 2. Formas de gestionar eventos

✅ a) Atributo HTML (inline)

Se escribe directamente en la etiqueta.

**👉 Ejemplo inline (atributo HTML):**
```html
<button onclick="alert('¡Hola!')">Haz clic</button>
```

📌 Simple, pero poco recomendable en proyectos grandes porque mezcla HTML con lógica.

✅ b) Propiedades del DOM

Asignamos una función a una propiedad del elemento.

**👉 Ejemplo usando propiedades del DOM:**
```html
<button id="miBoton">Haz clic</button>
<script>
  const btn = document.getElementById("miBoton");
  btn.onclick = () => {
    alert("Hola desde propiedades del DOM");
  };
</script>
```

📌 Mejor que inline, pero cada propiedad solo puede tener un evento asignado.

✅ c) addEventListener (la forma recomendada)

Permite añadir múltiples funciones al mismo evento y quitarlas si hace falta.

**👉 Ejemplo con addEventListener:**
```html
<button id="miBoton">Haz clic</button>
<script>
  const btn = document.getElementById("miBoton");

  // Escuchar el evento
  btn.addEventListener("click", () => {
    alert("Hola con addEventListener 🎉");
  });

  // Otro evento en el mismo botón
  btn.addEventListener("mouseover", () => {
    console.log("El mouse pasó por encima");
  });
</script>
``` 

📌 Esta es la mejor práctica moderna: limpio, flexible y desacoplado del HTML.

#### 🔹 3. Flujo de los eventos: Event Bubbling y Capturing

Cuando ocurre un evento, no solo afecta al elemento directo. Se propaga por el árbol del DOM:
- Capturing (fase de captura): el evento baja desde document hasta el elemento.
- Target: llega al elemento exacto.
- Bubbling (fase de burbujeo): el evento vuelve a subir hacia document.

**👉 Ejemplo de bubbling:**
```html
<div id="contenedor">
  <button id="btn">Haz clic aquí</button>
</div>
<script>
  document.getElementById("contenedor")
    .addEventListener("click", () => console.log("Contenedor clicado"));

  document.getElementById("btn")
    .addEventListener("click", () => console.log("Botón clicado"));
</script>
```

Si haces clic en el botón, primero se ejecuta el del botón y luego el del contenedor.

#### 🔹 4. Objeto event

Cuando manejas un evento, JS te pasa un objeto con información útil:

**👉 Ejemplo (demostración):**
```js
btn.addEventListener("click", (event) => {
  console.log(event.type);   // "click"
  console.log(event.target); // Elemento clicado
});
```

**🧩 En resumen**
- Los eventos permiten hacer páginas dinámicas e interactivas.
- Se pueden gestionar de varias formas, siendo addEventListener la mejor práctica.
- Los eventos se propagan en el DOM (captura → target → burbuja).
- El objeto event da contexto sobre lo ocurrido.

### Construyendo el DOM con funciones vs innerHTML

Cuando usamos innerHTML, estamos insertando un bloque de texto HTML directamente dentro de un elemento. Es rápido, pero tiene limitaciones y riesgos (por ejemplo: inyección de código si no se controla el contenido).

En cambio, construir el DOM con funciones significa usar las APIs nativas de JavaScript para crear y conectar nodos uno por uno. Esto es más seguro, más flexible y da control total sobre cada nodo.

**👉 Ejemplo con innerHTML**

```html
<div id="contenedor"></div>

<script>
  const contenedor = document.getElementById("contenedor");
  contenedor.innerHTML = `
    <h2>Formulario</h2>
    <input type="text" placeholder="Tu nombre">
    <button>Enviar</button>
  `;
</script>
```

**👉 Ejemplo creando el DOM con funciones**

```html
<div id="contenedor"></div>
<script>
  const contenedor = document.getElementById("contenedor");

  // Crear elementos
  const titulo = document.createElement("h2");
  titulo.textContent = "Formulario";

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Tu nombre";

  const boton = document.createElement("button");
  boton.textContent = "Enviar";

  // Insertar al DOM
  contenedor.appendChild(titulo);
  contenedor.appendChild(input);
  contenedor.appendChild(boton);

  // Agregar evento al botón
  boton.addEventListener("click", () => {
    alert("Nombre: " + input.value);
  });
</script>
```
Esto parece más verboso, pero es mucho más seguro y flexible.
Con una pequeña función podés hacer más fácil crear los componentes:

```js
function tag(tipo, props = {}, ...hijos) {
  const elem = document.createElement(tipo);
  Object.entries(props).forEach(([key, value]) => {
    if (key.startsWith("on") && typeof value === "function") {
      elem.addEventListener(key.slice(2).toLowerCase(), value);
    } else {
      elem[key] = value;
    }
  });
  hijos.forEach(hijo => {
    if (typeof hijo === "string") {
      elem.appendChild(document.createTextNode(hijo));
    } else {
      elem.appendChild(hijo);
    }
  });
  return elem;
}

function agregar(padre, ...hijos) {
  hijos.forEach(hijo => padre.appendChild(hijo));
  return padre;
}

let $ = document.getElementById;
```

Ahora con esta función se puede escribir el mismo formulario de forma más sencilla:

```js
const contenedor = $("contenedor");

const titulo = tag("h2", {}, "Formulario");
const input  = tag("input", { type: "text", placeholder: "Tu nombre" });
const boton  = tag("button", { onClick: () => alert("Nombre: " + input.value) }, "Enviar");  

agregar(contenedor, titulo, input, boton);
```

O incluso más compacto si aprovechas llamadas de funciones dentro de funciones:

```js
agregar($("contenedor"), 
    tag("h2", {}, "Formulario"),
    tag("input",  { type: "text", placeholder: "Tu nombre" }),
    tag("button", { onClick: () => alert("Nombre: " + input.value) }, "Enviar")
);
```

Incluso se pueden crear ahora componentes más complejos:

```html
<form onSubmit="handleSubmit(event)">
  <h2>Formulario</h2>
  <label> Nombre:
    <input type="text" placeholder="Tu nombre" name="nombre">
  </label>
  <label> Apellido:
    <input type="text" placeholder="Tu apellido" name="apellido">
  </label>
  <label> Email:
    <input type="email" placeholder="Tu email" name="email">
  </label>
  <button onClick="alert('Formulario enviado!')">Enviar</button>
  <button onClick="alert('Cancelar!')">Cancelar</button>
</form>
```

Se puede traducir a:
```js
// Traducción directa
//     <button     onClick =      "alert('Formulario enviado!')">  Enviar</button>
// tag("button", { onClick : () => alert('Formulario enviado!')}, "Enviar")

tag("form", { onSubmit: handleSubmit },
    tag("h2", {}, "Formulario"),
    tag("label", {}, "Nombre:",
        tag("input", { type: "text", placeholder: "Tu nombre", name: "nombre" })
    ),
    tag("label", {}, "Apellido:",
        tag("input", { type: "text", placeholder: "Tu apellido", name: "apellido" })
    ),
    tag("label", {}, "Email:",
        tag("input", { type: "email", placeholder: "Tu email", name: "email" })
    ),
    tag("button", { onClick: () => alert('Formulario enviado!') }, "Enviar"),
    tag("button", { onClick: () => alert('Cancelar!') }, "Cancelar")
);
```

Y con un poco de ayuda podemos crear 'componentes' reutilizables:

```js
function Input(type, placeholder, name) {
    let label = name.charAt(0).toUpperCase() + name.slice(1) + ": ";
    return tag("label", {}, 
        label,
        tag("input", { type, placeholder, name })
    );
}

function Button(text, onClick) {
    return tag("button", { onClick }, text);
}

agregar($("contenedor"), 
    tag("form", { onSubmit: handleSubmit },
        tag("h2", {}, "Formulario"),
        Input("text",  "Tu nombre", "nombre"),
        Input("text",  "Tu apellido", "apellido"),
        Input("email", "Tu email",  "email"),
        Button("Enviar",   () => alert('Formulario enviado!')),
        Button("Cancelar", () => alert('Cancelar!'))
    )
);
```

### Edición de un formulario completo

Si tenemos este formulario en HTML:
```html
<form id="miFormulario" onSubmit="handleSubmit(event)">
  <h2>Formulario</h2>
  <label> Nombre:
    <input type="text" placeholder="Tu nombre" name="nombre">
  </label>
  <label> Apellido:
    <input type="text" placeholder="Tu apellido" name="apellido">
  </label>
  <label> Email:
    <input type="email" placeholder="Tu email" name="email">
  </label>
  <button type="submit">Enviar</button>
</form>
```

Podemos cargar el formulario desde un JSON:
```js
const datos = {
  nombre: "Juan",
  apellido: "Pérez",
  email: "juan.perez@example.com"
};

const formulario = $("miFormulario");

// Asignar los datos a un formulario
formulario.nombre.value   = datos.nombre;
formulario.apellido.value = datos.apellido;
formulario.email.value    = datos.email;

// O para leer los datos
datos = {
  nombre:   formulario.nombre.value,
  apellido: formulario.apellido.value,
  email:    formulario.email.value
};
```   

O lo generalizamos con estas funciones:

```js
function ponerDatos(form, datos){
  for(nombre in datos){
    form[nombre].value = datos[nombre];
  }
}

function sacarDatos(form){
  const datos = {};
  for({name, value} of form.elements){
      datos[name] = value;
  }
  return datos;
}

// Y ahora el uso es simple
ponerDatos(formulario, datos);
datos = sacarDatos(formulario);

```
**👉 En resumen:**
	•	innerHTML es como pegar un bloque de texto HTML “ya cocinado”.
	•	document.createElement + appendChild es como armar el HTML “pieza por pieza” en tiempo real.

// y ahora el uso es simple
ponerDatos(formulario, datos);
datos = sacarDatos(formulario);

```
**👉 En resumen:**
	•	innerHTML es como pegar un bloque de texto HTML “ya cocinado”.
	•	document.createElement + appendChild es como armar el HTML “pieza por pieza” en tiempo real.

