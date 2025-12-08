// Página legacy para compatibilidad. Redirige a /login
"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
export default function LegacyLoginRedirect(){
  const router = useRouter();
  useEffect(()=>{ router.replace('/login'); },[router]);
  return <p className="p-4 text-sm">Redireccionando a /login...</p>;
}
