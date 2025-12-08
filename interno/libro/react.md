# React:

## Introducción a React

React es una biblioteca de JavaScript para construir interfaces de usuario. Fue desarrollada por Facebook y se utiliza ampliamente en la industria para crear aplicaciones web interactivas y dinámicas.

## ¿Cómo surge React?

React surge para facilitar la creación de aplicaciones dinámicas y eficientes.

Antes de React, la manipulación del DOM (Document Object Model) era costosa y propensa a errores, especialmente en aplicaciones complejas. React introduce el concepto de Virtual DOM, que permite actualizar solo las partes necesarias de la interfaz de usuario, mejorando significativamente el rendimiento.

React nos permite crear interfaces declarativas y reactivas. Son `declarativas` porque describimos cómo se ve la UI en un determinado estado y React se encarga de actualizarla cuando el estado cambia. Son `reactivas` porque la UI responde automáticamente a los cambios en los datos.


## ¿Cómo se crea una página web?

El navegador descarga el archivo HTML y lo analiza para crear el `DOM` (Document Object Model), que es una representación en memoria de la estructura del documento.

Si encuentra un enlace externo (CSS, JS, imágenes, etc.), realiza otra petición para descargar ese recurso y luego lo agrega al DOM.

Cuando el enlace es a un archivo JS, el navegador lo ejecuta, el JS podría generar dinámicamente contenido, por  lo tanto, cada vez que referenciamos un JS, el navegador debe detener el parseo del HTML hasta que se descarga y ejecuta el JS.

En cambio, si el enlace es a un CSS, el navegador descarga el archivo y al terminar lo analiza para registrar como va a ser el estilo que luego aplicara al html para definir como se ve. Procesar el CSS no detiene el analisis, sino que detiene el renderizado de la página hasta que se descarga el CSS, para evitar un efecto visual no deseado (Flash of unstyled content).

Una vez que se ha analizado el HTML y se ha generado el `DOM`, y se ha analizado el CSS y creado el `CSSOM` (CSS Object Model), el navegador combina ambos para crear el `Render Tree`, que es la representación visual de la página. Luego, el navegador calcula el `Layout` (posición y tamaño de cada elemento) y finalmente pinta los píxeles en la pantalla.

La enorme flexibilidad al construir una página se paga con un proceso que es complejo y requiere optimizaciones para mejorar el rendimiento y la experiencia del usuario. Cada vez que se carga una página, el proceso debe realizarse nuevamente.

En la programación de una página web tradicional, agregar un elemento al carrito de compras, por ejemplo, donde había 2 unidades de un producto y agrego una más, implicaría enviar los datos al servidor, el servidor realizar el cálculo y devolver una página HTML nueva con el carrito actualizado. 
El navegador tendría que analizar nuevamente todo el HTML, CSS y JS, crear nuevamente el DOM, CSSOM, Render Tree, calcular el layout y pintar los píxeles en la pantalla. Todo esto para actualizar un solo elemento en la página.

React cambia este paradigma, permitiendo crear aplicaciones web donde la mayor parte de la lógica se ejecuta en el cliente (navegador), y solo se comunica con el servidor para obtener o enviar datos, no para renderizar la página completa.


## Características principales de React
- **Componentes**: React se basa en componentes reutilizables que encapsulan la lógica y la presentación de una parte de la interfaz de usuario. Permiten crear piezas independientes con su propia lógica y estilo.
- **JSX**: Una extensión de sintaxis que permite escribir HTML dentro de JavaScript, facilitando la creación de componentes.
- **Virtual DOM**: React utiliza un DOM virtual para mejorar el rendimiento al minimizar las manipulaciones directas del DOM real.
- **Flujo de datos unidireccional**: Los datos fluyen en una sola dirección, lo que facilita el seguimiento de los cambios y la depuración.
- **Ecosistema**: React tiene un ecosistema rico con muchas bibliotecas y herramientas complementarias, como React Router para el enrutamiento y Redux para la gestión del estado.

## Ejemplo básico de un componente React usando createElement

Supongamos que tenemos un componente simple que representa un contacto.

```html
<div class="contacto">
    <h1>Alejandro Di Battista</h1>
    <p>Tel: (381) 534-3458</p>
</div>
```

y queremos crear un componente que genere ese elemento en React usando `createElement`.

```js
import React from 'react';

const Contacto = () => 
    React.createElement('div', {className: "contacto"},
        React.createElement('h1', null, 'Alejandro Di Battista'),
        React.createElement('p', null, 'Tel: (381) 534-3458')
    )

```

El mismo elemento se puede crear en forma dinámica usando funciones, lo cual es más eficiente ya que no tiene que tomar un string y parsearlo, sino que produce directamente el árbol de elementos.

Incluso podríamos crear un componente más general que reciba props y renderice el contacto.

```js
import React from 'react';

const Contacto = (props) => 
    React.createElement('div', {className: "contacto"},
        React.createElement('h1', null, props.nombre),
        React.createElement('p', null, `Tel: ${props.telefono}`)
    )
```


La traducción es sencilla...

``` <h1>Hola, {nombre}!</h1> ``` se traduce a 

``` React.createElement('h1', null, `Hola, ${nombre}!`) ``` 

Aun así, al hacer el componente es más fácil de escribir y leer que en JS puro.

Por eso los creadores de React crearon JSX, que es una extensión de sintaxis que permite escribir HTML dentro de JavaScript, facilitando la creación de componentes.


```jsx

const Contacto = (props) => 
        <div className="contacto">
            <h1>{props.nombre}</h1>
            <p>tel: {props.telefono}</p>
        </div>

// o incluso mas simple (usando desestructuración)

const Contacto = ({nombre, telefono}) => 
    <div className="contacto">
        <h1>{nombre}</h1>
        <p>tel: {telefono}</p>
    </div>
```


Con JSX, el código es más legible y se asemeja más a la estructura HTML que estamos acostumbrados a ver. La conversión se hace con una librería llamada Babel, que convierte el JSX en llamadas a `React.createElement`.

La conversión es sencilla, solo hay que recordar que:
- Las clases en HTML se escriben como `className` en JSX.
- Los atributos en JSX usan camelCase (por ejemplo, `onClick` en lugar de `onclick`).
- Las expresiones de JavaScript se incluyen entre llaves `{}`.
- JSX debe tener un solo elemento padre, por lo que si tienes múltiples elementos, debes envolverlos en un contenedor (como un `<div>` o un fragmento `<>...</>`).
- Los atributos del elemento se convierten en un objeto pasado como segundo argumento a `React.createElement`.
- Los elementos hijos se pasan como argumentos adicionales a `React.createElement`.


```html
<!doctype html>
<html lang="es">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <!-- React + ReactDOM (UMD) -->
        <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
        <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>

        <!-- Babel para habilitar JSX en el navegador (solo para demos/desarrollo) -->
        <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    </head>

    <body>
        <div id="root" />

        <script type="text/babel" data-presets="react">
            const contactos = [
            { id: 1, nombre: 'Ana Gómez',       telefono: '(381) 555-1001' },
            { id: 2, nombre: 'Luis Martínez',   telefono: '(381) 555-1002' },
            { id: 3, nombre: 'María Rodríguez', telefono: '(381) 555-1003' },
            { id: 4, nombre: 'Juan Pérez',      telefono: '(381) 555-1004' },
            { id: 5, nombre: 'Sofía López',     telefono: '(381) 555-1005' },
            ];

            // Componentes
            function Contacto({ nombre, telefono = 'No disponible' }) {
            return (
                <div className="card">
                <h3>{nombre}</h3>
                <p>Tel: {telefono}</p>
                </div>
            );
            }

            function ListaContactos({ contactos }) {
            return (
                <div className="lista-contactos">
                    {contactos.map( c => <Contacto key={c.id} nombre={c.nombre} telefono={c.telefono} />) }
                </div>
            );
            }

            // Render automático al cargar
            const container = document.getElementById('root'); 
            const root = ReactDOM.createRoot(container);
            root.render(<ListaContactos items={contactos} />);
        </script>
    </body>
    </html>
```

