import React from "react";

interface CategorySelectProps {
  value: string;
  onChange: (value: string) => void;
  categories: string[];
}

export default function CategorySelect({ value, onChange, categories }: CategorySelectProps) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
    >
      <option value="">Todas las categorías</option>
      {categories.map(cat => (
        <option key={cat} value={cat}>{cat}</option>
      ))}
    </select>
  );
}
