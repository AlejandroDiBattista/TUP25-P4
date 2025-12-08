'use client';

import React from 'react';

export type Producto = {
	id: number;
	titulo: string;
	descripcion: string;
	precio: number;
	categoria: string;
	existencias: number;
	imagen: string;
	agotado: boolean;
};

type Props = {
	producto: Producto;
	onAdd: (id: number) => void;
};

export const ProductCard: React.FC<Props> = ({ producto, onAdd }) => {
	return (
		<article className="flex flex-col rounded-xl border bg-white shadow-sm overflow-hidden">
			<div className="h-40 w-full overflow-hidden bg-slate-100 flex items-center justify-center">
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img
					src={producto.imagen}
					alt={producto.titulo}
					className="h-full object-contain"
				/>
			</div>
			<div className="flex flex-1 flex-col gap-2 p-4">
				<header>
					<h3 className="font-semibold text-slate-900 line-clamp-2">
						{producto.titulo}
					</h3>
					<p className="text-xs text-slate-500 mt-1">{producto.categoria}</p>
				</header>
				<p className="text-sm text-slate-600 line-clamp-3">{producto.descripcion}</p>
				<div className="mt-auto flex items-center justify-between pt-2">
					<div>
						<span className="text-lg font-bold">${producto.precio.toFixed(2)}</span>
						<p className="text-xs text-slate-500">
							Stock:{' '}
							{producto.agotado ? (
								<span className="text-red-600 font-semibold">Agotado</span>
							) : (
								producto.existencias
							)}
						</p>
					</div>
					<button
						className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white disabled:bg-slate-300"
						disabled={producto.agotado}
						onClick={() => onAdd(producto.id)}
					>
						Añadir
					</button>
				</div>
			</div>
		</article>
	);
};
