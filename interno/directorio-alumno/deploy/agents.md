# Directorio de alumnos — Guía rápida de código

Notas para modificar `index.html` sin perder tiempo.

## Estructura general
- Página single-file: HTML + CSS + JS en el mismo `index.html`. No hay build ni imports externos salvo `alumnos.json`.
- Datos: se cargan una sola vez desde `./alumnos.json` vía `ensureDataLoaded()`, se guardan en `ALL`.
- Render principal: `render()` -> filtra (`filterItems`), ordena por nombre, `mountCards` y actualiza contador.

## Búsqueda y facetas
- Texto libre (`baseSearchText`) separado del estado de facetas (`facetState {year, materia, comision}`).
- Input muestra texto + facetas (`refreshSearchDisplay`), pero al escribir solo actualiza `baseSearchText`; las facetas no se pisan.
- Filtrado: `filterItems(items, texto, facets)` aplica:
  - tokens de texto (sin acentos) sobre nombre/legajo/teléfono/github + cursos
  - abreviaturas P/L + estados + filtros de facetas (usa `coursesForFacet`)
  - si hay facetas, alumno debe tener cursos que cumplan todo.
- Facetas dinámicas con conteo sobre lo ya filtrado:
  - Años: `countYears` sobre la lista filtrada por texto (y año si ya está elegido).
  - Materias y comisiones anidadas: cuentan sobre la lista filtrada con año (y materia).
  - `renderFacetLinks` muestra `Etiqueta <span class="facet-count">(n)</span>` con letra más chica.
- Al togglear facetas se recalcula el texto combinado pero **no** se borra `baseSearchText`.

### Búsqueda en caliente (hot search)
- El texto se normaliza (sin mayúsculas/acentos) y se tokeniza una sola vez (`tokenizeQuery`/`prepareSearchIndex`); se generan abreviaturas P/L/C y estados para matchear rápido.
- En la UI, el input es real, pero la capa visual (`#search-overlay`) pinta las facetas en azul con fondo amarillo y deja el resto del texto plano. Se actualiza en `renderSearchOverlay` cada vez que cambia `baseSearchText` o las facetas.
- Se preserva el espacio final al escribir/borrar para que el usuario no “pierda” blancos al editar.
- Al eliminar una faceta desde el texto, se limpia la faceta completa y el caret queda justo antes del espacio que ocupaba.

### Facetado (año > materia > comisión)
- Parsing: `parseSearchInput` detecta año (4 dígitos), materia (`p/l` + número o “programacion/laboratorio” + número) y comisión (`c` + número). Las facetas solo se aplican si hay año presente, respetando el orden año → materia → comisión.
- Estado: `facetState` guarda la faceta actual y `displayFacetTokens` arma la representación de cada faceta.
- Render: `renderFacets` recalcula listas y conteos dinámicos sobre el filtrado actual; toggle de facetas no borra el texto libre.
- Cambios de faceta mantienen el foco en el input y sincronizan la query string (`?q=`).

### Navegación por teclado
- En la grilla de contactos:
  - Flechas mueven el foco entre tarjetas.
  - Enter abre el zoom del avatar (si hay foto); cualquier tecla lo cierra.
  - Ctrl/Cmd+C copia la tarjeta seleccionada (si no hay texto seleccionado).
  - Tab navega secuencial; con typeahead activo recorre solo coincidencias.
- El foco inicial de la grilla no se marca mientras el usuario está escribiendo en el buscador; se marca al navegar/clickear.

## Navegación y accesibilidad
- Roving tabindex: `setActiveCard` marca `.kbd-selected`, gestiona focus y scroll.
- Scroll seguro: `ensureCardVisible` mueve la ventana evitando que la tarjeta quede bajo el header o el footer (usa sus alturas).
- Atajos en grilla:
  - Flechas/Tab para moverse; Tab con typeahead salta entre coincidencias.
  - Ctrl/Cmd+C copia texto del contacto.
- Global: Ctrl/Cmd+K lleva al input de búsqueda.
- Global: Espacio (cuando no estás editando) inserta un espacio en la búsqueda y evita el scroll.

## Typeahead (búsqueda en caliente)
- Buffer `typeaheadBuffer` + expiración; al expirar solo marca bandera para reiniciar en la próxima tecla (no borra resaltado).
- Letras: subsecuencia normalizada; mayúsculas exigen inicio de palabra.
- Dígitos: buscan subcadenas consecutivas en legajo.
- Resaltado: `.typeahead-hit` en nombre o legajo; se aplica a todos los matches (`applyHighlights`).

## Render y performance
- Búsqueda reactiva: `scheduleSearchRender` agrupa renders en `requestAnimationFrame` para evitar tartamudeo al borrar rápido.
- Preload de avatares: `imagePreloader` con `requestIdleCallback` y heurísticas de red.
- `mountCards` prepara manejadores, tabIndex y fallback de avatar a iniciales.

## Otros detalles
- Copiado: `contactTextFromCard` arma texto legible con cursos.
- Zoom avatar: overlay `#avatar-zoom`.
- Footer flotante: se dejó `padding-bottom` y `grid` con espacio extra para no taparlo.

## Puntos de entrada útiles
- Datos: `ALL`, `LAST_FILTERED` (última lista filtrada).
- Estado: `facetState`, `baseSearchText`.
- Funciones clave: `filterItems`, `coursesForFacet`, `renderFacets`, `render`, `applyHighlights`, `ensureCardVisible`.

Modificación típica:
1) Ajustar filtros → tocar `filterItems` o `coursesForFacet`.
2) Cambios en facetas → `renderFacets` y helpers de conteo.
3) Navegación/scroll → `setActiveCard` y `ensureCardVisible`.
