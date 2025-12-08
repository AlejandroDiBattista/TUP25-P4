import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AuthFormProps {
  type: "login" | "registro";
  onSubmit: (email: string, password: string) => void;
}

export default function AuthForm({ type, onSubmit }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(email, password);
      }}
      className="space-y-4 max-w-sm mx-auto mt-10"
    >
      <h2 className="text-xl font-bold text-center">
        {type === "login" ? "Iniciar sesión" : "Registrarse"}
      </h2>
      <Input
        type="email"
        placeholder="Correo electrónico"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button type="submit" className="w-full">
        {type === "login" ? "Ingresar" : "Crear cuenta"}
      </Button>
    </form>
  );
}