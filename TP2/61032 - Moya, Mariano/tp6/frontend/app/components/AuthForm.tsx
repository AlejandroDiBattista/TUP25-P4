import React, { useState } from "react";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";

interface Usuario {
  usuario_id: number;
  nombre: string;
  email: string;
  access_token?: string;
  token_type?: string;
}

interface AuthFormProps {
  onAuthSuccess: (token: string, user: Usuario) => void;
  initialMode?: "login" | "register";
  onRegisterSuccess?: () => void;
  onRequestLogin?: () => void;
  onRequestRegister?: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onAuthSuccess, initialMode = "login", onRegisterSuccess, onRequestLogin, onRequestRegister }) => {
  const [isLogin, setIsLogin] = useState(initialMode === "login");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const endpoint = isLogin ? "/iniciar-sesion" : "/registrar";
      const body = isLogin
        ? { email, password }
        : { nombre, email, password };
      const res = await fetch(
        `http://localhost:8000${endpoint}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.mensaje || "Error");
      if (isLogin) {
        onAuthSuccess(data.access_token, data);
      } else {
        if (onRegisterSuccess) {
          onRegisterSuccess();
        } else {
          setIsLogin(true);
        }
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error desconocido");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div>
            <Label>Nombre</Label>
            <Input type="text" placeholder="Tu nombre" value={nombre} onChange={e => setNombre(e.target.value)} required />
          </div>
        )}
        <div>
          <Label>Email</Label>
          <Input type="email" placeholder="tu@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div>
          <Label>Contraseña</Label>
          <Input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        {error && <div className="rounded bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">{error}</div>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Procesando..." : isLogin ? "Ingresar" : "Registrar"}
        </Button>
      </form>
      <div className="mt-4 text-center">
        <button
          className="text-gray-900 hover:text-black underline"
          onClick={(e) => {
            e.preventDefault();
            if (isLogin) {
              if (onRequestRegister) {
                onRequestRegister();
              } else {
                setIsLogin(false);
              }
            } else {
              if (onRequestLogin) {
                onRequestLogin();
              } else {
                setIsLogin(true);
              }
            }
          }}
        >
          {isLogin ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
        </button>
      </div>
    </div>
  );
};
