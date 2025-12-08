export default function ProductCard({
  p, onAdd
}: { p: any; onAdd: (id:number)=>void }) {
  const agotado = p.existencia <= 0;
  return (
    <div className="bg-white border rounded-xl p-4 shadow-sm">
      <div className="flex gap-4">
        <img src={`http://127.0.0.1:8000/${p.imagen}`} alt={p.titulo}
             className="w-40 h-28 object-contain rounded-md bg-gray-100" />
        <div className="flex-1">
          <h3 className="font-semibold text-lg leading-6">{p.titulo}</h3>
          <p className="text-sm text-slate-600">{p.descripcion}</p>
          <p className="text-xs text-slate-500 mt-2">Categoría: {p.categoria}</p>
        </div>
        <div className="w-36 text-right">
          <div className="font-semibold">${p.precio.toFixed(2)}</div>
          <div className="text-xs text-slate-500 mt-1">
            {agotado ? "Agotado" : `Disponible: ${p.existencia}`}
          </div>
          <button
            disabled={agotado}
            onClick={() => onAdd(p.id)}
            className={`mt-3 w-full rounded-md px-3 py-2 text-sm font-medium
              ${agotado ? "bg-slate-300 text-slate-500" : "bg-slate-900 text-white hover:bg-black"}`}>
            {agotado ? "Sin stock" : "Agregar al carrito"}
          </button>
        </div>
      </div>
    </div>
  );
}
