"use client";

import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    Cookies.remove('token');

    router.push('/');

    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className="text-sm font-medium text-gray-700 hover:text-pink-500 transition-colors"
    >
      Salir
    </button>
  );
}