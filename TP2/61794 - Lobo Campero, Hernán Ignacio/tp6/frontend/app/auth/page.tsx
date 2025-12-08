'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Login from '../components/Login';
import Registro from '../components/Registro';

export default function AuthPage() {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<'login' | 'registro'>('login');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'registro') {
      setMode('registro');
    } else {
      setMode('login');
    }
  }, [searchParams]);

  return (
    <div>
      {mode === 'login' ? (
        <Login onRegistroClick={() => setMode('registro')} />
      ) : (
        <Registro onLoginClick={() => setMode('login')} />
      )}
    </div>
  );
}
