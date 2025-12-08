# HTML

Los lenguajes de marcado surgen para guardar información técnica.
Consisten en texto con el contenido y marcas para darle significado al texto. `meta` → Información sobre el formato de la página.

Un libro, por ejemplo, se podía guardar como
```xml
<LIBRO>
    <TITULO>
        Programacion en JS
    </TITULO>
    <CAPITULO>
        <TITULO>Que es JavaScript</TITULO>
        <CONTENIDO>
            JavaScript es un lenguaje para...
        </CONTENIDO>
    </CAPITULO>
    ...
</LIBRO>
```

Si a esto le asociamos una especificación de qué significa cada etiqueta, tenemos un estándar para guardar información.

El primero se llamó `GML` (General Markup Language), que luego evolucionó a `SGML`.

Cuando se creó la web, se tomó la base de los `SGML`, pero se limitó a un caso de uso: la especificación de una página web.

`HTML` entonces es un caso especial de los `SGML`, en donde las etiquetas están previamente definidas y tienen un significado específico.

```html
<html>
    <head></head>
    <body>
        <h1>Que es JS?</h1>
        <article>
            <p><b>JavaScript</b> es un lenguaje...</p>
            <p>Se usa para... </p>
        </article>
        ...
    </body>
</html>
```

Luego se creó un formato más general, pero más simple y estricto, llamado `XML` (eXtended Markup Language), especializado en el intercambio de archivos. Es más riguroso en su especificación, lo que lo hace más fácil de trabajar.

```xml
<persona edad="30">
    <nombre>Juan</nombre>
    <apellido>Perez</apellido>
</persona>
```

Tomando las ideas de `XML` y `HTML`, se conformó `XHTML`, que era el lenguaje para especificar páginas web, pero con la precisión y robustez del XML.
Este lenguaje evolucionó a `HTML5`, que es el que usamos en la actualidad.

```html
<!DOCTYPE html>
<html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
    </head>
    <body>
        
    </body>
</html>
```

`HTML`, junto con un protocolo de comunicación `HTTP`, constituye lo que llamamos la web (o la WWW - World Wide Web - telaraña de alcance mundial).


Existen otros lenguajes de marcado…

## Markdown
Una versión mínima para generar páginas web,

```markdown
# Titulo: Programacion web
## Capitulo 2: Que es JS

**JavaScript** es un lenguaje de programación...
se usa para ...

## Capítulo 2: Cómo se usa
- En el servidor
- En el cliente
...
```
En este caso, `#` equivale a `<h1>`, `##` a `<h2>`, etc. `**` a `<b>`, `-` a `<ul>+<li>`, etc.

## JSX
`JSX` permite mezclar `XML` y `JS` para crear páginas web usando `React`.

```jsx
let Boton = (texto, onClick) => <button onClick={onClick}>
    {texto}
</button>
...
<body>
    <h1>titulo</h1>
    <Boton texto="saludar" onClick={alert('Hola')}>
</body>
```

En este caso, un archivo `JS` puede contener `XML` entre `<>` y el `XML` puede contener `JS` entre `{}`.

El protocolo `http` indica cómo se deben intercambiar archivos. Está basado completamente en texto y consiste en hacer una petición (request) al servidor, que debe responder con una respuesta (response).

Tanto la petición como la respuesta consisten en una cabecera que describe la petición y un cuerpo que contiene los datos propiamente dichos.

La cabecera es un conjunto de clave:valor que describe tanto la petición como la respuesta y permite interpretar el cuerpo.

Siempre consiste en una acción y una URL en la primera línea y luego clave:valor.

La petición (REQUEST) se ve así:
```http
GET /agenda HTTP/1.1
Accept: text/html,application/xhtml+xml
Accept-Encoding: gzip, deflate, br, zstd
Accept-Language: es-419,es
Host: localhost:3000
User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X)
```

La respuesta (RESPONSE) se ve así:
La primera línea indica el protocolo y el código de estado (200 OK), luego el resto de la cabecera (clave:valor).

```http
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
Date: Tue, 02 Sep 2025 02:07:55 GMT
Connection: keep-alive
Keep-Alive: timeout=5
Transfer-Encoding: chunked

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Agenda</title>
</head>
<body>
    <h1>Agenda de Contactos</h1>
    <ul>
        <li><b>Pérez, Juan</b><br>   📱 (381) 555-0001</li>
        <li><b>Gómez, María</b><br>  📱 (381) 555-0002</li>
        <li><b>Martínez, Luis</b><br>📱 (381) 555-0003</li>
    </ul>
</body>
</html>
```


## Trilogía de las páginas web.
* HTML: Lenguaje de marcado para definir el contenido de la página web.
* CSS: Lenguaje para establecer cómo se ven las páginas web.
* JS: Lenguaje de programación para controlar cómo se comporta la página.


## Formato
El HTML está formado por etiquetas (tags) con atributos que pueden contener texto y otras etiquetas.

```html
<!-- Etiqueta -->
<div id="reloj"> <!-- div → etiqueta, id → 'atributo' , "reloj" → valor -->       
    10:20:23    <!-- contenido -->
</div>          <!-- cierre de la etiqueta -->

<!-- Etiqueta autocontenida -->
<img src="logo.jpg" />

<!-- Etiquetas anidadas -->
<lu class="lista">
    <li disabled>Lunes</li>   <!-- atributo sin valor se considera == "true" -->
    <li>Martes</li>
</lu>
```

Hay etiquetas con su propio significado:
- `html` → Documento principal
- `head` → Cabecera, declaraciones
- `body` → Contenido propiamente dicho.

### Estructura

```html
<!DOCTYPE html>  <!-- Declaracion que el archivo es html -->
<html lang="es">
    <head>
        <meta charset="utf-8">  <!-- Declaracion sobre como se almacena los datos -->
    </head>
    <body>
    </body>
</html>
```

En el `head` van las declaraciones y metadatos:
- `title` → Título con el que se identifica la página en el navegador.
- `meta` → Información sobre el formato de la página.
    - Especifica la codificación de caracteres (UTF-8 es estándar).
        ```html
        <meta charset="utf-8">
        ``` 
    - Para visualizar en celulares.

        ```html
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        ``` 

- `link` → Referencia a recursos externos.

    - Para incorporar un archivo CSS
        ```html
        <link rel="stylesheet" href="estilos.css">
        ```
    - Para poner el icono en el título (favicon)
        ```html
        <link rel="icon" href="favicon.ico">
        ```

- `style` permite insertar o embeber CSS en el archivo HTML

    ```html
    <style>
        body { background-color: #f0f0f0; }
    </style>
    ```

- `script` permite insertar o enlazar JS (pero no ambos)
    - Enlazado
        ```html
        <script src="app.js"></script>
        ```
    - Insertado
        ```html
        <script>
            // Script insertado directamente en el HTML
            function saludar() {
                alert("¡Hola Alejandro! 👋");
            }
        </script>
        ```
        > Nota: `script` también puede ir en el body

### Principales etiquetas para usar dentro del `<body>`

- `h1` a `h6` → Encabezados jerárquicos (del más grande al más pequeño).
    
    ```html     
    <h1>Título principal</h1>     
    <h2>Subtítulo</h2>
    ```

- `p` → Párrafo de texto.
    ```html     
    <p>Este es un párrafo de ejemplo.</p>
    ```

- `a` → Enlace a otra página o recurso.
    ```html     
    <a href="https://www.example.com">Visitar sitio</a>
    ```

- `img` → Imagen dentro del documento.
    ```html
    <img src="foto.jpg" alt="Descripción de la imagen" />
    ```

    - `ul + li` → Lista desordenada (viñetas).
    ```html
    <ul>       
        <li>Elemento 1</li>       
        <li>Elemento 2</li>     
    </ul>
    ```

    - `ol + li` → Lista ordenada (números).
    ```html
    <ol> 
        <li>Primer paso</li>       
        <li>Segundo paso</li>     
    </ol>
    ```

    - `div` → Contenedor genérico para agrupar contenido.
    ```html
    <div class="contenedor">       
        <p>Texto dentro del div</p>     
    </div>
    ```

    - `span` → Contenedor en línea para resaltar o dar estilo.
    ```html
    <p>Hola <span style="color:red;">mundo</span></p>
    ```

    - `button` → Botón interactivo.
    ```html
    <button>Haz clic aquí</button>
    ```

    - `form` → Formulario para enviar datos.
    ```html
    <form action="/enviar" method="post">       
        <input type="text" name="nombre">       
        <input type="submit" value="Enviar">     
    </form>
    ```

    - `video` → Insertar un video.

    ```html
    <video controls>       
        <source src="video.mp4" type="video/mp4">     
    </video>
    ```

    - `audio` → Insertar un audio.
    ```html
    <audio controls>       
        <source src="cancion.mp3" type="audio/mpeg">    
    </audio>
    ```

    - `table` → Tabla de datos.
    ```html
    <table border="1">       
        <tr>
            <th>Nombre</th><th>Edad</th>
        </tr>      
        <tr>
            <td>Ana</td><td>25</td>
        </tr>     
    </table>
    ```

### Tipos de `<input>` en HTML5 con ejemplos

El elemento `<input>` es muy versátil y admite muchos tipos distintos para recoger datos del usuario. Aquí tienes un listado con los más importantes y un ejemplo de cada uno.


- `type="text"` → Campo de texto de una sola línea.

    ```html
    <input type="text" name="usuario" placeholder="Nombre de usuario">
    ```

- `type="password"` → Campo de texto oculto (para contraseñas).

    ```html
    <input type="password" name="clave" placeholder="Contraseña">
    ```

- `type="email"` → Campo para correos electrónicos (con validación).

    ```html
    <input type="email" name="correo" placeholder="ejemplo@mail.com">
    ```

- `type="number"` → Campo numérico con flechas para subir/bajar.

    ```html
    <input type="number" name="edad" min="0" max="100">
    ```

- `type="tel"` → Campo para números de teléfono (sin validación estricta).

    ```html
    <input type="tel" name="telefono" placeholder="+54 123 456 789">
    ```

- `type="url"` → Campo para direcciones web.

    ```html
    <input type="url" name="sitio" placeholder="https://ejemplo.com">
    ```

- `type="date"` → Selector de fecha.

    ```html
    <input type="date" name="fecha_nacimiento">
    ```

- `type="time"` → Selector de hora.

    ```html
    <input type="time" name="hora">
    ```

- `type="datetime-local"` → Selector combinado de fecha y hora local.

    ```html
    <input type="datetime-local" name="cita">
    ```

- `type="month"` → Selector de mes y año.

    ```html
    <input type="month" name="mes_factura">
    ```

- `type="week"` → Selector de semana y año.

    ```html
    <input type="week" name="semana">
    ```

- `type="checkbox"` → Casilla de verificación (múltiple elección).

    ```html
    <label><input type="checkbox" name="interes" value="musica" /> Música</label>
    <label><input type="checkbox" name="interes" value="deporte" /> Deporte</label>
    ```

    > Nota: En el `input` de tipo `checkbox` se suele poner dentro de un `label` para usarlo.

- `type="radio"` → Botón de opción (selección única dentro del mismo
    grupo `name`).

    ```html
    <label><input type="radio" name="genero" value="m" /> Masculino</label>
    <label><input type="radio" name="genero" value="f" /> Femenino</label>
    ```

    > Nota: Todas las opciones deben tener el mismo `name` para que sean excluyentes.

- `type="range"` → Barra deslizante con valores numéricos.

    ```html
    <input type="range" name="volumen" min="0" max="100" step="10" />
    ```

- `type="color"` → Selector de color.

    ```html
    <input type="color" name="color_favorito" />
    ```


- `type="file"` → Selector de archivo(s) para subir.

    ```html
    <input type="file" name="documento" multiple />
    ```


- `type="hidden"` → Campo oculto (se envía con el formulario pero no se ve).


    ```html
    <input type="hidden" name="token" value="12345" />
    ```
    > Nota: Este es un truco para mantener el estado de un formulario (variables auxiliares).

- `type="search"` → Campo de búsqueda (parecido a text, con
    mejoras).

    ```html
    <input type="search" name="busqueda" placeholder="Buscar..." />
    ```

- `type="submit"` → Botón que envía el formulario.

    ```html
    <input type="submit" value="Enviar" />
    ```

- `type="reset"` → Botón que reinicia los valores del formulario.

    ```html
    <input type="reset" value="Reiniciar" />
    ```

- `type="button"` → Botón genérico (sin acción predeterminada).

    ```html
    <input type="button" value="Haz clic" />
    ```

- `type="image"` → Botón de envío en forma de imagen.

    ```html
    <input type="image" src="enviar.png" alt="Enviar" />
    ```


    - `select` → Permite elegir en una lista desplegable.

    ```html
    <select id="pais" name="pais">
        <option value="ar">Argentina</option>
        <option value="uy">Uruguay</option>
        <option value="cl">Chile</option>
    </select>
    ```

    - `fieldset`  → Permite agrupar varios controles.

    ```html
    <fieldset>
        <legend>Preferencias</legend>
        <label><input type="checkbox" name="suscribir" /> Suscribirme al boletín</label>
        <label><input type="checkbox" name="ofertas" /> Recibir ofertas</label>
    </fieldset>
    ```

### Formulario

Los formularios 'envían' datos al servidor.

    ```html
    <form action="/registrar" method="post">
        <label for="nombre">Nombre:</label>
        <input type="text" id="nombre" name="nombre" required>
        <button type="submit">Enviar</button>
    </form>
    ```

    - La `action` define la URL a donde se envía.
    - El `method` define si hace un:
        - `GET` → datos en la URL (para búsquedas, filtros).
        - `POST` → datos en el cuerpo de la petición (más seguro para contraseñas, registros, etc.).

El formulario se envía automáticamente cuando hay un `input` del tipo submit o un `button` del tipo submit.

En los sistemas modernos, la función de enviar se controla mediante `JavaScript`.

El formato de la url es

```text
https://www.google.com/search?q=programar%20java

- https -> protocolo
- www.google.com -> dominio
- /search -> camino
- ?q=programar%20java
    q -> variable
    programar%20java -> valor 
    %20 -> ' ' (escapado)
```

Cuando se hacea un POST la informacion se guarda en el cuerpo

```http
POST /submit HTTP/1.1
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
Accept-Encoding: gzip, deflate, br, zstd
Accept-Language: es-419,es;q=0.9,es-ES;q=0.8,en;q=0.7,en-GB;q=0.6,en-US;q=0.5,es-AR;q=0.4,ca;q=0.3
Cache-Control: max-age=0
Connection: keep-alive
Content-Length: 36

nombre=aaa&apellido=bbb&telefono=123
```

```html
<form id="miFormulario">
  <input type="text" name="usuario" placeholder="Usuario" required>
  <button type="submit">Enviar</button>
</form>

<script>
  const form = document.getElementById("miFormulario");

  form.addEventListener("submit", function(event) {
    event.preventDefault(); // 🚫 evita el envío real
    alert("Formulario capturado con JS, pero no enviado");
    
    // acá podrías procesar datos con AJAX / Fetch
  });
</script>
```

Todos los elementos de HTML tienen un estilo por defecto que es propio de cada cliente (navegador); con CSS se puede cambiar el estilo por defecto.

Hay algunos atributos generales:
- Se usa `id` → para asignar un identificador único.
- Se usa `class` → para que el elemento pertenezca a una clase o grupo de estilos.
- Se usa `style` para agregar estilos 'embebidos' en el propio componente.

