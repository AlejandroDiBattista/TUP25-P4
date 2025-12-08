"use client";

import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { finalizarCompra } from '@/services/api';

export default function CheckoutPage() {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const { cart, loading: cartLoading, fetchCart } = useCart();
    const router = useRouter();

    const [direccion, setDireccion] = useState('');
    const [tarjeta, setTarjeta] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [purchaseStatus, setPurchaseStatus] = useState<'pending' | 'success' | 'error'>('pending');

    // Proteger la ruta: si no está autenticado, redirigir al login
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.replace('/login');
        }
    }, [isAuthenticated, authLoading, router]);

    const handleTarjetaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Permitir solo dígitos y limitar la longitud a 16
        const value = e.target.value.replace(/\D/g, ''); // Elimina cualquier caracter que no sea un dígito
        setTarjeta(value.slice(0, 16)); // Limita la cadena a 16 caracteres
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!direccion || !tarjeta) {
            setError('Por favor, completa todos los datos de envío.');
            return;
        }
        // Simple validación de tarjeta (16 dígitos)
        if (!/^\d{16}$/.test(tarjeta.replace(/\s/g, ''))) {
            setError('El número de tarjeta debe contener 16 dígitos.');
            return;
        }

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error("No autenticado");

            await finalizarCompra({ direccion, tarjeta }, token);
            setPurchaseStatus('success');
            await fetchCart(); // Refrescar el carrito (que ahora estará vacío)

        } catch (err: any) {
            const errorMessage = err.message || 'Ocurrió un error al procesar la compra.';
            setError(errorMessage);
            setPurchaseStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (authLoading || cartLoading) {
        return <p className="text-center mt-10">Cargando...</p>;
    }

    // --- Vista de Éxito o Error después de intentar la compra ---
    // Esta comprobación DEBE ir ANTES de la del carrito vacío.
    if (purchaseStatus !== 'pending') {
        return (
            <div className="text-center mt-20">
                {purchaseStatus === 'success' ? (
                    <div className="bg-green-100 text-green-800 p-6 rounded-lg shadow-md inline-block">
                        <h1 className="text-2xl font-bold">¡Compra realizada con éxito!</h1>
                        <p className="mt-2">Puedes ver el detalle en tu historial de compras.</p>
                        <button onClick={() => router.push('/')} className="mt-6 bg-blue-500 text-white py-2 px-6 rounded hover:bg-blue-600">
                            Volver a ver los productos
                        </button>
                    </div>
                ) : (
                    <div className="bg-red-100 text-red-800 p-6 rounded-lg shadow-md inline-block">
                        <h1 className="text-2xl font-bold">Hubo un error</h1>
                        <p className="mt-2">{error}</p>
                        <button onClick={() => router.push('/')} className="mt-6 bg-blue-500 text-white py-2 px-6 rounded hover:bg-blue-600">
                            Volver a ver los productos
                        </button>
                    </div>
                )}
            </div>
        );
    }

    if (!cart || cart.items.length === 0) {
        return (
            <div className="text-center mt-10">
                <h1 className="text-2xl font-bold mb-4">Tu carrito está vacío</h1>
                <p>No puedes finalizar una compra sin productos en el carrito.</p>
                <button onClick={() => router.push('/')} className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
                    Volver a los productos
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-4xl mt-10">
            <h1 className="text-3xl font-bold mb-8 text-center">Finalizar Compra</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Columna de Resumen */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-semibold mb-6 border-b pb-4 text-black">Resumen del carrito</h2>
                    {cart.items.map(item => (
                        <div key={item.producto.id} className="flex justify-between items-center mb-3">
                            <span className="text-black">{item.producto.titulo} (x{item.cantidad})</span>
                            <span className="font-medium text-black">${(item.producto.precio * item.cantidad).toFixed(2)}</span>
                        </div>
                    ))}
                    <div className="border-t pt-4 mt-4 space-y-2 text-gray-800">
                        <div className="flex justify-between"><span>Subtotal:</span> <span>${cart.subtotal.toFixed(2)}</span></div>
                        <div className="flex justify-between"><span>IVA:</span> <span>${cart.iva.toFixed(2)}</span></div>
                        <div className="flex justify-between"><span>Envío:</span> <span>${cart.costo_envio.toFixed(2)}</span></div>
                        <div className="flex justify-between text-xl font-bold mt-2"><span>Total a pagar:</span> <span>${cart.total.toFixed(2)}</span></div>
                    </div>
                </div>

                {/* Columna de Datos de Envío */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-semibold mb-6 text-black">Datos de envío</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="direccion" className="block text-sm font-medium text-gray-700">Dirección</label>
                            <input id="direccion" type="text" value={direccion} onChange={e => setDireccion(e.target.value)} className="w-full mt-1 p-2 border rounded-md text-black" required />
                        </div>
                        <div>
                            <label htmlFor="tarjeta" className="block text-sm font-medium text-gray-700">Tarjeta (16 dígitos)</label>
                            <input id="tarjeta" type="text" value={tarjeta} onChange={handleTarjetaChange} placeholder="**** **** **** ****" className="w-full mt-1 p-2 border rounded-md text-black" required />
                        </div>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400">
                            {isSubmitting ? 'Procesando...' : 'Confirmar compra'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}