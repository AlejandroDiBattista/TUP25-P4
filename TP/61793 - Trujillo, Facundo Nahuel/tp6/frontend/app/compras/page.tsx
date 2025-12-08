"use client"

import { useEffect, useState } from 'react'
import { obtenerCompras } from '../services/compras'
import { useToast } from '../components/ToastProvider'
import Link from 'next/link'
import { Compra } from '../types'

export default function ComprasPage() {
  const [compras, setCompras] = useState<Compra[]>([])
  const [loading, setLoading] = useState(false)

  const toast = useToast()

  async function load() {
    setLoading(true)
    try {
      const data = await obtenerCompras()
      setCompras(data)
    } catch (e: any) {
      toast.show('Error cargando historial: ' + (e?.message || e), 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Mis compras</h1>
      {loading && <p>Cargando...</p>}
      {!loading && compras.length === 0 && <p>No tenés compras previas.</p>}
      <div className="space-y-4">
        {compras.map(c => (
          <div key={c.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
            <div>
              <p className="font-semibold">Compra #{c.id}</p>
              <p className="text-sm text-gray-600">Fecha: {new Date((c.fecha || 0) * 1000).toLocaleString()}</p>
              <p className="text-sm">Total: ${c.total.toFixed(2)} (Envio: ${c.envio?.toFixed(2) ?? '0.00'})</p>
            </div>
            <div>
              <Link href={`/compras/${c.id}`} className="bg-blue-600 text-white px-4 py-2 rounded">Ver detalle</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
