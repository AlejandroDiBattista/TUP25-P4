"use client";

import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";

export default function Carrito() {
    const { cart, loading, error, removeFromCart, increaseQuantity, decreaseQuantity, cancelCart } = useCart();
    const router = useRouter();

    if (loading) {
        return (
            <div className="border rounded-lg p-4 mt-16 text-center">
                <p>Cargando carrito...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="border rounded-lg p-4 mt-16 text-center bg-red-100 text-red-800">
                <p>Error al cargar el carrito: {error}</p>
            </div>
        );
    }

    if (!cart || cart.items.length === 0) {
        return (
            <div className="border rounded-lg p-4 mt-16 text-center">
                <h2 className="text-xl font-semibold mb-4 text-white">Carrito de Compras</h2>
                <p className="text-gray-600">Tu carrito está vacío.</p>
            </div>
        );
    }

    return (
        <div className="border rounded-lg p-4 mt-16 bg-black shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-center text-white">Carrito de Compras</h2>
            
            <div className="space-y-4 mb-6">
                {cart.items.map(item => (
                    <div key={item.producto.id} className="flex items-center justify-between border-b pb-2">
                        <div className="flex items-center gap-3">
                            <img src={item.producto.imagen} alt={item.producto.titulo} className="w-12 h-12 object-contain rounded" />
                            <div>
                                <p className="font-semibold text-sm text-white">{item.producto.titulo}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <button onClick={() => decreaseQuantity(item.producto.id)} className="bg-gray-200 w-6 h-6 rounded-full font-bold text-black">-</button>
                                    <span className="text-sm font-medium text-white">{item.cantidad}</span>
                                    <button 
                                        onClick={() => increaseQuantity(item.producto.id)} 
                                        className="bg-gray-200 w-6 h-6 rounded-full font-bold text-black disabled:bg-gray-100 disabled:text-gray-400"
                                        disabled={item.producto.existencia === 0}
                                    >+</button>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <p className="font-semibold text-sm text-white">${(item.producto.precio * item.cantidad).toFixed(2)}</p>
                            <button 
                                onClick={() => removeFromCart(item.producto.id)} 
                                className="text-red-500 hover:text-red-700 text-lg font-bold"
                                title="Eliminar producto">
                                &times;
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="space-y-2 text-sm text-gray-300 border-t border-gray-700 pt-4">
                <div className="flex justify-between"><span>Subtotal:</span> <span className="font-medium text-white">${cart.subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>IVA:</span> <span className="font-medium text-white">${cart.iva.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Envío:</span> <span className="font-medium text-white">${cart.costo_envio.toFixed(2)}</span></div>
                <div className="flex justify-between text-lg font-bold text-white mt-2"><span>Total:</span> <span>${cart.total.toFixed(2)}</span></div>
            </div>

            <div className="mt-6 flex flex-col gap-3">
                <button onClick={() => router.push('/checkout')} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                    Continuar compra
                </button>
                <button onClick={cancelCart} className="w-full bg-transparent text-gray-600 py-2 rounded-lg hover:bg-gray-200">
                    Cancelar
                </button>
            </div>
        </div>
    );
}