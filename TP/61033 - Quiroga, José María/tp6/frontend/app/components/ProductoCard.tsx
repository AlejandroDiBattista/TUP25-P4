interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  existencia: number;
}

export default function ProductoCard({ producto }: { producto: Producto }) {
  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h2 className="text-lg font-semibold">{producto.nombre}</h2>
      <p className="text-gray-600">{producto.descripcion}</p>
      <p className="text-gray-900 font-bold mt-2">${producto.precio}</p>
      {producto.existencia > 0 ? (
        <button className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">
          Agregar al carrito
        </button>
      ) : (
        <span className="text-red-500">Agotado</span>
      )}
    </div>
  );
}
