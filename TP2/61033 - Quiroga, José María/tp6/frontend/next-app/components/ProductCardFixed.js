export default function ProductCardFixed({p, onAdd}){
  // API base for serving images (can be overridden with NEXT_PUBLIC_API_URL)
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

  const outOfStock = p.existencia === 0 || p.existence === 0 || (p.existence === undefined && p.existencia === undefined && (p.stock === 0))
  const title = p.nombre || p.titulo || p.name || 'Sin nombre'
  const price = Number(p.precio ?? p.price ?? 0).toFixed(2)
  // Normalize raw image field and ignore string values 'undefined'/'null'
  const rawImagen = p.imagen || p.image || ''
  const imagenRaw = (typeof rawImagen === 'string' && (rawImagen === 'undefined' || rawImagen === 'null')) ? '' : rawImagen

  // Normalize image source:
  // - If it's a full URL (http/https), use as-is
  // - Otherwise strip leading slashes and join with API_BASE so it becomes: {API_BASE}/imagenes/0001.png
  const placeholder = '/placeholder.svg'
  let imageSrc = placeholder
  if (imagenRaw) {
    const isFullUrl = imagenRaw.startsWith('http://') || imagenRaw.startsWith('https://')
    if (isFullUrl) {
      imageSrc = imagenRaw
    } else {
      const normalized = imagenRaw.replace(/^\/+/, '')
      imageSrc = `${API_BASE}/${normalized}`
    }
  }

  return (
    <div className="bg-white rounded shadow p-4">
      { /* Image area */ }
      {imagenRaw ? (
        <img
          src={imageSrc}
          alt={title}
          className="w-full h-40 object-cover mb-3 rounded"
          loading="lazy"
          onError={(e)=> { e.currentTarget.onerror = null; e.currentTarget.src = placeholder }}
        />
      ) : (
        <img src={placeholder} alt="Sin imagen" className="w-full h-40 object-cover mb-3 rounded bg-gray-100" />
      )}

      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-gray-600">{p.descripcion}</p>
      <div className="flex items-center justify-between mt-3">
        <div className="text-lg font-bold text-red-600">${price}</div>
        <div>
          {outOfStock ? (
            <span className="text-red-500">Agotado</span>
          ) : (
            <button onClick={()=> onAdd(p)} className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors duration-150">Agregar</button>
          )}
        </div>
      </div>
    </div>
  )
}
