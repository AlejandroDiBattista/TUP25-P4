'use client';

import { useState } from 'react';
import { Search, ShoppingCart, User, LogOut, Menu } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface HeaderProps {
  onSearch?: (query: string) => void;
  categorias?: string[];
  categoriaSeleccionada?: string;
  onCategoryChange?: (categoria: string) => void;
}

export default function Header({ 
  onSearch, 
  categorias = [],
  categoriaSeleccionada = 'todas',
  onCategoryChange
}: HeaderProps) {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch?.(value); // Búsqueda en tiempo real
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-blue-600">TiendaOnline</h1>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="w-full flex gap-2">
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pr-10"
                />
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              <select
                value={categoriaSeleccionada}
                onChange={(e) => onCategoryChange?.(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="todas">Todas las categorías</option>
                {categorias.map((categoria) => (
                  <option key={categoria} value={categoria} className="capitalize">
                    {categoria}
                  </option>
                ))}
              </select>
            </form>
          </div>

          {/* Navigation - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                      <User className="h-5 w-5" />
                      <span className="text-sm">{user.nombre}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href="/compras" className="w-full">
                        Mis Compras
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Cerrar Sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link href="/login">Iniciar Sesión</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Registrarse</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col space-y-4 mt-4">
                {user ? (
                  <>
                    <Button variant="outline" asChild className="justify-start">
                      <Link href="/compras">
                        Mis Compras
                      </Link>
                    </Button>
                    <Button variant="outline" onClick={handleLogout} className="justify-start">
                      <LogOut className="h-4 w-4 mr-2" />
                      Cerrar Sesión
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" asChild>
                      <Link href="/login">Iniciar Sesión</Link>
                    </Button>
                    <Button asChild>
                      <Link href="/register">Registrarse</Link>
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Search Bar - Mobile */}
        <div className="md:hidden pb-4 space-y-2">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Input
                type="text"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pr-10"
              />
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </form>
          <select
            value={categoriaSeleccionada}
            onChange={(e) => onCategoryChange?.(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="todas">Todas las categorías</option>
            {categorias.map((categoria) => (
              <option key={categoria} value={categoria} className="capitalize">
                {categoria}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
}