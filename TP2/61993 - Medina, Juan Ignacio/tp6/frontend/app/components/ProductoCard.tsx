export default function ProductoCard({ producto }) {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition">
      <img
        src={producto.imagen || "/placeholder.png"}
        alt={producto.nombre}
        className="w-full h-48 object-cover rounded-md mb-4"
      />
      <h3 className="text-lg font-semibold">{producto.nombre}</h3>
      <p className="text-gray-600">${producto.precio}</p>
    </div>
  );
}
