'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function CheckoutForm() {
  const router = useRouter();
  const [direccion, setDireccion] = useState('');
  const [tarjeta, setTarjeta] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const direccionLimpia = direccion.trim();
  const tarjetaLimpia = tarjeta.replace(/\s+/g, '');

    if (!direccionLimpia) {
      setError('La dirección es obligatoria.');
      return;
    }

    if (tarjetaLimpia.length !== 16) {
      setError('Ingresa los 16 dígitos de la tarjeta.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/carrito/finalizar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          direccion: direccionLimpia,
          tarjeta: tarjetaLimpia.slice(-4),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const message = typeof data?.detail === 'string' ? data.detail : 'No se pudo confirmar la compra.';
        throw new Error(message);
      }

      const compra = await response.json();
      router.push(`/mis-compras?compra=${compra.id}`);
      router.refresh();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Ocurrió un error inesperado.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
      <div className="space-y-1">
        <label htmlFor="direccion" className="text-sm font-medium text-slate-600">
          Dirección
        </label>
        <input
          id="direccion"
          name="direccion"
          type="text"
          required
          value={direccion}
          onChange={(event) => setDireccion(event.target.value)}
          placeholder="Calle 123, Ciudad"
          className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-4 focus:ring-slate-200"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="tarjeta" className="text-sm font-medium text-slate-600">
          Tarjeta
        </label>
        <input
          id="tarjeta"
          name="tarjeta"
          type="text"
          inputMode="numeric"
          autoComplete="cc-number"
          required
          value={tarjeta.replace(/(\d{4})(?=\d)/g, '$1 ').trim()}
          onChange={(event) => {
            const soloDigitos = event.target.value.replace(/\D/g, '').slice(0, 16);
            setTarjeta(soloDigitos);
          }}
          placeholder="0000 0000 0000 0000"
          maxLength={19}
          className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-4 focus:ring-slate-200"
        />
        <p className="text-xs text-slate-400">Ingresa los 16 dígitos de la tarjeta.</p>
      </div>

      {error ? <p className="text-sm text-red-500">{error}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="h-11 w-full rounded-lg bg-slate-900 text-sm font-semibold text-white transition hover:bg-slate-900/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? 'Confirmando...' : 'Confirmar compra'}
      </button>
    </form>
  );
}
