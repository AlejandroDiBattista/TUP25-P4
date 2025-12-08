'use client';

import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { ChangeEvent } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
      <Input
        type="text"
        placeholder="Buscar productos..."
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        className="pl-10"
      />
    </div>
  );
}
