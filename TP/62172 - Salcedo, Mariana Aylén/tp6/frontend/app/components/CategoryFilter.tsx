'use client';

import { ChangeEvent } from 'react';

interface CategoryFilterProps {
  value: string;
  onChange: (value: string) => void;
}

const categorias = [
  { value: 'todas', label: 'Todas las categorías' },
  { value: 'Ropa de hombre', label: 'Ropa de hombre' },
  { value: 'Ropa de mujer', label: 'Ropa de mujer' },
  { value: 'Joyería', label: 'Joyería' },
  { value: 'Electrónica', label: 'Electrónica' },
];

export default function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  return (
    <select
      value={value}
      onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    >
      {categorias.map((cat) => (
        <option key={cat.value} value={cat.value}>
          {cat.label}
        </option>
      ))}
    </select>
  );
}
