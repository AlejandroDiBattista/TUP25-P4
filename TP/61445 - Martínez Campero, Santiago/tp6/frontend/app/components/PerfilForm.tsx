'use client';

import { useState } from 'react';
import { UsuarioData, UsuarioUpdate, actualizarUsuario } from '@/app/services/usuarios';
import { useToast } from '@/app/hooks/useToast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface PerfilFormProps {
  usuario: UsuarioData;
  onActualizado?: (usuario: UsuarioData) => void;
}

export default function PerfilForm({ usuario, onActualizado }: PerfilFormProps) {
  const { agregarToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    nombre: usuario.nombre || '',
    telefono: usuario.telefono || '',
    direccion: usuario.direccion || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!formData.nombre.trim()) {
        throw new Error('El nombre es requerido');
      }

      if (formData.nombre.length < 3) {
        throw new Error('El nombre debe tener al menos 3 caracteres');
      }

      const datosActualizacion: UsuarioUpdate = {
        nombre: formData.nombre,
        telefono: formData.telefono || undefined,
        direccion: formData.direccion || undefined,
      };

      const usuarioActualizado = await actualizarUsuario(datosActualizacion);
      agregarToast('Perfil actualizado correctamente', 'success', 3000);
      
      if (onActualizado) {
        onActualizado(usuarioActualizado);
      }


      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al actualizar el perfil';
      setError(mensaje);
      agregarToast(mensaje, 'error', 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mi Perfil</CardTitle>
        <CardDescription>Actualiza tu información personal</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Mensaje de Error */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Mensaje de Éxito */}
          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              {success}
            </div>
          )}

          {/* Email (Solo lectura) */}
          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input
              id="email"
              type="email"
              value={usuario.email}
              disabled
              className="bg-gray-50 cursor-not-allowed"
            />
            <p className="text-sm text-gray-500">El correo no puede ser modificado</p>
          </div>

          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre Completo *</Label>
            <Input
              id="nombre"
              name="nombre"
              type="text"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Tu nombre completo"
              disabled={isLoading}
              required
            />
          </div>

          {/* Teléfono */}
          <div className="space-y-2">
            <Label htmlFor="telefono">Teléfono</Label>
            <Input
              id="telefono"
              name="telefono"
              type="tel"
              value={formData.telefono}
              onChange={handleChange}
              placeholder="+54 (ejemplo)"
              disabled={isLoading}
            />
          </div>

          {/* Dirección */}
          <div className="space-y-2">
            <Label htmlFor="direccion">Dirección</Label>
            <Input
              id="direccion"
              name="direccion"
              type="text"
              value={formData.direccion}
              onChange={handleChange}
              placeholder="Tu domicilio"
              disabled={isLoading}
            />
          </div>

          {/* Información Adicional */}
          {usuario.fecha_registro && (
            <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
              <p>Miembro desde: {new Date(usuario.fecha_registro).toLocaleDateString('es-AR')}</p>
            </div>
          )}

          {/* Botón Guardar */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
