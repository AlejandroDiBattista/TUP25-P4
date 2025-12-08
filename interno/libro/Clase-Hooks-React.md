# 📚 Clase Completa: Hooks de React (useState, useEffect y Custom Hooks)

>

## 1) ¿Qué son los Hooks y qué problema resuelven?

### Idea clave
Los **Hooks** son **funciones especiales de React** que permiten usar **estado** y **ciclo de vida** en **componentes funcionales**. Antes de los hooks (React 16.8), esas capacidades estaban ligadas a **componentes de clase**.

### ¿Qué problema resuelven?
- Evitan tener que usar clases para manejar estado y efectos.
- Facilitan **reutilizar lógica** entre componentes mediante **custom hooks**.
- Hacen el código **más corto**, **expresivo** y **fácil de testear**.

### Hooks fundamentales
- **`useState`**: estado local reactivo (provoca re-render al actualizarlo).
- **`useEffect`**: ejecutar **efectos secundarios** (lógica que sucede *después* del render y/o asociada al ciclo de vida).

---

## 2) ¿Por qué no usar variables normales ni ejecutar código directo?

### 2.1 Variables normales vs `useState`
```jsx
function Contador() {
  let numero = 0;
  const incrementar = () => {
    numero++;
    console.log("Nuevo valor:", numero);
  };
  return (
    <div>
      <p>El número es: {numero}</p>
      <button onClick={incrementar}>Incrementar</button>
    </div>
  );
}
```
**Problema**: `numero` cambia en memoria, pero **React no se entera** y **no re-renderiza**.  
**Solución**: usar `useState` para declarar que el valor afecta la UI.

```jsx
import { useState } from "react";

function Contador() {
  const [numero, setNumero] = useState(0);
  return (
    <div>
      <p>El número es: {numero}</p>
      <button onClick={() => setNumero((n) => n + 1)}>Incrementar</button>
    </div>
  );
}
```

### 2.2 Código directo vs `useEffect`
```jsx
function App() {
  // ❌ Se ejecutará en *cada* render
  fetch("/api/data").then((r) => r.json()).then(console.log);
  return <p>Hola</p>;
}
```
**Problemas**: múltiples peticiones innecesarias, sin control de *cuándo* corre ni *cómo limpiar* suscripciones/intervalos.  
**Solución**: `useEffect` controla **cuándo** corre un efecto y **cómo** limpiarlo.

```jsx
import { useEffect } from "react";

function App() {
  useEffect(() => {
    fetch("/api/data").then((r) => r.json()).then(console.log);
  }, []); // ✅ Solo una vez al montar
  return <p>Hola</p>;
}
```

---

## 3) `useState` — Fundamentos y casos de uso

### API
```jsx
const [valor, setValor] = useState(valorInicial);
```

### Casos típicos
1) **Contador (mínimo):**
```jsx
function Contador() {
  const [n, setN] = useState(0);
  return (
    <div>
      <p>{n}</p>
      <button onClick={() => setN((prev) => prev + 1)}>+1</button>
    </div>
  );
}
```

2) **Inicialización perezosa (costosa):**
```jsx
const [cache, setCache] = useState(() => computarInicialPesado());
```

3) **Actualización basada en estado previo:**
```jsx
setValor((prev) => prev + 1);
```

4) **Objetos/arrays (inmutabilidad):**
```jsx
const [user, setUser] = useState({ id: 1, name: "Ada" });
// actualizar
setUser((u) => ({ ...u, name: "Ada Lovelace" }));

const [items, setItems] = useState([]);
setItems((arr) => [...arr, { id: crypto.randomUUID() }]);
```

**Notas**:
- Múltiples `setState` en el mismo tick pueden **agruparse** (batching).
- El estado es **por render**; no lo leas inmediatamente tras `setState` esperando que ya cambió; usa la versión con función si dependés del valor previo.

---

## 4) `useEffect` — Fundamentos, dependencias y limpieza

### API
```jsx
useEffect(() => {
  // efecto
  return () => {
    // cleanup (opcional)
  };
}, [deps]);
```

### Cuándo corre
- **Sin deps**: corre en **cada** render (rara vez deseable).
- **`[]` vacío**: corre **una vez** al montar; cleanup al desmontar.
- **`[a, b]`**: corre cuando **cambia** alguna dependencia.

### Ejemplos mínimos
1) **Intervalo con cleanup**:
```jsx
useEffect(() => {
  const id = setInterval(() => console.log("tick"), 1000);
  return () => clearInterval(id); // limpieza al desmontar
}, []);
```

2) **Fetch inicial**:
```jsx
useEffect(() => {
  let ignore = false;
  let bajar =async () => {
    const r = await fetch("/api/users");
    const data = await r.json();
    if (!ignore) {
      // setData(data);
    }
  }
  bajar();
  return () => { ignore = true; }; // evita actualizar si se desmonta (versión simple)
}, []);
```

3) **Sincronizar con `localStorage`**:
```jsx
useEffect(() => {
  localStorage.setItem("theme", theme);
}, [theme]);
```

### Buenas prácticas y pitfalls
- **Lista completa de deps**: incluir todo lo que el efecto usa del scope.
- **Closures obsoletas**: si el efecto usa valores “viejos”, puede ser por deps incompletas.
```jsx
const [theme, setTheme] = useState(localStorage.getItem("theme") ?? "light");
useEffect(() => {
  localStorage.setItem("theme", theme);
}, [theme]);
```

### Buenas prácticas y pitfalls
- **Lista completa de deps**: incluir todo lo que el efecto usa del scope.  
- **Closures obsoletas**: si el efecto usa valores “viejos”, puede ser por deps incompletas.  
- **No hagas condicional el hook**: las llamadas a hooks deben tener **orden estable** entre renders.  
- **Efectos = sincronización** con el “mundo externo” (DOM, red, subscripciones). Lógica puramente derivada suele ir **antes** (en render) o en **memoización** (`useMemo`, `useCallback`).

> Nota: En **modo estricto** de React 18 (solo desarrollo), algunos efectos pueden montarse/desmontarse dos veces para detectar fallas de cleanup. No ocurre en producción.

---

## 5) Custom Hooks — Extraer y reutilizar lógica

### Reglas
1. El nombre comienza con `use...`.
2. **Pueden** usar otros hooks.
3. Devuelven valores/funciones para que los componentes consuman.

### Ejemplo didáctico: `useWindowWidth`
```jsx
import { useEffect, useState } from "react";

export function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return width;
}
```

**Uso:**
```jsx
function Demo() {
  const width = useWindowWidth();
  return <p>Ancho: {width}px</p>;
}
```

---

## 6) Custom Hook completo: `useFetch` (GET/POST, cancelación y anti-race)

> Versión robusta, con `AbortController`, control de **race conditions** y `refetch`.

```jsx
// useFetch.js
import { useEffect, useRef, useState, useCallback } from "react";

/**
 * useFetch(url, options)
 * @param {string} url
 * @param {object} options:
 *   - method, headers, body (pasan a fetch)
 *   - parser (por defecto: r => r.json())
 *   - immediate (default true)
 *   - deps (para re-disparo adicional)
 * @returns { data, error, loading, refetch }
 */
export function useFetch(
  url,
  {
    method = "GET",
    headers,
    body,
    parser = (r) => r.json(),
    immediate = true,
    deps = [],
  } = {}
) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(immediate);

  const abortRef = useRef(null);
  const requestIdRef = useRef(0);

  const refetch = useCallback(
    async (override = {}) => {
      if (abortRef.current) abortRef.current.abort();

      const controller = new AbortController();
      abortRef.current = controller;

      const currentId = ++requestIdRef.current;

      setLoading(true);
      setError(null);

      try {
        const resp = await fetch(override.url ?? url, {
          method,
          headers,
          body,
          signal: controller.signal,
          ...(override.options || {}),
        });

        if (!resp.ok) {
          throw new Error(`HTTP ${resp.status} ${resp.statusText}`);
        }

        const parse = override.parser ?? parser;
        const result = parse ? await parse(resp) : await resp.json();

        if (requestIdRef.current === currentId) {
          setData(result);
        }

        return result;
      } catch (err) {
        if (err.name === "AbortError") return;
        if (requestIdRef.current === currentId) setError(err);
        throw err;
      } finally {
        if (requestIdRef.current === currentId) setLoading(false);
      }
    },
    [url, method, headers, body, parser]
  );

  useEffect(() => {
    if (!immediate) return;
    refetch();
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, [refetch, immediate, ...deps]);

  return { data, error, loading, refetch };
}
```

**Uso mínimo:**
```jsx
// UsersList.jsx
import React from "react";
import { useFetch } from "./useFetch";

export default function UsersList() {
  const { data, error, loading, refetch } = useFetch(
    "https://jsonplaceholder.typicode.com/users"
  );

  if (loading) return <p>⏳ Cargando…</p>;
  if (error) return <p>❌ {error.message}</p>;

  return (
    <div>
      <button onClick={() => refetch()}>Refetch</button>
      <ul>
        {data?.slice(0, 5).map((u) => (
          <li key={u.id}>{u.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

---

## 7) Custom Hook especializado y **simple**: `useFetchJson` (GET JSON)

> Prioriza claridad didáctica: **sin** cancelación ni anti-race. Devuelve `{ data, error, loading, refetch }` y re-dispara al cambiar la `url`.

```jsx
// useFetchJson.js
import { useEffect, useState, useCallback } from "react";

/**
 * useFetchJson(url, { immediate = true })
 * - GET de una URL que devuelve JSON.
 * - Simple: sin AbortController ni lógica anti-race.
 */
export function useFetchJson(url, { immediate = true } = {}) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(immediate);

  const doFetch = useCallback(async (targetUrl) => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(targetUrl, {
        method: "GET",
        headers: { Accept: "application/json" },
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status} ${resp.statusText}`);
      const json = await resp.json();
      setData(json);
      return json;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback((nextUrl) => doFetch(nextUrl ?? url), [doFetch, url]);

  useEffect(() => {
    if (!immediate || !url) return;
    refetch();
  }, [url, immediate, refetch]);

  return { data, error, loading, refetch };
}
```

**Uso mínimo:**
```jsx
// PostsDemo.jsx
import React, { useState } from "react";
import { useFetchJson } from "./useFetchJson";

export default function PostsDemo() {
  const [url, setUrl] = useState("https://jsonplaceholder.typicode.com/posts");
  const { data, error, loading, refetch } = useFetchJson(url, { immediate: true });

  return (
    <div style={{ maxWidth: 640 }}>
      <h2>Posts</h2>
      <input
        style={{ width: "100%", padding: 8 }}
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <div style={{ display: "flex", gap: 8, margin: "12px 0" }}>
        <button onClick={() => refetch()}>Refetch</button>
        <button onClick={() => refetch("https://jsonplaceholder.typicode.com/users")}>
          Traer usuarios
        </button>
      </div>
      {loading && <p>⏳ Cargando…</p>}
      {error && <p style={{ color: "crimson" }}>❌ {error.message}</p>}
      {Array.isArray(data) && (
        <ul>
          {data.slice(0, 5).map((it) => (
            <li key={it.id}>{it.title || it.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

**Notas didácticas**:
- `useFetchJson` es ideal para **primer contacto** con fetch+hooks.
- Para producción, considerar la versión **`useFetch`** (con cancelación y anti-race), **caché** y **reintentos**.

---

## 8) Resumen ejecutable (mapa mental)

- **`useState`**: estado local que **provoca re-render** al actualizar.  
  - Lazy init (`useState(() => ...)`), updates basadas en previo, inmutabilidad con objetos/arrays.
- **`useEffect`**: efectos secundarios **después del render**.  
  - Montaje (`[]`), actualización por dependencias (`[a,b]`), cleanup (suscripciones/intervalos).
- **Custom hooks**: empaquetar y reutilizar lógica de estado/efectos.  
  - `useWindowWidth` (simple), `useFetch` (robusto), `useFetchJson` (simple).

---

## 9) Ejercicios propuestos (opcionales)

1) **Contador con historial**: guarda un arreglo con los últimos 5 valores.  
2) **Buscador**: input controlado + `useEffect` que hace fetch cuando cambia el término (debounce opcional).  
3) **Tema persistente**: `useState` + `localStorage` en `useEffect` (dark/light).  
4) **Hook `useDocumentTitle`**: sincroniza el `document.title` con una prop/estado.  
5) **Hook `useDebouncedValue`**: devuelve un valor “demorado” tras `n` ms (útil para búsquedas).

---

### Créditos y buenas prácticas
- Mantener efectos **enfocados** a sincronización con fuentes externas.
- Evitar lógica derivada pesada en efectos (preferir cálculo directo/memoización).
- Añadir **cleanup** siempre que se creen efectos con recursos vivos (subs, timers).

