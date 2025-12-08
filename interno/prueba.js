import React, { useState, useEffect } from "react";
function useFetch(url){
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);   
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(url);
                const json = await response.json();
                setData(json);
            } catch (err) {
                setError(err);
            }
        };
        fetchData();
    }, [url]);
    return { data, error };
}
// Persistencia simple en localStorage
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const  stored = localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value]);

  return [value, setValue];
}

// Lista con persistencia usando la key indicada
function useList(storageKey, inicial=[]) {
  const [list, setList] = useLocalStorage( storageKey, inicial);

  const add = (item) => 
    setList((prev) => [...prev, item]);

  const remove = (index) => 
    setList((prev) => prev.filter((_, i) => i !== index));

  const update = (index, newItem) =>
    setList((prev) => prev.map((item, i) => (i === index ? { ...item, ...newItem } : item)));

  const clear = () => 
    setList([]);

  return { list, add, remove, update, clear };
}

// Componente de ejemplo que usa la lista persistente
export default function Prueba() {
  const initial = [
    { name: "Ada",  age: 30 },
    { name: "Alan", age: 42 },
  ];

  const { list, add, remove, update, clear } = useList("prueba:list", initial);

  const [nombre, setNombre] = useState("");
  const [edad, setEdad] = useState("");

  const handleAdd = () => {
    const trimmed = nombre.trim();
    if (!trimmed) return;
    const ageNum = Number(edad);
    add({ name: trimmed, age: Number.isFinite(ageNum) ? ageNum : 0 });
    setNombre("");
    setEdad("");
  };

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <input
          placeholder="Edad" style={{ width: 80 }}
          type="number" value={edad}
          onChange={(e) => setEdad(e.target.value)}
        />
        <button onClick={handleAdd}>Agregar</button>
        <button onClick={clear}>Vaciar</button>
      </div>

      <hr />

      {list.map((item, index) => (
        <div
          key={index}
          style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}
        >
          <span>
            {item.name} ({Number(item.age) || 0} años)
          </span>
          <button onClick={() => update(index, { age: (Number(item.age) || 0) + 1 })}>
            Cumplir años
          </button>
          <button onClick={() => remove(index)}>Eliminar</button>
        </div>
      ))}
    </div>
  );
}

function useForm(initial = {}){
    const [datos, setDatos] = useState(() => initial)

    const inferLabel = (fieldName) =>
      String(fieldName)
        .replace(/([A-Z])/g, " $1")
        .replace(/[_-]+/g, " ")
        .trim()
        .replace(/\s+/g, " ")
        .replace(/^./, (c) => c.toUpperCase())

    function register(name, props = {}){
        const current = datos?.[name]
        const { options } = props
        const inferredType = props.type ?? (
            Array.isArray(options) ? 'radio'
            : typeof current === 'boolean' ? 'checkbox'
            : typeof current === 'number' ? 'number'
            : 'text'
        )

        const label = props.label ?? inferLabel(name)

        const handleChange = (e) => {
            const t = e.target
            setDatos(prev => {
                const prevVal = prev[name]
                let next
                if (t.type === 'checkbox') {
                    next = t.checked
                } else if (t.type === 'number' && typeof prevVal === 'number') {
                    next = t.value === '' ? '' : Number(t.value)
                } else {
                    next = t.value
                }
                return { ...prev, [name]: next }
            })
        }

        const base = { ...props, name, type: inferredType, onChange: handleChange, label }

        if (inferredType === 'checkbox') {
            return { ...base, checked: Boolean(current) }
        }
        if (inferredType === 'radio') {
            // Para radios, el value es por opción; dejamos el control al consumidor
            return base
        }
        return { ...base, value: current ?? "" }
    }

    function onSubmit(e){
        e.preventDefault()
        const form = e.target
        const nuevo = {}
        for(const c in datos){
            const el = form[c]
            if (!el) continue
            const curr = datos[c]
            if (typeof curr === 'boolean') {
                nuevo[c] = !!el.checked
            } else if (typeof curr === 'number') {
                const v = el.value
                nuevo[c] = v === '' ? '' : Number(v)
            } else {
                nuevo[c] = el.value 
            }
        }
        setDatos(nuevo)
    }

    function onCancel(){
        setDatos(initial)
    }
    
    return { data: datos, register, onSubmit, onCancel }
}
