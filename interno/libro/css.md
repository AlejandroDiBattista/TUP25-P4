# CSS

## Que es?

El CSS (Cascade Sheet Style ) sirve para definir como se muestra la pagina web.

La idea surge en los diarios, al publicar un articulo, el periodista escribia el articulo pero era el editor el que definia como se mostraba el articulo en el diario.

La forma particular de mostrarlo se llamaba el estilo de diario y consistia en definir que fuente, que tamaño, que espacios e incluso donde se ubicaba cada articulo.

```
H1 -> Cabecera de un articulo, mostrar en fuente Times New Roman de 20 picas.
P  -> Parrador, fuente arial de 10 picas.
```

Esta idea inspiro como definir la forma de visualizar las paginas.
El html define el contenido y pone las marcas.
Es el css quien define como se muestra.

Por defecto cada etiqueta html ya tiene un estilo predefinido, pero todos ellos se pueden cambiar mediante un css personalizado.

<div> por ejemplo se muestra como un bloque, <span> se muestra en linea pero podemos cambiar el comportanmiento definiendo `div: {display: inline;}` y `span {display:block;}`

Los archivos css consta de una colleccion de declaraciones

```css
selector { reglas; }
```

El `selector` -> define a `que` elementos debo aplicar el estilo
Las `reglas` -> define `como` lo quiero mostrar.

Las reglas tiene el formato: `clave: valor`


## 1. Selectores básicos

-   **Universal**

    ``` css
    * { margin: 0; }
    ```

-   **De tipo (tag)**

    ``` css
    p { color: blue; }
    ```

-   **De clase**

    ``` css
    .btn { background: red; }
    ```

-   **De id**

    ``` css
    #menu { border: 1px solid; }
    ```

-   **De atributo**

    ``` css
    input[type="text"] { border: 1px solid; }
    ```

    Variantes:

    -   `[attr]` → si existe el atributo\
    -   `[attr="valor"]` → igual a valor\
    -   `[attr^="val"]` → empieza con\
    -   `[attr$="val"]` → termina con\
    -   `[attr*="val"]` → contiene\
    -   `[attr~="val"]` → palabra en lista\
    -   `[attr|="val"]` → valor o valor-\*

------------------------------------------------------------------------

## 2. Selectores combinadores

-   **Descendiente**

    ``` css
    div p { color: green; }
    ```

-   **Hijo directo (`>`)**

    ``` css
    div > p { color: red; }
    ```

-   **Hermano adyacente (`+`)**

    ``` css
    h1 + p { color: blue; }
    ```

-   **Hermano general (`~`)**

    ``` css
    h1 ~ p { color: gray; }
    ```

------------------------------------------------------------------------

## 3. Selectores de pseudo-clase

-   **De estado de enlace**

    ``` css
    a:link
    a:visited
    a:hover
    a:active
    ```

-   **De interacción / formulario**

    ``` css
    input:focus
    input:checked
    input:disabled
    input:required
    input:valid
    input:invalid
    ```

-   **Estructurales**

    ``` css
    :first-child
    :last-child
    :only-child
    :nth-child(2n)
    :nth-last-child(3)
    :first-of-type
    :last-of-type
    :nth-of-type(odd)
    :empty
    :not(.clase)
    ```

-   **De nivel 4 (modernos)**

    ``` css
    :is(.a, .b)
    :where(.a, .b)
    :has(img)
    ```

------------------------------------------------------------------------

## 4. Selectores de pseudo-elemento

Se usan con `::`:

``` css
p::first-line
p::first-letter
::before
::after
::selection
::placeholder
```

------------------------------------------------------------------------

## 5. Selectores agrupados

``` css
h1, h2, h3 { font-family: sans-serif; }
```

------------------------------------------------------------------------

## 6. Selectores por contexto

-   **Negación**

    ``` css
    div:not(.activo) { opacity: 0.5; }
    ```

-   **Anidamiento**

    ``` css
    :is(header, footer) a { color: white; }
    ```

-   **Relacional**

    ``` css
    article:has(h2) { border: 1px solid; }
    ```

------------------------------------------------------------------------

✅ **Resumen**\
- Básicos: `*`, `div`, `.clase`, `#id`, `[attr]`\
- Combinadores: `espacio`, `>`, `+`, `~`\
- Pseudo-clases: `:hover`, `:nth-child`, `:is`, `:has` ...\
- Pseudo-elementos: `::before`, `::after`, `::first-line` ...\
- Agrupados: `h1, h2`

# Prioridad de Selectores en CSS (Especificidad)

Cuando múltiples selectores coinciden en el mismo elemento, **CSS aplica
reglas de especificidad y cascada**.

------------------------------------------------------------------------

## 1. Orden de prioridad

1.  **Reglas con `!important`**

    ``` css
    .btn { color: red !important; }
    ```

2.  **Estilos inline** (atributo `style=""` en HTML).

    ``` html
    <p style="color: blue;">Hola</p>
    ```

3.  **Selectores por ID**

    ``` css
    #titulo { color: green; }
    ```

4.  **Selectores de clase, atributos y pseudo-clases**

    ``` css
    .btn { ... }
    a:hover { ... }
    input[type="text"] { ... }
    ```

5.  **Selectores de tipo (tag) y pseudo-elementos**

    ``` css
    p { ... }
    h1::first-line { ... }
    ```

6.  **Selector universal `*`**

    ``` css
    * { ... }
    ```

------------------------------------------------------------------------

## 2. Cálculo de especificidad

Se representa como **(a, b, c, d)**:

-   **a** → `!important` (fuera del cómputo normal, pero dominante).
-   **b** → número de selectores de **ID**.
-   **c** → número de **clases, atributos o pseudo-clases**.
-   **d** → número de **tags o pseudo-elementos**.

Ejemplos:

``` css
#menu {}          /* (0,1,0,0) */
.btn.activo {}    /* (0,0,2,0) */
p.error {}        /* (0,0,1,1) */
h1 p {}           /* (0,0,0,2) */
```

------------------------------------------------------------------------

## 3. Ejemplo práctico

``` html
<p id="msg" class="info">Hola</p>
```

``` css
p { color: black; }                    /* (0,0,0,1) */
.info { color: blue; }                 /* (0,0,1,0) */
#msg { color: green; }                 /* (0,1,0,0) */
p.info { color: purple !important; }   /* !important */
```

👉 Resultado: el texto será **morado**, porque la regla con `!important`
gana.

------------------------------------------------------------------------

## 4. Reglas adicionales

-   **Cascada**: si la especificidad es igual, gana el selector definido
    **más abajo**.\
-   **Herencia**: propiedades heredadas tienen menos fuerza que reglas
    explícitas.\
-   **CSS de usuario** (por accesibilidad) puede sobrepasar reglas del
    sitio si usan `!important`.

------------------------------------------------------------------------

## ✅ Resumen rápido

`!important` \> inline \> id \> clase/atributo/pseudo-clase \>
tag/pseudo-elemento \> universal


# Propiedades CSS (Atributos aplicables a elementos)

En CSS, las **propiedades** son los atributos que se aplican a los
elementos HTML mediante selectores.\
Aquí están organizadas por categorías principales:

------------------------------------------------------------------------

## 1. Propiedades de texto y fuente

-   `color`
-   `font-family`, `font-size`, `font-weight`, `font-style`
-   `text-align`, `text-transform`, `text-decoration`
-   `line-height`, `letter-spacing`, `word-spacing`
-   `white-space`, `overflow-wrap`, `text-overflow`

------------------------------------------------------------------------

## 2. Propiedades de fondo y borde

-   `background-color`, `background-image`, `background-position`,
    `background-size`, `background-repeat`, `background-attachment`
-   `border`, `border-width`, `border-style`, `border-color`,
    `border-radius`
-   `box-shadow`

------------------------------------------------------------------------

## 3. Propiedades de caja (Box Model)

-   `width`, `height`, `min-width`, `max-height`
-   `margin`, `padding`
-   `display`, `visibility`
-   `overflow`, `clip`, `object-fit`

------------------------------------------------------------------------

## 4. Propiedades de layout (posición y flexibilidad)

-   **Posicionamiento clásico**\
    `position`, `top`, `right`, `bottom`, `left`, `z-index`
-   **Flexbox**\
    `display: flex`, `justify-content`, `align-items`, `align-content`,
    `flex`, `flex-grow`, `flex-shrink`, `flex-basis`
-   **Grid**\
    `display: grid`, `grid-template-columns`, `grid-template-rows`,
    `grid-area`, `gap`, `place-items`, `place-content`
-   **Multicolumnas**\
    `column-count`, `column-gap`, `column-rule`

------------------------------------------------------------------------

## 5. Propiedades de listas y tablas

-   `list-style-type`, `list-style-image`, `list-style-position`
-   `border-collapse`, `border-spacing`, `caption-side`, `empty-cells`,
    `table-layout`

------------------------------------------------------------------------

## 6. Propiedades de color y efectos visuales

-   `opacity`
-   `filter` (blur, brightness, contrast, etc.)
-   `mix-blend-mode`

------------------------------------------------------------------------

## 7. Propiedades de transición, animación y transformaciones

-   **Transformaciones**\
    `transform: rotate(), scale(), translate()`
-   **Transiciones**\
    `transition`, `transition-duration`, `transition-delay`
-   **Animaciones**\
    `animation-name`, `animation-duration`, `animation-iteration-count`,
    `animation-timing-function`

------------------------------------------------------------------------

## 8. Propiedades de interactividad

-   `cursor`
-   `pointer-events`
-   `user-select`
-   `resize`

------------------------------------------------------------------------

## 9. Propiedades modernas (CSS nivel 4+)

-   `aspect-ratio`
-   `scroll-behavior`, `scroll-snap-type`
-   `backdrop-filter`
-   `accent-color`
-   `contain`, `content-visibility`
-   **Selectores condicionales modernos**: `:has()`, `:is()`

------------------------------------------------------------------------

✅ **Resumen**\
Las propiedades CSS abarcan **texto, fondos, bordes, modelo de caja,
layout, listas/tablas, efectos, animaciones, interactividad y
modernas**.

# Propiedades CSS relacionadas con la tipografía

Las propiedades de **tipografía en CSS** controlan cómo se presenta el
texto en pantalla o impresión.\
Se organizan en varios grupos:

------------------------------------------------------------------------

## 1. Familia tipográfica

-   **`font-family`** → define la fuente principal y alternativas.

    ``` css
    p { font-family: "Helvetica", Arial, sans-serif; }
    ```

-   **`font` (shorthand)** → propiedad abreviada que incluye:\
    `font-style`, `font-variant`, `font-weight`, `font-stretch`,
    `font-size`, `line-height`, `font-family`.

    ``` css
    p { font: italic small-caps bold 16px/1.5 "Helvetica", sans-serif; }
    ```

------------------------------------------------------------------------

## 2. Tamaño y escala

-   **`font-size`** → tamaño del texto (`px`, `em`, `rem`, `%`).\
-   **`font-size-adjust`** → ajusta la altura x para mejorar
    legibilidad.

------------------------------------------------------------------------

## 3. Estilo y variantes

-   **`font-style`** → `normal | italic | oblique`\
-   **`font-weight`** → `100–900 | bold | normal | lighter`\
-   **`font-variant`** → `small-caps | normal`\
-   **`font-stretch`** → `condensed | expanded | %`

------------------------------------------------------------------------

## 4. Altura y espaciado

-   **`line-height`** → altura de línea (separación vertical).\
-   **`letter-spacing`** → espacio entre caracteres.\
-   **`word-spacing`** → espacio entre palabras.

------------------------------------------------------------------------

## 5. Transformación y decoración

-   **`text-transform`** → `uppercase | lowercase | capitalize`\
-   **`text-decoration`** → `underline | overline | line-through` (+
    color, estilo, grosor).\
-   **`text-shadow`** → aplica sombras al texto.

------------------------------------------------------------------------

## 6. Alineación y distribución

-   **`text-align`** → `left | right | center | justify`\
-   **`text-align-last`** → controla la última línea de párrafos
    justificados.\
-   **`text-indent`** → sangría de la primera línea.\
-   **`vertical-align`** → alinea elementos inline o en tablas.

------------------------------------------------------------------------

## 7. Colores y fondos del texto

-   **`color`** → color de la tipografía.\
-   **`background-clip: text`** (junto con `color: transparent`) →
    degradados sobre el texto.

------------------------------------------------------------------------

## 8. Propiedades modernas

-   **`font-variant-numeric`** → variantes de números (`oldstyle-nums`,
    `lining-nums`).\
-   **`font-feature-settings`** → control de características OpenType.\
-   **`font-variation-settings`** → ejes en fuentes variables (peso,
    ancho, inclinación).\
-   **`text-rendering`** → optimización del renderizado
    (`optimizeLegibility`, `geometricPrecision`).

------------------------------------------------------------------------

## ✅ Resumen

-   **Familia**: `font-family`, `font`\
-   **Tamaño/escala**: `font-size`, `font-size-adjust`\
-   **Estilo/variantes**: `font-style`, `font-weight`, `font-variant`,
    `font-stretch`\
-   **Espaciado**: `line-height`, `letter-spacing`, `word-spacing`\
-   **Decoración**: `text-transform`, `text-decoration`, `text-shadow`\
-   **Alineación**: `text-align`, `text-indent`, `vertical-align`\
-   **Avanzadas**: `font-feature-settings`, `font-variation-settings`

Definir el tamaño de las letras (y de cualquier elemento en css) se pueden usar distintas unidades

# Tabla de unidades CSS

| Unidad | Tipo | Relativo a | Ejemplo | Uso típico |
|--------|------|------------|---------|------------|
| `px`   | Absoluta | Píxeles de la pantalla (dependen de densidad del dispositivo) | `font-size: 16px;` | Texto fijo en web |
| `pt`   | Absoluta | 1/72 de pulgada | `12pt` | Documentos para impresión |
| `pc`   | Absoluta | 12pt (1 pica) | `2pc` = `24pt` | Diseño tipográfico tradicional |
| `cm`, `mm`, `in` | Absolutas | Medidas físicas reales | `1cm`, `10mm`, `2in` | CSS para impresión |
| `%`    | Relativa | Al valor heredado del padre | `120%` | Escalar texto respecto al contenedor |
| `em`   | Relativa | `font-size` del elemento **padre** | `1.5em` | Padding, márgenes, fuentes escalables |
| `rem`  | Relativa | `font-size` del **html (raíz)** | `2rem` | Texto consistente en toda la app |
| `ex`   | Relativa | Altura de la “x” en la fuente actual | `2ex` | Casos tipográficos específicos |
| `ch`   | Relativa | Ancho del carácter “0” de la fuente | `60ch` | Limitar ancho de párrafos |
| `vw`   | Relativa | 1% del **ancho del viewport** | `5vw` | Tipografía fluida en pantallas |
| `vh`   | Relativa | 1% del **alto del viewport** | `100vh` | Secciones a pantalla completa |
| `vmin` | Relativa | Menor entre `vw` y `vh` | `10vmin` | Layouts fluidos proporcionales |
| `vmax` | Relativa | Mayor entre `vw` y `vh` | `10vmax` | Layouts fluidos proporcionales |
| `clamp()` | Funcional | Mínimo, preferido, máximo | `clamp(14px, 2vw, 18px)` | Fuentes adaptables con límites |
| `calc()`  | Funcional | Cálculo dinámico | `calc(1rem + 1vw)` | Ajustes flexibles de tamaño |

## Colores

### Propiedades de color en CSS

Las propiedades relacionadas con los **colores en CSS** controlan el texto, fondos, bordes y efectos visuales.

---

## 1. Color del texto
- **`color`** → define el color de la fuente.  
  ```css
  p { color: red; }
  ```

---

## 2. Fondos
- **`background-color`** → color de fondo.  
- **`background`** (shorthand) → incluye color, imagen, posición, repetición, tamaño, etc.  
  ```css
  div { background-color: lightblue; }
  div { background: yellow url("img.png") no-repeat center; }
  ```

---

## 3. Bordes
- **`border-color`** → color de borde.  
- **`border-top-color`, `border-right-color`, `border-bottom-color`, `border-left-color`** → control individual.  
  ```css
  div { border: 2px solid red; }
  ```

---

## 4. Sombras y efectos
- **`text-shadow`** → sombra en el texto.  
- **`box-shadow`** → sombra en cajas.  
- **`filter`** → filtros visuales (blur, brightness, contrast, etc.).  
- **`backdrop-filter`** → filtros sobre el fondo detrás de un elemento.  

---

## 5. Otros relacionados
- **`outline-color`** → color del contorno (por ejemplo en inputs).  
- **`caret-color`** → color del cursor en campos de texto.  
- **`accent-color`** → color de acento en controles nativos (`checkbox`, `radio`, `range`).  
- **`column-rule-color`** → color de las reglas en diseño multicolumna.  

---

## 6. Formatos de color admitidos
- **Nombres**: `red`, `blue`, `transparent`.  
- **Hexadecimal**: `#ff0000`, `#f00`, `#ff000080` (incluye alpha).  
- **RGB / RGBA**: `rgb(255,0,0)`, `rgba(255,0,0,0.5)`.  
- **HSL / HSLA**: `hsl(0,100%,50%)`, `hsla(0,100%,50%,0.5)`.  
- **Color funcional moderno**: `color(display-p3 1 0 0)` → espacios de color avanzados.  

---

## ✅ Resumen rápido
- Texto: `color`  
- Fondo: `background-color`, `background`  
- Bordes: `border-color`, `outline-color`  
- Efectos: `text-shadow`, `box-shadow`, `filter`, `backdrop-filter`  
- Controles: `caret-color`, `accent-color`  


# 📘 Guía rápida de Flexbox

## 🌱 Origen
El **modelo Flexbox** surge en CSS3 para resolver la dificultad de alinear y distribuir elementos en un contenedor, algo que antes requería hacks con floats, tablas o inline-blocks.

---

## 🛠️ Problema que resuelve
1. **Distribución dinámica de espacio**  
   Los hijos se ajustan al espacio disponible.
2. **Alineación sencilla**  
   Centrado horizontal y vertical en pocas líneas.
3. **Orden flexible**  
   Cambiar el orden visual sin modificar el HTML.
4. **Diseño responsivo natural**  
   Se adapta a diferentes tamaños de pantalla.

---

## 📌 Uso básico
Se aplica al **contenedor (padre):**
```css
.container {
  display: flex;               /* activa flexbox */
  flex-direction: row;         /* eje principal: fila (default) */
  justify-content: center;     /* alinear en eje principal */
  align-items: center;         /* alinear en eje secundario */
  gap: 10px;                   /* separación entre hijos */
}
```

Los **elementos hijos** pueden definirse así:
```css
.item {
  flex: 1;          /* ocupa espacio proporcional */
  flex-grow: 2;     /* crece el doble que otros */
  flex-shrink: 0;   /* evita encogerse */
  flex-basis: 200px;/* tamaño base */
}
```

---

## 🎯 Ejes en Flexbox

- **Eje principal (main axis):** definido por `flex-direction`.
- **Eje secundario (cross axis):** perpendicular al principal.

### Opciones de `flex-direction`:
- `row` (horizontal izq → der)
- `row-reverse` (horizontal der → izq)
- `column` (vertical arriba → abajo)
- `column-reverse` (vertical abajo → arriba)

### Alineaciones
- `justify-content` → organiza en el **eje principal**  
  Valores: `flex-start`, `flex-end`, `center`, `space-between`, `space-around`, `space-evenly`.

- `align-items` → organiza en el **eje secundario**  
  Valores: `flex-start`, `flex-end`, `center`, `stretch`, `baseline`.

---

## 📄 Ejemplo: centrar un botón
```css
body {
  display: flex;
  justify-content: center; /* centro horizontal */
  align-items: center;     /* centro vertical */
  height: 100vh;
}
```

---

## 🚀 Conclusión
- Flex **simplifica la alineación y distribución**.
- Ideal para **componentes y layouts medianos**.
- Se complementa con **CSS Grid** para estructuras más grandes.

 📌 Guía rápida: Shorthand en `margin` y `padding`

## 🔢 Reglas de shorthand

| Nº de valores | Sintaxis                 | Significado (orden aplicado)                               | Ejemplo                           |
|---------------|--------------------------|------------------------------------------------------------|-----------------------------------|
| **1 valor**   | `margin: X;`             | Todos los lados = X                                        | `margin: 10px;` → 10px en los 4 lados |
| **2 valores** | `padding: Y Z;`          | Y = arriba/abajo<br>Z = izquierda/derecha                  | `padding: 5px 20px;` → arriba/abajo 5px, izq/der 20px |
| **3 valores** | `margin: A B C;`         | A = arriba<br>B = izquierda/derecha<br>C = abajo           | `margin: 10px auto 30px;` → arriba 10px, izq/der auto, abajo 30px |
| **4 valores** | `padding: A B C D;`      | A = arriba<br>B = derecha<br>C = abajo<br>D = izquierda    | `padding: 5px 10px 15px 20px;` → arriba 5px, der 10px, abajo 15px, izq 20px |

---

## 📝 Notas útiles
- `margin: auto` se usa mucho en layouts para **centrar horizontalmente** un elemento (si tiene ancho definido).  
- Los valores pueden expresarse en **px, %, em, rem, vh, vw**, etc.  
- El orden de 4 valores siempre es en **sentido horario**: arriba → derecha → abajo → izquierda.

---

## 📄 Ejemplo práctico
```css
.card {
  margin: 20px auto 40px; /* arriba 20, izq/der auto, abajo 40 */
  padding: 10px 15px;     /* arriba/abajo 10, izq/der 15 */
  border: 1px solid #ccc;
}
```

