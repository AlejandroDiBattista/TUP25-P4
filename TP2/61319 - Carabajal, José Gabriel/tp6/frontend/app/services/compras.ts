const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function getCompras(usuarioId: number) {
    const res = await fetch(`${API_URL}/compras?usuario_id=${usuarioId}`, {
        cache: 'no-store',
    });
    if (!res.ok) throw new Error('No se pudieron cargar las compras');
    return res.json() as Promise<import('../types').CompraResumen[]>;
}

export async function getCompraById(usuarioId: number, compraId: number) {
    const res = await fetch(`${API_URL}/compras/${compraId}?usuario_id=${usuarioId}`, {
        cache: 'no-store',
    });
    if (!res.ok) throw new Error('No se pudo cargar el detalle de la compra');
    return res.json() as Promise<import('../types').CompraDetalle>;
}
