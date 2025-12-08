"use client";

import { useState } from "react";
import { z } from "zod";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const datosEnvioSchema = z.object({
  direccion: z.string().min(6, "Ingresá una dirección válida"),
  tarjeta: z
    .string()
    .min(12, "Debe tener al menos 12 dígitos")
    .max(19, "Demasiados dígitos"),
});

type DatosEnvioProps = {
  onConfirmar: (payload: { direccion: string; tarjeta: string }) => Promise<void>;
  loading: boolean;
};

export default function DatosEnvio({ onConfirmar, loading }: DatosEnvioProps) {
  const [direccion, setDireccion] = useState("");
  const [tarjeta, setTarjeta] = useState("");
  const [error, setError] = useState<string | null>(null);

  const manejarSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const validacion = datosEnvioSchema.safeParse({ direccion, tarjeta });
    if (!validacion.success) {
      const firstError = validacion.error.issues[0]?.message ?? "Datos inválidos";
      setError(firstError);
      return;
    }

    await onConfirmar({ direccion, tarjeta });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Datos de envío</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={manejarSubmit}>
          <div className="space-y-2">
            <Label htmlFor="direccion">Dirección</Label>
            <Input
              id="direccion"
              placeholder="Av. Siempre Viva 742"
              value={direccion}
              onChange={(event) => setDireccion(event.target.value)}
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tarjeta">Tarjeta</Label>
            <Input
              id="tarjeta"
              placeholder="XXXX XXXX XXXX 1234"
              value={tarjeta}
              onChange={(event) => setTarjeta(event.target.value)}
              disabled={loading}
            />
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <CardFooter className="px-0">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Procesando..." : "Confirmar compra"}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}