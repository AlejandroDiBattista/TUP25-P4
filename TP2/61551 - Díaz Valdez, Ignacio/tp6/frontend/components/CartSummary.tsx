export default function CartSummary() {
  return (
    <aside className="border rounded p-3">
      <h3 className="font-semibold mb-2">Resumen</h3>
      <p className="text-sm text-gray-600">No hay items.</p>
      <button className="mt-3 bg-green-600 text-white rounded px-3 py-1 text-sm" disabled>Finalizar compra</button>
    </aside>
  );
}
