'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import useCartStore from '../store/cart';
import useAuthStore from '../store/auth';
import { API_URL } from '../config';

interface CartSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
    const { items, removeItem, updateQuantity, getTotals, itemCount, clearCart, syncWithBackend } = useCartStore();
    const { token } = useAuthStore();
    const [showConfirmClear, setShowConfirmClear] = useState(false);
    const [clearing, setClearing] = useState(false);
    const totals = getTotals();

    const handleClearCart = async () => {
        if (!token) {
            // Si no hay usuario, limpiar solo localmente
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

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div 
                className="fixed inset-0 bg-black bg-opacity-50 z-40"
                onClick={onClose}
            />
            
            {/* Sidebar */}
            <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col">
                {/* Header */}
                <div className="p-4 border-b">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-xl font-bold">
                            Carrito
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 text-2xl"
                        >
                            ✕
                        </button>
                    </div>
                    
                    {/* Botón Vaciar Carrito */}
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
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
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
                <div className="flex-1 overflow-y-auto p-4">
                    {items.length === 0 ? (
                        <div className="text-center py-12 text-gray-900 font-semibold">
                            <p className="text-4xl mb-4">🛒</p>
                            <p className="text-lg">Tu carrito está vacío</p>
                            <p className="text-sm mt-2">Agrega productos para empezar</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {items.map((item) => {
                                const stockDisponible = item.existencia || 0;
                                const alcanzoStock = item.cantidad >= stockDisponible;
                                
                                return (
                                    <div key={item.id} className="flex gap-4 border-b pb-4">
                                        {/* Imagen del producto */}
                                        <img
                                            src={item.imagen.startsWith('http') ? item.imagen : `${API_URL}/${item.imagen}`}
                                            alt={item.nombre || item.titulo}
                                            className="w-20 h-20 object-cover rounded"
                                        />
                                        
                                        {/* Detalles */}
                                        <div className="flex-1">
                                            <h3 className="font-bold text-sm mb-1 text-gray-900">
                                                {item.nombre || item.titulo}
                                            </h3>
                                            <p className="text-sm text-gray-900 font-semibold">
                                                ${item.precio.toFixed(2)}
                                            </p>
                                            <p className="text-xs text-gray-900 font-semibold">
                                                Stock disponible: {stockDisponible}
                                            </p>
                                            
                                            {/* Controles de cantidad */}
                                            <div className="flex items-center gap-2 mt-2">
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
                                                <span className="w-8 text-center font-semibold">{item.cantidad}</span>
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
                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    className="ml-auto text-red-500 text-sm hover:text-red-700"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                            
                                            {alcanzoStock && (
                                                <p className="text-xs text-orange-600 mt-1">
                                                    ⚠️ Stock máximo en carrito
                                                </p>
                                            )}
                                        </div>
                                        
                                        {/* Total del item */}
                                        <div className="text-right">
                                            <p className="font-semibold text-gray-900">
                                                ${(item.precio * item.cantidad).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer con totales */}
                {items.length > 0 && (
                    <div className="border-t p-4 bg-gray-50">
                        {/* Desglose de costos */}
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

                        {/* Botones de acción */}
                        <div className="space-y-2">
                            <Link
                                href="/finalizar-compra"
                                className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-blue-700"
                                onClick={onClose}
                            >
                                Finalizar Compra
                            </Link>
                            <button
                                onClick={onClose}
                                className="w-full border border-gray-300 py-2 rounded-lg hover:bg-gray-100"
                            >
                                Continuar Comprando
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
