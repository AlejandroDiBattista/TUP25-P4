import { CarritoItem } from '../types';

interface CarritoItemProps {
  item: CarritoItem;
  onQuitar: (producto_id: number) => void;
}

export default function CarritoItemComponent({ item, onQuitar }: CarritoItemProps) {
  return (
    <div className="flex justify-between items-center border-b py-2">
      <span>{item.producto.titulo}</span>
      <span>Cantidad: {item.cantidad}</span>
      <span>${item.producto.precio * item.cantidad}</span>
      <button className="text-red-500" onClick={() => onQuitar(item.producto.id)}>Quitar</button>
    </div>
  );
}
