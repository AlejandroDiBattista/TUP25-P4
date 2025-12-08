'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import useCartStore from '../store/cart';
import useAuthStore from '../store/auth';
import { API_URL } from '../config';

export default function CartPanel() {
    const { items, removeItem, updateQuantity, getTotals, itemCount, clearCart, syncWithBackend } = useCartStore();
    const { token } = useAuthStore();
    const [showConfirmClear, setShowConfirmClear] = useState(false);
    const [clearing, setClearing] = useState(false);
    const totals = getTotals();

    const handleClearCart = async () => {
        if (!token) {
            clearCart();
            setShowConfirmClear(false);
            return;
        }

        setClearing(true);
        try {
            const response = await fetch(`${API_URL}/carrito`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                await syncWithBackend();
                clearCart();
                setShowConfirmClear(false);
            } else {
                alert('Error al vaciar el carrito');
            }
        } catch (error) {
            console.error('Error al vaciar carrito:', error);
            alert('Error al vaciar el carrito');
        } finally {
            setClearing(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-4 sticky top-4 h-fit max-h-[calc(100vh-2rem)] overflow-y-auto">
            {/* Header */}
            <div className="mb-4 pb-4 border-b">
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                    Carrito
                </h2>
                
                {items.length > 0 && (
                    <button
                        onClick={() => setShowConfirmClear(true)}
                        className="w-full bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                    >
                        🗑️ Vaciar carrito
                    </button>
                )}
            </div>

            {/* Modal de confirmación */}
            {showConfirmClear && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
                        <h3 className="text-lg font-bold mb-2 text-gray-900">¿Vaciar carrito?</h3>
                        <p className="text-gray-900 font-semibold mb-6">
                            Se eliminarán todos los productos del carrito. Esta acción no se puede deshacer.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirmClear(false)}
                                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-semibold"
                                disabled={clearing}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleClearCart}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold"
                                disabled={clearing}
                            >
                                {clearing ? 'Vaciando...' : 'Sí, vaciar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Items del carrito */}
            <div className="space-y-4 mb-4">
                {items.length === 0 ? (
                    <div className="text-center py-8 text-gray-900 font-semibold">
                        <p className="text-4xl mb-2">🛒</p>
                        <p className="text-sm">Tu carrito está vacío</p>
                    </div>
                ) : (
                    items.map((item) => {
                        const stockDisponible = item.existencia || 0;
                        const alcanzoStock = item.cantidad >= stockDisponible;
                        
                        return (
                            <div key={item.id} className="pb-4 border-b">
                                {/* Imagen y nombre */}
                                <div className="flex gap-3 mb-2">
                                    <img
                                        src={item.imagen.startsWith('http') ? item.imagen : `${API_URL}/${item.imagen}`}
                                        alt={item.nombre || item.titulo}
                                        className="w-16 h-16 object-cover rounded"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-sm mb-1 text-gray-900 truncate">
                                            {item.nombre || item.titulo}
                                        </h3>
                                        <p className="text-sm text-gray-900 font-semibold">
                                            ${item.precio.toFixed(2)}
                                        </p>
                                        <p className="text-xs text-gray-900 font-semibold">
                                            Stock: {stockDisponible}
                                        </p>
                                    </div>
                                </div>
                                
                                {/* Controles */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => {
                                                if (item.cantidad > 1) {
                                                    updateQuantity(item.id, item.cantidad - 1)
                                                }
                                            }}
                                            disabled={item.cantidad <= 1}
                                            className={`w-7 h-7 border rounded ${
                                                item.cantidad <= 1 
                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                                    : 'hover:bg-gray-100'
                                            }`}
                                        >
                                            -
                                        </button>
                                        <span className="w-8 text-center font-semibold text-gray-900">{item.cantidad}</span>
                                        <button
                                            onClick={() => {
                                                if (!alcanzoStock) {
                                                    updateQuantity(item.id, item.cantidad + 1)
                                                } else {
                                                    alert(`No hay más stock disponible. Stock máximo: ${stockDisponible}`)
                                                }
                                            }}
                                            disabled={alcanzoStock}
                                            className={`w-7 h-7 border rounded ${
                                                alcanzoStock 
                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                                    : 'hover:bg-gray-100'
                                            }`}
                                            title={alcanzoStock ? 'Stock máximo alcanzado' : 'Aumentar cantidad'}
                                        >
                                            +
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-gray-900">
                                            ${(item.precio * item.cantidad).toFixed(2)}
                                        </span>
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="text-red-500 text-sm hover:text-red-700"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                                
                                {alcanzoStock && (
                                    <p className="text-xs text-orange-600 mt-1">
                                        ⚠️ Stock máximo en carrito
                                    </p>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Totales y botones */}
            {items.length > 0 && (
                <div className="border-t pt-4">
                    {/* Desglose */}
                    <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm text-gray-900 font-semibold">
                            <span>Subtotal:</span>
                            <span>${totals.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-900 font-semibold">
                            <span>IVA:</span>
                            <span>${totals.iva.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-900 font-semibold">
                            <span>Envío:</span>
                            <span>
                                {totals.envio === 0 ? (
                                    <span className="text-green-600 font-bold">¡Gratis!</span>
                                ) : (
                                    `$${totals.envio.toFixed(2)}`
                                )}
                            </span>
                        </div>
                        {totals.subtotal < 1000 && totals.subtotal > 0 && (
                            <p className="text-xs text-gray-900 font-semibold">
                                💡 Agrega ${(1000 - totals.subtotal).toFixed(2)} más para envío gratis
                            </p>
                        )}
                        <div className="flex justify-between font-bold text-lg border-t pt-2 text-gray-900">
                            <span>Total:</span>
                            <span>${totals.total.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Botón de compra */}
                    <Link
                        href="/finalizar-compra"
                        className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-blue-700 mb-2"
                    >
                        Finalizar Compra
                    </Link>
                </div>
            )}
        </div>
    );
}
