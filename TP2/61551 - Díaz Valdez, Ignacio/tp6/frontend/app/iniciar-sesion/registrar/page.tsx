// Página legacy de registro. Redirige a /register
"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
export default function LegacyRegisterRedirect(){
  const router = useRouter();
  useEffect(()=>{ router.replace('/register'); },[router]);
  return <p className="p-4 text-sm">Redireccionando a /register...</p>;
}
